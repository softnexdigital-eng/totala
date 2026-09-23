/**
 * Public (no-auth) endpoint used by the landing page "Book Now" modal.
 *
 * Flow:
 *  1. Validate the patient + service details submitted by the visitor.
 *  2. Forward the request to the backend `POST /api/bookings` endpoint, which
 *     reuses an existing Patient profile (matched by phone) or creates a new
 *     one, then links the booking request to that patient (+ agent).
 *
 * Patient + booking data is persisted on the real backend (BACKEND_URL),
 * following the same no-auth pattern used by the existing `/api/public-agents`
 * route. The request reaches the Super Admin via the bookings list.
 */
import { NextResponse } from 'next/server';
import { validatePhone } from '@/lib/validation';

const BACKEND = process.env.BACKEND_URL;

/**
 * Safe backend JSON fetch that never throws.
 *
 * Returns the parsed body for successful *and* failed JSON responses so the
 * caller can forward the real backend error message. `data` is `null` for
 * non-JSON bodies (e.g. an HTML error page) and for unreachable backends, where
 * `status` is reported as `0`.
 */
async function backendJson(
  input: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      },
      cache: 'no-store',
    });
    const contentType = res.headers.get('content-type') || '';
    // A non-JSON body (e.g. an HTML error page) is never a usable API response.
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
    // Parse the body even for non-2xx responses so the real backend message
    // (validation error / not found) can be shown instead of a generic
    // "please try again".
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export async function POST(req: Request) {
  try {
    if (!BACKEND) {
      return NextResponse.json(
        { success: false, message: 'Backend URL is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      agentId,
      serviceNeeded,
      preferredDate,
      preferredTime,
      hospital,
      bookingReason,
      additionalNote,
      patient,
    } = body || {};

    if (!patient || !patient.name || !patient.phone || !patient.age || !patient.address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Patient name, phone, age and address are required',
        },
        { status: 400 }
      );
    }

    if (!serviceNeeded) {
      return NextResponse.json(
        { success: false, message: 'Service needed is required' },
        { status: 400 }
      );
    }

    const phone = String(patient.phone || '').replace(/\s/g, '');
    const age = Number(patient.age);

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid phone number' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(age) || age <= 0 || age > 130) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid age' },
        { status: 400 }
      );
    }

    // The patient profile is resolved (or auto-created) by the backend while it
    // stores the booking: `/api/patients` needs an admin session, which a public
    // visitor does not have, so that lookup belongs on the backend.
    //
    // Create the booking request and link it to the resolved patient.
    const bookingPayload = {
      patientId: patient.patientId || null,
      agentId: agentId || null,
      // Keep `serviceType` for backend compatibility; add a dedicated field too.
      serviceType: serviceNeeded,
      serviceNeeded,
      patientName: patient.name,
      patientPhone: phone,
      patientAddress: patient.address,
      age,
      gender: patient.gender || undefined,
      date: preferredDate,
      time: preferredTime,
      hospital: hospital || undefined,
      // Send the individual fields as well so the dashboard keeps the exact
      // reason / note the visitor typed (the combined `notes` string is kept
      // for backwards compatibility with the appointment-style payload).
      bookingReason: bookingReason || undefined,
      additionalNote: additionalNote || undefined,
      notes: [
        `Service Needed: ${serviceNeeded}`,
        bookingReason ? `Reason / Details: ${bookingReason}` : null,
        additionalNote ? `Additional Note: ${additionalNote}` : null,
        agentId ? `Agent: ${agentId}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      status: 'PENDING',
    };

    const booking = await backendJson(`${BACKEND}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });

    if (!booking.ok) {
      return NextResponse.json(
        {
          success: false,
          // Prefer the backend's own message so validation problems stay visible
          // instead of always showing a generic "please try again".
          message:
            booking.data?.message ||
            booking.data?.error ||
            (booking.status === 0
              ? 'Could not reach the booking service. Please try again.'
              : 'Failed to submit booking request. Please try again.'),
        },
        { status: booking.status || 502 }
      );
    }

    // The backend returns the stored booking, echoing the linked patient and
    // `autoCreatedPatient` so the UI can confirm what happened.
    const result = booking.data?.data || booking.data || {};

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully!',
      data: result,
    });
  } catch (error: any) {
    console.error('[public/booking-requests] error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

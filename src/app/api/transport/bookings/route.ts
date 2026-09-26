import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL;

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
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
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

    const booking = await backendJson(`${BACKEND}/api/transport/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!booking.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            booking.data?.message ||
            booking.data?.error ||
            (booking.status === 0
              ? 'Could not reach the booking service. Please try again.'
              : 'Failed to submit transport booking. Please try again.'),
        },
        { status: booking.status || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transport booking submitted successfully!',
      data: booking.data?.data || booking.data || {},
    });
  } catch (error: any) {
    console.error('[transport/bookings] error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

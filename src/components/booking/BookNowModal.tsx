'use client';

import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validatePhone } from '@/lib/validation';
import { SERVICE_NEEDED_OPTIONS, GENDER_OPTIONS } from '@/lib/bookingOptions';
import type { AgentProfile } from '@/types';

interface BookNowModalProps {
  agent: AgentProfile | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

interface FormErrors {
  patientName?: string;
  patientPhone?: string;
  patientAge?: string;
  patientAddress?: string;
  serviceNeeded?: string;
  bookingReason?: string;
}

export default function BookNowModal({
  agent,
  onClose,
  onSubmitted,
}: BookNowModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    patientAddress: '',
    serviceNeeded: '',
    preferredDate: '',
    preferredTime: '',
    hospital: '',
    bookingReason: '',
    additionalNote: '',
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!form.patientPhone.trim()) newErrors.patientPhone = 'Phone number is required';
    else if (!validatePhone(form.patientPhone))
      newErrors.patientPhone = 'Enter a valid phone number';
    if (!form.patientAge.trim()) newErrors.patientAge = 'Age is required';
    else if (Number(form.patientAge) <= 0) newErrors.patientAge = 'Enter a valid age';
    if (!form.patientAddress.trim()) newErrors.patientAddress = 'Address is required';
    if (!form.serviceNeeded) newErrors.serviceNeeded = 'Service needed is required';
    if (!form.bookingReason.trim())
      newErrors.bookingReason = 'Booking reason / service details is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/public/booking-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent?.id || null,
          serviceNeeded: form.serviceNeeded,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          hospital: form.hospital,
          bookingReason: form.bookingReason,
          additionalNote: form.additionalNote,
          patient: {
            name: form.patientName,
            phone: form.patientPhone,
            age: form.patientAge,
            gender: form.patientGender,
            address: form.patientAddress,
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || 'Booking request submitted successfully!');
        if (result.data?.autoCreatedPatient) {
          toast('A new patient profile was created automatically', { icon: '🆕' });
        } else if (result.data?.patient?.id) {
          toast('Linked to your existing patient profile', { icon: '🔗' });
        }
        onSubmitted?.();
        onClose();
      } else {
        toast.error(result.message || 'Failed to submit booking request');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition';
  const inputErr =
    'w-full px-4 py-2.5 border border-red-400 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative mx-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
          <h2 className="text-xl font-semibold">
            Book Now{agent?.name ? ` with ${agent.name}` : ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-green-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(e) => update('patientName', e.target.value)}
                    className={errors.patientName ? inputErr : inputCls}
                    placeholder="Full name"
                  />
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-red-600">{errors.patientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={form.patientPhone}
                    onChange={(e) => update('patientPhone', e.target.value)}
                    className={errors.patientPhone ? inputErr : inputCls}
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.patientPhone && (
                    <p className="mt-1 text-xs text-red-600">{errors.patientPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={form.patientAge}
                    onChange={(e) => update('patientAge', e.target.value)}
                    className={errors.patientAge ? inputErr : inputCls}
                    placeholder="Age"
                    min={1}
                  />
                  {errors.patientAge && (
                    <p className="mt-1 text-xs text-red-600">{errors.patientAge}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={form.patientGender}
                    onChange={(e) => update('patientGender', e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    value={form.patientAddress}
                    onChange={(e) => update('patientAddress', e.target.value)}
                    className={errors.patientAddress ? inputErr : inputCls}
                    placeholder="Full address"
                    rows={2}
                  />
                  {errors.patientAddress && (
                    <p className="mt-1 text-xs text-red-600">{errors.patientAddress}</p>
                  )}
                </div>
              </div>
            </div>
                        {/* Booking Information */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Booking Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Needed *
                  </label>
                  <select
                    value={form.serviceNeeded}
                    onChange={(e) => update('serviceNeeded', e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">Select a service</option>
                    {SERVICE_NEEDED_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.serviceNeeded && (
                    <p className="mt-1 text-xs text-red-600">{errors.serviceNeeded}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => update('preferredDate', e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={form.preferredTime}
                    onChange={(e) => update('preferredTime', e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Hospital / Clinic / Diagnostic Center
                  </label>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => update('hospital', e.target.value)}
                    className={inputCls}
                    placeholder="Enter facility name (optional)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Reason / Service Details *
                  </label>
                  <textarea
                    value={form.bookingReason}
                    onChange={(e) => update('bookingReason', e.target.value)}
                    className={errors.bookingReason ? inputErr : inputCls}
                    placeholder="Please describe the reason for this booking"
                    rows={3}
                  />
                  {errors.bookingReason && (
                    <p className="mt-1 text-xs text-red-600">{errors.bookingReason}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Note
                  </label>
                  <textarea
                    value={form.additionalNote}
                    onChange={(e) => update('additionalNote', e.target.value)}
                    className={inputCls}
                    placeholder="Anything else we should know?"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

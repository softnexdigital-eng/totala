'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface TransportBookingModalProps {
  vehicleType: string;
  onClose: () => void;
}

export default function TransportBookingModal({ vehicleType, onClose }: TransportBookingModalProps) {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleType: '',
    fromDestination: '',
    toDestination: '',
    travelDate: '',
    travelType: 'one_way',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [pricings, setPricings] = useState<Record<string, { label: string; price: number }>>({});
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchPricings();
  }, []);

  const fetchPricings = async () => {
    try {
      const res = await fetch('/api/transport/pricing');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const map: Record<string, { label: string; price: number }> = {};
        data.data.forEach((item: any) => {
          map[item.vehicleType] = { label: item.label, price: item.price };
        });
        setPricings(map);
      }
    } catch {
      // silent
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/transport/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vehicleType,
          travelDate: new Date(form.travelDate).toISOString(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Transport booking submitted successfully!');
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit booking');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedPricing = pricings[vehicleType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Book {vehicleType.replace(/_/g, ' ')}</h3>
            {selectedPricing && (
              <p className="text-sm text-gray-500">
                {selectedPricing.label}: {selectedPricing.price} BDT
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Customer Name *</label>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mobile Number *</label>
            <input
              type="tel"
              required
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter your mobile number"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle Type *</label>
            <select
              value={vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ambulance">Ambulance</option>
              <option value="hais">Hais</option>
              <option value="private_car">Private Car</option>
              <option value="cng">CNG</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">From *</label>
              <input
                type="text"
                required
                value={form.fromDestination}
                onChange={(e) => setForm({ ...form, fromDestination: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Pickup location"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">To *</label>
              <input
                type="text"
                required
                value={form.toDestination}
                onChange={(e) => setForm({ ...form, toDestination: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Drop location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Travel Date *</label>
              <input
                type="datetime-local"
                required
                value={form.travelDate}
                onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Travel Type</label>
              <select
                value={form.travelType}
                onChange={(e) => setForm({ ...form, travelType: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="one_way">One Way</option>
                <option value="round_trip">Round Trip</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Any additional details"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

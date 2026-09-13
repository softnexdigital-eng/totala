'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function NewTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    appointmentId: '',
    testName: '',
    actualCost: '',
    discountPercent: '0',
    finalCost: '',
    reportUrl: '',
    prescriptionUrl: '',
    receiptUrl: '',
    status: 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          actualCost: parseFloat(formData.actualCost),
          discountPercent: parseFloat(formData.discountPercent) || 0,
          finalCost: formData.finalCost ? parseFloat(formData.finalCost) : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Test created successfully!');
        router.push('/tests');
      } else {
        toast.error(result.message || 'Failed to create test');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Test</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment
          </label>
          <select
            value={formData.appointmentId}
            onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Appointment</option>
            {appointments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.patient.name} - {apt.doctor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Name
          </label>
          <input
            type="text"
            value={formData.testName}
            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actual Cost (BDT)
          </label>
          <input
            type="number"
            value={formData.actualCost}
            onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            value={formData.discountPercent}
            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Final Cost (BDT)
          </label>
          <input
            type="number"
            value={formData.finalCost}
            onChange={(e) => setFormData({ ...formData, finalCost: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Test'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

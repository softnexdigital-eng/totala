'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { GENDER_OPTIONS } from '@/lib/bookingOptions';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAgentId = searchParams.get('agentId') || '';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    patientAddress: '',
    serviceType: 'online',
    doctorId: '',
    hospital: '',
    date: '',
    time: '',
    notes: '',
    agentId: preselectedAgentId,
  });

  useEffect(() => {
    fetchDoctors();
    fetchAgents();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/public-agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Public, no-auth endpoint: it resolves (or auto-creates) the patient
      // profile and stores the booking request that the Super Admin reviews
      // under "Agent Booking Requests".
      const response = await fetch('/api/public/booking-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: formData.agentId || null,
          serviceNeeded:
            formData.serviceType === 'package'
              ? 'Package Booking'
              : 'Doctor Appointment',
          preferredDate: formData.date,
          preferredTime: formData.time,
          hospital: selectedDoctor?.hospital || formData.hospital,
          bookingReason:
            formData.notes || 'Booking request submitted from the website',
          additionalNote: selectedDoctor
            ? `Preferred doctor: ${selectedDoctor.name}${
                selectedDoctor.specialization
                  ? ` (${selectedDoctor.specialization})`
                  : ''
              }`
            : '',
          patient: {
            name: formData.patientName,
            phone: formData.patientPhone,
            age: formData.patientAge,
            gender: formData.patientGender || undefined,
            address: formData.patientAddress,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Booking submitted successfully! We will contact you soon.');
        if (result.data?.autoCreatedPatient) {
          toast('A new patient profile was created for you', { icon: '🆕' });
        }
        router.push('/');
      } else {
        toast.error(result.message || 'Booking failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below and we will get back to you shortly
          </p>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Patient Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter patient name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.patientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, patientPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.patientAge}
                      onChange={(e) =>
                        setFormData({ ...formData, patientAge: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) =>
                        setFormData({ ...formData, patientGender: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.label} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    value={formData.patientAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, patientAddress: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Appointment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    required
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="online">Online</option>
                    <option value="package">Package</option>
                  </select>
                </div>

                {doctors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor
                    </label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) =>
                        setFormData({ ...formData, doctorId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedDoctor?.hospital && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital/Clinic
                    </label>
                    <input
                      type="text"
                      value={selectedDoctor.hospital}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent
                  </label>
                  <select
                    value={formData.agentId}
                    onChange={(e) =>
                      setFormData({ ...formData, agentId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select an agent (optional)</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any additional information"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  age?: number;
  address?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
}

interface Agent {
  id: string;
  name: string;
  phone: string;
}

interface Appointment {
  id: string;
  date: string;
  status: string;
  serviceType: string;
  serviceFee: number;
  discountPercent?: number;
  discountAmount?: number;
  packageFinalPrice?: number;
  notes?: string;
  createdAt: string;
  doctor: Doctor;
  agent?: Agent;
  package?: {
    id: string;
    name: string;
    finalPrice: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paymentDate?: string;
  notes?: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  eventDate: string;
  status: string;
  description: string;
  user?: string;
  notes?: string;
}

interface PatientHistoryData {
  patient: Patient;
  appointments: Appointment[];
  payments: Payment[];
  timeline: TimelineEvent[];
}

interface PatientHistoryClientProps {
  data: PatientHistoryData;
  patientId: string;
}

export default function PatientHistoryClient({
  data,
}: PatientHistoryClientProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'timeline' | 'payments'>('appointments');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'PAID_CLEARED':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{data.patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{data.patient.phone}</p>
          </div>
          {data.patient.age && (
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium">{data.patient.age}</p>
            </div>
          )}
          {data.patient.address && (
            <div className="md:col-span-3">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{data.patient.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Appointments ({data.appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Service Timeline
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payments ({data.payments.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {data.appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No appointments found</p>
              ) : (
                data.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Appointment #{apt.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(apt.date)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Booked on {formatDate(apt.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Doctor</p>
                        <p className="font-medium">{apt.doctor?.name || 'Not assigned'}</p>
                        {apt.doctor?.specialization && (
                          <p className="text-sm text-gray-600">{apt.doctor.specialization}</p>
                        )}
                        {apt.doctor?.hospital && (
                          <p className="text-sm text-gray-500">{apt.doctor.hospital}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Service Type</p>
                        <p className="font-medium capitalize">{apt.serviceType}</p>
                        {apt.agent && (
                          <>
                            <p className="text-sm text-gray-600 mt-2">Assigned Agent</p>
                            <p className="font-medium">{apt.agent.name}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {apt.package && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700">Package</p>
                        <p className="text-sm text-gray-600">{apt.package.name}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatCurrency(apt.package.finalPrice)}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600 mb-2">Financial Summary</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Service Fee</p>
                          <p className="font-medium">{formatCurrency(apt.serviceFee)}</p>
                        </div>
                        {apt.discountAmount && apt.discountAmount > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Discount</p>
                            <p className="font-medium text-red-600">
                              -{formatCurrency(apt.discountAmount)}
                            </p>
                          </div>
                        )}
                        {apt.packageFinalPrice && (
                          <div>
                            <p className="text-xs text-gray-500">Final Price</p>
                            <p className="font-medium text-green-600">
                              {formatCurrency(apt.packageFinalPrice)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="mt-4 bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{apt.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {data.timeline.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No timeline events found</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {data.timeline.map((event, index) => (
                    <div key={event.id} className="relative flex gap-6 pb-8">
                      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center z-10">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.eventType}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            {event.user && (
                              <p className="text-sm text-gray-500 mt-1">By: {event.user}</p>
                            )}
                            {event.notes && (
                              <p className="text-sm text-gray-500 mt-1 italic">Note: {event.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(event.eventDate)}
                            </p>
                            <span
                              className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {data.payments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No payments found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payment.paymentDate
                              ? formatDate(payment.paymentDate)
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payment.transactionId || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                payment.paymentStatus
                              )}`}
                            >
                              {payment.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

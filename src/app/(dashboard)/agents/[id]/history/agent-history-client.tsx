'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  date: string;
  status: string;
  serviceType: string;
  serviceFee: number;
  patient?: { name: string };
  doctor?: { name: string; specialization?: string };
}

interface Task {
  id: string;
  taskStatus: string;
  specialInstructions?: string;
  notes?: string;
  appointment: Appointment;
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

interface Patient {
  id: string;
  name: string;
  phone: string;
}

interface AgentHistoryData {
  agent: Agent;
  tasks: Task[];
  payments: Payment[];
  patients: Patient[];
  appointments: Appointment[];
  summary: {
    totalTasks: number;
    pendingTasks: number;
    activeTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    totalCollectedAmount: number;
    pendingPayment: number;
    verifiedPayment: number;
  };
}

interface AgentHistoryClientProps {
  data: AgentHistoryData;
  agentId: string;
}

export default function AgentHistoryClient({
  data,
}: AgentHistoryClientProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'payments' | 'patients'>('tasks');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID_CLEARED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'SERVICE_COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.summary.totalTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completed Tasks</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{data.summary.completedTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Active Tasks</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.summary.activeTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending Tasks</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{data.summary.pendingTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Collected Amount</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(data.summary.totalCollectedAmount)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Verified Payment</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(data.summary.verifiedPayment)}
          </p>
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Agent Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{data.agent.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{data.agent.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full ${
                data.agent.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {data.agent.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks ({data.tasks.length})
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
            <button
              onClick={() => setActiveTab('patients')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'patients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Patients ({data.patients.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {data.tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tasks found</p>
              ) : (
                data.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Task #{task.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          Appointment: {task.appointment.id.slice(-8)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          task.taskStatus
                        )}`}
                      >
                        {task.taskStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Patient</p>
                        <p className="font-medium">
                          {task.appointment.patient?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Doctor</p>
                        <p className="font-medium">
                          {task.appointment.doctor?.name || 'N/A'}
                        </p>
                        {task.appointment.doctor?.specialization && (
                          <p className="text-sm text-gray-600">
                            {task.appointment.doctor.specialization}
                          </p>
                        )}
                      </div>
                    </div>

                    {task.specialInstructions && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                        <p className="text-sm text-gray-600 mt-1">{task.specialInstructions}</p>
                      </div>
                    )}

                    {task.notes && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700">Notes</p>
                        <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                      </div>
                    )}
                  </div>
                ))
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

          {activeTab === 'patients' && (
            <div className="space-y-4">
              {data.patients.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No patients found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Phone
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {patient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {patient.phone}
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

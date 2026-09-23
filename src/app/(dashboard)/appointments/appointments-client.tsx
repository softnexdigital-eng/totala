'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getStatusLabel, getStatusColor as getStatusColorShared } from '@/lib/appointmentStatus';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  hospital?: string;
  date: string;
  status: string;
  serviceType: string;
  serviceFee: number;
  discountPercent?: number;
  notes?: string;
  doctor?: Doctor;
  patient?: { id: string; name: string };
  agent?: { id: string; name: string };
  package?: { id: string; name: string; finalPrice: number };
  packageFinalPrice?: number;
  packageDiscount?: number;
  taskStatus?: string;
  taskStartedAt?: string;
  taskId?: string;
}

interface AppointmentsClientProps {
  initialAppointments: Appointment[];
  doctors: Doctor[];
}

export default function AppointmentsClient({ initialAppointments, doctors }: AppointmentsClientProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [taskMap, setTaskMap] = useState<Record<string, {
    id: string;
    taskStatus: string;
    payments?: {
      id: string;
      amount: number;
      paymentMethod: string;
      paymentStatus: string;
      transactionId?: string;
      senderNumber?: string;
    }[];
  }>>({});
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    hospital: '',
    date: '',
    serviceType: 'online',
    notes: '',
    agentId: '',
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      (apt.doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.hospital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesDoctor = filterDoctor === 'all' || apt.doctorId === filterDoctor;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const hospitalOptions = Array.from(
    new Set(
      [
        ...appointments.map((a) => a.hospital).filter(Boolean) as string[],
        ...doctors.map((d) => d.hospital).filter(Boolean) as string[],
      ]
    )
  ).sort();

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAgents(data.data || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const appointmentsWithTasks = appointments.filter((a) => a.taskId && !taskMap[a.taskId]);
    if (appointmentsWithTasks.length === 0) return;

    setLoadingTasks(true);
    Promise.all(
      appointmentsWithTasks.map((apt) =>
        fetch(`/api/tasks/${apt.taskId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data) {
              setTaskMap((prev) => ({
                ...prev,
                [apt.taskId!]: data.data,
              }));
            }
          })
          .catch(() => {})
      )
    )
      .catch(() => {})
      .finally(() => setLoadingTasks(false));
  }, [appointments]);

  const resetForm = () => {
    setFormData({
      doctorId: '',
      hospital: '',
      date: '',
      serviceType: 'online',
      notes: '',
      agentId: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/appointments/${editingId}` : '/api/appointments';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? 'Appointment updated!' : 'Appointment created!');
        
        if (!editingId && formData.agentId) {
          try {
            const taskRes = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appointmentId: result.data.id,
                agentId: formData.agentId,
                taskStatus: 'ASSIGNED',
              }),
            });
            const taskResult = await taskRes.json();
            if (taskResult.success) {
              toast.success('Task assigned to agent');
              setAppointments((prev) =>
                prev.map((a) =>
                  a.id === result.data.id
                    ? {
                        ...a,
                        agent: taskResult.data.agent,
                        taskStatus: taskResult.data.taskStatus,
                        taskId: taskResult.data.id,
                      }
                    : a
                )
              );
            }
          } catch {
            toast.error('Appointment created but task assignment failed');
          }
        }
        
        resetForm();
        if (!editingId) {
          setAppointments([result.data, ...appointments]);
        } else {
          setAppointments(appointments.map((a) => (a.id === editingId ? result.data : a)));
        }
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setIsSubmitting(false);
  };

  const handleEdit = (apt: Appointment) => {
    setEditingId(apt.id);
    setFormData({
      doctorId: apt.doctorId,
      hospital: apt.hospital || '',
      date: apt.date.slice(0, 16),
      serviceType: apt.serviceType,
      notes: apt.notes || '',
      agentId: apt.agent?.id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Appointment deleted successfully!');
        setAppointments(appointments.filter((a) => a.id !== id));
      } else {
        toast.error(result.message || 'Failed to delete appointment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handlePaymentStatusUpdate = async (paymentId: string, paymentStatus: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payment status updated');
        setTaskMap((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((taskId) => {
            if (updated[taskId].payments) {
              updated[taskId] = {
                ...updated[taskId],
                payments: updated[taskId].payments!.map((p) =>
                  p.id === paymentId ? result.data : p
                ),
              };
            }
          });
          return updated;
        });
      } else {
        toast.error(result.message || 'Failed to update payment status');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID_CLEARED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_VERIFICATION':
        return 'bg-indigo-100 text-indigo-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => getStatusColorShared(status);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Appointment'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Appointment' : 'Create Appointment'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor *
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital/Location
                </label>
                <select
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Hospital/Location</option>
                  {hospitalOptions.map((hospital) => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="online">Online (50 BDT)</option>
                  <option value="package">Package (500 BDT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Agent
                </label>
                <select
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by doctor, hospital, or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Task Pending</option>
            <option value="received">Task Received</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No appointments found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Appointment</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.date).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                    apt.status
                  )}`}
                >
                  {getStatusLabel(apt.status)}
                </span>
                {apt.taskStatus && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      apt.taskStatus === 'IN_PROGRESS'
                        ? 'bg-red-100 text-red-800'
                        : apt.taskStatus === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    Task: {apt.taskStatus}
                  </span>
                )}
                {apt.taskId && taskMap[apt.taskId]?.payments?.[0] && (() => {
                  const task = taskMap[apt.taskId];
                  const payment = task.payments![0];
                  return (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Change Payment Status
                      </label>
                      <select
                        value={payment.paymentStatus}
                        onChange={(e) =>
                          handlePaymentStatusUpdate(
                            payment.id,
                            e.target.value
                          )
                        }
                        className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${getPaymentStatusColor(
                          payment.paymentStatus
                        )}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_VERIFICATION">Under Verification</option>
                        <option value="PAID_CLEARED">Paid/Cleared</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span> {apt.doctor ? `${apt.doctor.name} (${apt.doctor.specialization})` : 'Not assigned'}
                </p>
                {apt.hospital && (
                  <p className="text-sm">
                    <span className="font-medium">Hospital:</span> {apt.hospital}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Service:</span>{' '}
                  <span className="capitalize">{apt.serviceType}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Fee:</span> {apt.serviceFee} BDT
                </p>
                {apt.status === 'completed' && apt.discountPercent != null && (
                  <p className="text-sm">
                    <span className="font-medium">Discount:</span>{' '}
                    <span className="text-green-600 font-semibold">
                      {apt.discountPercent}%
                    </span>
                  </p>
                )}
                {apt.patient && (
                  <p className="text-sm">
                    <span className="font-medium">Patient:</span> {apt.patient.name}
                  </p>
                )}
                {apt.agent && (
                  <p className="text-sm">
                    <span className="font-medium">Agent:</span> {apt.agent.name}
                  </p>
                )}
                {apt.taskStatus === 'IN_PROGRESS' && apt.taskStartedAt && (
                  <p className="text-sm">
                    <span className="font-medium">Task Started:</span>{' '}
                    {new Date(apt.taskStartedAt).toLocaleString()}
                  </p>
                )}
                {apt.taskStatus === 'IN_PROGRESS' && apt.taskId && (
                  <button
                    onClick={() => router.push(`/agent-dashboard/tasks/${apt.taskId}`)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Task Details →
                  </button>
                )}
                {apt.notes && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {apt.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(apt)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(apt.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Delete
                </button>
                {apt.taskStatus === 'COMPLETED' && apt.taskId && (
                  <button
                    onClick={() => router.push(`/agents/ratings?taskId=${apt.taskId}`)}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Rate Agent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

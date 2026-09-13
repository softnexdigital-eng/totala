'use client';

import { useState } from 'react';
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
  doctor: Doctor;
  patient?: { id: string; name: string };
  agent?: { id: string; name: string };
  package?: { id: string; name: string; finalPrice: number };
  packageFinalPrice?: number;
  packageDiscount?: number;
}

interface AppointmentsClientProps {
  initialAppointments: Appointment[];
  doctors: Doctor[];
}

export default function AppointmentsClient({ initialAppointments, doctors }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
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
  });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const resetForm = () => {
    setFormData({
      doctorId: '',
      hospital: '',
      date: '',
      serviceType: 'online',
      notes: '',
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
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span> {apt.doctor.name} ({apt.doctor.specialization})
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
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

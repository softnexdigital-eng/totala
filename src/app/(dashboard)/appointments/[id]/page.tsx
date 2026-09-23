import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBackendJson } from '../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import { getStatusLabel, getStatusColor } from '../../../../lib/appointmentStatus';

interface Appointment {
  id: string;
  patient: { id: string; name: string };
  doctor?: { id: string; name: string };
  agent?: { name: string };
  date: string;
  status: string;
  serviceType: string;
  serviceFee: number;
  discountPercent?: number;
  notes?: string;
}

async function getAppointment(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/appointments/${id}`, token);
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAppointment(params.id);

  if (!data || !data.success) {
    notFound();
  }

  const appointment: Appointment = data.data;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointment Details</h1>
        <Link href="/appointments" className="text-blue-600 hover:text-blue-800">
          Back to List
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Patient</label>
          <p className="text-lg">{appointment.patient.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Doctor</label>
          <p className="text-lg">{appointment.doctor ? appointment.doctor.name : 'Not assigned'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Date & Time</label>
          <p className="text-lg">{new Date(appointment.date).toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Service Type</label>
          <p className="text-lg capitalize">{appointment.serviceType}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Service Fee</label>
          <p className="text-lg">{appointment.serviceFee} BDT</p>
        </div>

        {appointment.status === 'completed' && appointment.discountPercent != null && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Discount Given</label>
            <p className="text-lg text-green-600">{appointment.discountPercent}%</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-500">Status</label>
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
              appointment.status
            )}`}
          >
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        {appointment.agent && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Agent</label>
            <p className="text-lg">{appointment.agent.name}</p>
          </div>
        )}

        {appointment.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Notes</label>
            <p className="text-lg">{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import AppointmentsClient from './appointments-client';

async function getData() {
  const token = await getAuthToken();

  if (!token) return null;

  const [appointments, doctors] = await Promise.all([
    fetchBackendJson('/api/appointments', token),
    fetchBackendJson('/api/doctors', token),
  ]);

  return { appointments, doctors };
}

export default async function AppointmentsPage() {
  const data = await getData();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <AppointmentsClient
        initialAppointments={data.appointments?.data || []}
        doctors={data.doctors?.data || []}
      />
    </div>
  );
}

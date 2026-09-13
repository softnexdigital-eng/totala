import DashboardClient from './dashboard-client';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';

async function getData() {
  const token = await getAuthToken();

  if (!token) return null;

  const [patients, doctors, appointments] = await Promise.all([
    fetchBackendJson('/api/patients', token, { next: { revalidate: 60 } }),
    fetchBackendJson('/api/doctors', token, { next: { revalidate: 60 } }),
    fetchBackendJson('/api/appointments', token, { next: { revalidate: 60 } }),
  ]);

  return { token, patients, doctors, appointments };
}

export default async function DashboardPage() {
  const data = await getData();

  if (!data) {
    return <div>Please login</div>;
  }

  const totalPatients = data.patients?.data?.length || 0;
  const totalDoctors = data.doctors?.data?.length || 0;
  const totalAppointments = data.appointments?.data?.length || 0;

  return (
    <DashboardClient
      token={data.token}
      totalPatients={totalPatients}
      totalDoctors={totalDoctors}
      totalAppointments={totalAppointments}
    />
  );
}

import Link from 'next/link';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import DoctorsClient from './doctors-client';

async function getDoctors() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/doctors', token);
}

export default async function DoctorsPage() {
  const data = await getDoctors();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Link
          href="/doctors/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Doctor
        </Link>
      </div>

      <DoctorsClient initialDoctors={data.data || []} />
    </div>
  );
}

import Link from 'next/link';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PatientsClient from './patients-client';

async function getPatients() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/patients', token);
}

export default async function PatientsPage() {
  const data = await getPatients();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Link
          href="/patients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Patient
        </Link>
      </div>

      <PatientsClient initialPatients={data.data || []} />
    </div>
  );
}

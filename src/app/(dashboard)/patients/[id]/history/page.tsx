import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PatientHistoryClient from './patient-history-client';

async function getPatientHistory(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/patients/${id}/history`, token);
}

export default async function PatientHistoryPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getPatientHistory(params.id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Patient History</h1>
        <p className="text-gray-600 mt-1">
          Complete service history and timeline
        </p>
      </div>
      <PatientHistoryClient data={data.data} patientId={params.id} />
    </div>
  );
}

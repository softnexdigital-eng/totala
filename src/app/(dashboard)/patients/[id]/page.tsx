import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PatientForm from '../patient-form';

async function getPatient(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/patients/${id}`, token);
}

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getPatient(params.id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Patient</h1>
      <PatientForm patient={data.data} />
    </div>
  );
}

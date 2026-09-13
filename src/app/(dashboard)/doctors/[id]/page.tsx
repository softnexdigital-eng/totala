import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import DoctorForm from '../doctor-form';

async function getDoctor(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/doctors/${id}`, token);
}

export default async function DoctorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getDoctor(params.id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Doctor</h1>
      <DoctorForm doctor={data.data} />
    </div>
  );
}

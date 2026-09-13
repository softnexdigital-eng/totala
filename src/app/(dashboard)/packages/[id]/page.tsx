import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PackageForm from '../package-form';

async function getPackage(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/packages/${id}`, token);
}

export default async function PackageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getPackage(params.id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Package</h1>
      <PackageForm packageData={data.data} />
    </div>
  );
}

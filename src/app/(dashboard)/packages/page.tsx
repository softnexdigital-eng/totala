import Link from 'next/link';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PackagesClient from './packages-client';

async function getPackages() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/packages', token, { next: { revalidate: 60 } });
}

export default async function PackagesPage() {
  const data = await getPackages();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Packages</h1>
        <Link
          href="/packages/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Package
        </Link>
      </div>

      <PackagesClient initialPackages={data.data || []} />
    </div>
  );
}

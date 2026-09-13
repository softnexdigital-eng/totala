import Link from 'next/link';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import TestsClient from './tests-client';

async function getTests() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/tests', token);
}

export default async function TestsPage() {
  const data = await getTests();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tests</h1>
        <Link
          href="/tests/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Test
        </Link>
      </div>

      <TestsClient initialTests={data.data || []} />
    </div>
  );
}

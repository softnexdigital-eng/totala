import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';

async function getReports() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/reports/daily', token);
}

export default async function ReportsPage() {
  const data = await getReports();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Daily Reports</h2>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
          {JSON.stringify(data.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

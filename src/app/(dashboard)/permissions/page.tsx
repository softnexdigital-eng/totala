import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PermissionsClient from './permissions-client';

async function getAgents() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/agents', token);
}

export default async function PermissionsPage() {
  const data = await getAgents();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent</h1>
        <p className="text-gray-600 mt-1">Manage agent access and permissions</p>
      </div>
      <PermissionsClient initialAgents={data.data || []} />
    </div>
  );
}

import Link from 'next/link';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import AgentsClient from './agents-client';

async function getAgents() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/agents', token);
}

export default async function AgentsPage() {
  const data = await getAgents();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Link
          href="/agents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Agent
        </Link>
      </div>

      <AgentsClient initialAgents={data.data || []} />
    </div>
  );
}

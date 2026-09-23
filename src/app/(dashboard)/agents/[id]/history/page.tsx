import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import AgentHistoryClient from './agent-history-client';

async function getAgentHistory(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/agents/${id}/history`, token);
}

export default async function AgentHistoryPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAgentHistory(params.id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent History</h1>
        <p className="text-gray-600 mt-1">
          Complete task and payment history
        </p>
      </div>
      <AgentHistoryClient data={data.data} agentId={params.id} />
    </div>
  );
}

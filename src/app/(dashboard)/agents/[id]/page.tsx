import { notFound } from 'next/navigation';
import { fetchBackendJson } from '../../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import AgentForm from '../agent-form';

async function getAgent(id: string) {
  const token = await getAuthToken();
  return fetchBackendJson(`/api/agents/${id}`, token);
}

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAgent(params.id);

  if (!data || !data.success) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Agent</h1>
      <AgentForm agent={data.data} />
    </div>
  );
}

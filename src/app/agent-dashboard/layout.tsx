import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const agentToken = cookies().get('agentToken')?.value;
  const agentCookie = cookies().get('agent')?.value;

  if (!agentToken || !agentCookie) {
    redirect('/agent-login');
  }

  return <>{children}</>;
}

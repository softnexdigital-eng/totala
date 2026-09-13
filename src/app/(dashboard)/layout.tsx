import DashboardLayoutClient from '@/components/layout/DashboardLayout';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('token')?.value;
  const agentToken = cookies().get('agentToken')?.value;

  if (!token && !agentToken) {
    redirect('/login');
  }

  return <DashboardLayoutClient hasAdminToken={!!token}>{children}</DashboardLayoutClient>;
}

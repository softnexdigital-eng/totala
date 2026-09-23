'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import AgentSidebar from '@/components/layout/AgentSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';

interface Agent {
  id: string;
  name: string;
  email?: string;
  phone: string;
  permissions?: Record<string, boolean>;
}

/**
 * Renders the shell around the routed page.
 *
 * The admin sidebar is `fixed` on desktop, so the content column is offset by
 * the sidebar's width via a left margin. Because the width is driven by the
 * shared collapse state, the margin animates in lockstep with the sidebar
 * (w-72 -> w-20) whenever the user minimises or expands it.
 */
function DashboardShell({
  children,
  showAdminSidebar,
  showAgentSidebar,
  agentPermissions,
}: {
  children: React.ReactNode;
  showAdminSidebar: boolean;
  showAgentSidebar: boolean;
  agentPermissions: Record<string, boolean>;
}) {
  const { collapsed } = useSidebar();

  const contentOffset = showAdminSidebar ? (collapsed ? 'lg:ml-20' : 'lg:ml-72') : '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showAdminSidebar && <Sidebar />}
      {showAgentSidebar && <AgentSidebar permissions={agentPermissions} />}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${contentOffset}`}
      >
        {showAdminSidebar && <Header />}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        {showAdminSidebar && <Footer />}
      </div>
    </div>
  );
}


export default function DashboardLayoutClient({
  children,
  hasAdminToken,
}: {
  children: React.ReactNode;
  hasAdminToken: boolean;
}) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const agentCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('agent='));

    if (!agentCookie) {
      setLoading(false);
      return;
    }

    try {
      const agentData: Agent = JSON.parse(decodeURIComponent(agentCookie.split('=')[1]));
      setAgent(agentData);
    } catch {
      setAgent(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    fetch('/api/agents/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.success && data.data) {
          const fresh = data.data as Agent;
          setAgent(fresh);
          document.cookie = `agent=${encodeURIComponent(JSON.stringify(fresh))}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isAgentRoute = pathname.startsWith('/agent-dashboard');
  const isAdminOnlyRoute = pathname.startsWith('/permissions');

  const showAgentSidebar = Boolean(isAgentRoute || (!hasAdminToken && agent && !isAdminOnlyRoute));
  const showAdminSidebar = !showAgentSidebar;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <DashboardShell
        showAdminSidebar={showAdminSidebar}
        showAgentSidebar={showAgentSidebar}
        agentPermissions={agent?.permissions || {}}
      >
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}

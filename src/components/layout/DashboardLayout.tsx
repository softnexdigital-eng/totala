'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import AgentSidebar from '@/components/layout/AgentSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Agent {
  id: string;
  name: string;
  email?: string;
  phone: string;
  permissions?: Record<string, boolean>;
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

  const showAgentSidebar = isAgentRoute || (!hasAdminToken && agent && !isAdminOnlyRoute);
  const showAdminSidebar = !showAgentSidebar;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showAdminSidebar && <Sidebar />}
      {showAgentSidebar && <AgentSidebar permissions={agent?.permissions || {}} />}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${showAdminSidebar ? 'lg:ml-72' : ''}`}>
        {showAdminSidebar && <Header />}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        {showAdminSidebar && <Footer />}
      </div>
    </div>
  );
}

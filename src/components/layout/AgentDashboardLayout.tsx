'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import AgentSidebar from './AgentSidebar';

interface Agent {
  id: string;
  name: string;
  email?: string;
  phone: string;
  permissions?: Record<string, boolean>;
}

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const readAgentCookie = useCallback((): Agent | null => {
    const agentCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('agent='));

    if (!agentCookie) return null;

    try {
      return JSON.parse(decodeURIComponent(agentCookie.split('=')[1]));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const cookieAgent = readAgentCookie();
    if (!cookieAgent) {
      router.push('/agent-login');
      return;
    }

    // Render instantly from the cookie data we already have.
    setAgent(cookieAgent);

    // Then fetch the latest profile/permissions from the backend so any
    // permission changes made by the super admin apply immediately on the
    // next page load — the agent no longer has to logout/login again.
    fetch('/api/agents/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data.success && data.data) {
          const fresh = data.data as Agent;
          setAgent(fresh);
          // Keep the cookie in sync so other client components share the
          // same up-to-date permissions.
          document.cookie = `agent=${encodeURIComponent(JSON.stringify(fresh))}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }
      })
      .catch(() => {
        // Fall back to the cookie data already rendered.
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router, readAgentCookie]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!agent) {
    return null;
  }

  const permissions = agent.permissions || {};

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AgentSidebar permissions={permissions} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          {pathname === '/agent-dashboard' && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {agent.name}</h1>
              <p className="text-gray-600 mt-2">Agent Dashboard</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

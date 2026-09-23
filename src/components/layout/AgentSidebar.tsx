'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AgentSidebarProps {
  permissions: Record<string, boolean>;
}

const MENU_ITEMS = [
  { href: '/agent-dashboard', label: 'Dashboard', icon: '📊', key: 'dashboard' },
  { href: '/patients', label: 'Patients', icon: '👥', key: 'patients' },
  { href: '/doctors', label: 'Doctors', icon: '👨‍⚕️', key: 'doctors' },
  { href: '/agents', label: 'Agents', icon: '🤝', key: 'agents' },
  { href: '/packages', label: 'Packages', icon: '📦', key: 'packages' },
  { href: '/appointments', label: 'Appointments', icon: '📅', key: 'appointments' },
  { href: '/doctor-booking', label: 'Doctor Booking', icon: '📋', key: 'doctorBooking' },
  { href: '/tests', label: 'Tests', icon: '🔬', key: 'tests' },
  { href: '/reports', label: 'Reports', icon: '📈', key: 'reports' },
];

export default function AgentSidebar({ permissions }: AgentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    document.cookie = 'agentToken=; path=/; max-age=0';
    document.cookie = 'agent=; path=/; max-age=0';
    router.push('/agent-login');
  };

  const visibleItems = MENU_ITEMS.filter((item) => permissions[item.key] === true);

  return (
    <aside
      className={`h-screen sticky top-0 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header & Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              D
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent truncate">
              DakDin <span className="text-xs text-emerald-400 font-medium border border-emerald-500/30 px-1.5 py-0.5 rounded">Agent</span>
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            D
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none ${
            isCollapsed ? 'mx-auto mt-2' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Links - Scrollable Area */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
        {!isCollapsed && (
          <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Navigation Menu
          </p>
        )}

        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className="text-lg shrink-0 transition-transform group-hover:scale-110">
                {item.icon}
              </span>

              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Tooltip preview when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group relative ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <svg
            className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!isCollapsed && <span>Logout</span>}

          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-rose-950 text-rose-200 text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 border border-rose-800/50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
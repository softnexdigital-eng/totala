'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiChartBar,
  HiUserGroup,
  HiUser,
  HiUsers,
  HiLockClosed,
  HiCube,
  HiCalendar,
  HiDocumentText,
  HiLightBulb,
  HiTable,
  HiClipboardList,
  HiCurrencyDollar,
  HiDocumentReport,
  HiStar,
  HiX,
  HiMenu,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from 'react-icons/hi';
import { useSidebar } from '@/components/layout/SidebarContext';

type MenuItem = { href: string; label: string; icon: typeof HiChartBar };

/**
 * Navigation is grouped into labelled sections so the long list stays
 * scannable. Section headings collapse into thin dividers when the sidebar
 * is minimised.
 */
const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: HiChartBar }],
  },
  {
    title: 'Management',
    items: [
      { href: '/patients', label: 'Patients', icon: HiUserGroup },
      { href: '/doctors', label: 'Doctors', icon: HiUser },
      { href: '/agents', label: 'Agents', icon: HiUsers },
      { href: '/permissions', label: 'Permissions', icon: HiLockClosed },
      { href: '/packages', label: 'Manage Packages', icon: HiCube },
     
      { href: '/tests', label: 'Tests', icon: HiLightBulb },
     
    ],
  },
  {
    title: 'Bookings',
    items: [
      { href: '/appointments', label: 'Manage Appointments', icon: HiCalendar },
      { href: '/doctor-booking', label: 'Doctor Booking', icon: HiDocumentText },
      { href: '/tasks', label: 'Tasks', icon: HiClipboardList },
      { href: '/payments', label: 'Payments', icon: HiCurrencyDollar },
      { href: '/bookings', label: 'Online Bookings', icon: HiCalendar },
      { href: '/agent-booking-requests', label: 'Agent Booking Requests', icon: HiUser },
      { href: '/agents/ratings', label: 'Agent Ratings', icon: HiStar },
    ],
  },
  {
    title: 'Insights',
    items: [
      { href: '/audit', label: 'Audit Report', icon: HiDocumentReport },
      { href: '/reports', label: 'Reports', icon: HiTable },
    ],
  },
];

function SidebarContent({
  collapsed,
  onNavigate,
  onClose,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <div
        className={`flex h-20 shrink-0 items-center border-b border-white/10 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
          aria-label="DakDin dashboard"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
            <HiChartBar className="h-6 w-6 text-white" />
          </span>
          <span
            className={`whitespace-nowrap bg-gradient-to-r from-white to-blue-200 bg-clip-text text-xl font-bold tracking-tight text-transparent ${
              collapsed ? 'hidden' : 'block'
            }`}
          >
            DakDin
          </span>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <HiX className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Scrollable navigation */}
      <nav className="sidebar-scroll flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {menuSections.map((section, index) => (
          <div key={section.title}>
            {collapsed ? (
              index > 0 && <div className="mx-2 mb-2 border-t border-white/10" />
            ) : (
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex items-center rounded-xl text-sm transition-all duration-200 ${
                      collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                    )}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {!collapsed && <span className="truncate font-medium">{item.label}</span>}
                    {!collapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

function SidebarFooter({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <div className="shrink-0 space-y-3 border-t border-white/10 p-3">
      {!collapsed && (
        <div className="rounded-xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4">
          <p className="text-xs font-semibold text-white">Need help?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
            Contact support for assistance.
          </p>
        </div>
      )}

      {onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={`flex w-full items-center rounded-lg border border-white/10 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white ${
            collapsed ? 'justify-center py-3' : 'gap-2 px-3 py-2.5'
          }`}
        >
          {collapsed ? (
            <HiChevronDoubleRight className="h-5 w-5" />
          ) : (
            <>
              <HiChevronDoubleLeft className="h-5 w-5" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-50 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 lg:hidden"
      >
        <HiMenu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Desktop sidebar (collapsible) */}
      <aside
        className={`fixed hidden h-screen flex-col border-r border-white/5 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white shadow-2xl transition-[width] duration-300 ease-in-out lg:flex ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <SidebarContent collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>

      {/* Mobile sidebar (drawer, always expanded) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}

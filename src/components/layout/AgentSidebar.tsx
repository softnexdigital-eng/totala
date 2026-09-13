'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  email?: string;
  phone: string;
  permissions?: Record<string, boolean>;
}

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

  const handleLogout = () => {
    document.cookie = 'agentToken=; path=/; max-age=0';
    document.cookie = 'agent=; path=/; max-age=0';
    router.push('/agent-login');
  };

  // Only show menus that have been explicitly granted (permission === true).
  // Menus the super admin did NOT grant (absent/undefined/false) are hidden.
  const visibleItems = MENU_ITEMS.filter((item) => permissions[item.key] === true);

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-8">DakDin Agent</h2>
        <nav className="space-y-2">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

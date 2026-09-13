'use client';

import { useState } from 'react';
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
  HiX,
  HiMenu,
} from 'react-icons/hi';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiChartBar },
  { href: '/patients', label: 'Patients', icon: HiUserGroup },
  { href: '/doctors', label: 'Doctors', icon: HiUser },
  { href: '/agents', label: 'Agents', icon: HiUsers },
  { href: '/permissions', label: 'Permissions', icon: HiLockClosed },
  { href: '/packages', label: 'Manage Packages', icon: HiCube },
  { href: '/appointments', label: 'Manage Appointments', icon: HiCalendar },
  { href: '/doctor-booking', label: 'Doctor Booking', icon: HiDocumentText },
  { href: '/tests', label: 'Tests', icon: HiLightBulb },
  { href: '/reports', label: 'Reports', icon: HiTable },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <HiChartBar className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            DakDin
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-300 hover:text-white transition-colors"
        >
          <HiX className="w-6 h-6" />
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-300 text-center">
            Need help? Contact support
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
      >
        <HiMenu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex-col fixed h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

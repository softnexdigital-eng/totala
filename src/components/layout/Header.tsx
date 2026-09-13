'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { HiOutlineLogout } from 'react-icons/hi';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/doctors': 'Doctors',
  '/agents': 'Agents',
  '/appointments': 'Appointments',
  '/doctor-booking': 'Doctor Booking',
  '/packages': 'Manage Packages',
  '/tests': 'Tests',
  '/reports': 'Reports',
};

export default function Header() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const title = pageTitles[pathname] || '';

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
      <div className="flex justify-between items-center px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10" />
          {title && (
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Welcome back, Admin
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

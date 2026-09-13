import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">Could not find the requested page.</p>
      </div>
    </div>
  );
}

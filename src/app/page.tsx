import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const token = cookies().get('token')?.value;

  if (token) {
    redirect('/dashboard');
  }

  redirect('/login');
}

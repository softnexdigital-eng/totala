import Link from 'next/link';
import { fetchBackendJson } from '../../../lib/api';
import { getAuthToken } from '@/lib/serverAuth';
import PaymentsClient from './payments-client';

async function getPayments() {
  const token = await getAuthToken();
  return fetchBackendJson('/api/payments', token);
}

export default async function PaymentsPage() {
  const data = await getPayments();

  if (!data) {
    return <div>Please login</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>
      <PaymentsClient initialPayments={data.data || []} />
    </div>
  );
}
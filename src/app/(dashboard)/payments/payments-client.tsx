'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Task {
  id: string;
  taskStatus: string;
  appointment: {
    id: string;
    date: string;
    patient?: { name: string };
    doctor?: { name: string };
  };
}

interface Agent {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  senderNumber?: string;
  paymentDate?: string;
  screenshot?: string;
  rejectionReason?: string;
  notes?: string;
  task?: Task;
  appointment?: {
    id: string;
    date: string;
    patient?: { name: string };
    doctor?: { name: string };
  };
  agent?: Agent;
  patient?: Patient;
}

const PAYMENT_STATUSES = [
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_VERIFICATION', label: 'Under Verification' },
  { value: 'PAID_CLEARED', label: 'Paid/Cleared' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'HUB_DIRECT', label: 'Hub Direct' },
];

const STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_VERIFICATION: 'bg-indigo-100 text-indigo-800',
  PAID_CLEARED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

interface PaymentsClientProps {
  initialPayments: Payment[];
}

export default function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const router = useRouter();

  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  const handleVerify = async (paymentId: string, paymentStatus: string, rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, rejectionReason }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payment verified');
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? result.data : p))
        );
      } else {
        toast.error(result.message || 'Failed to verify payment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {payments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No payments found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.patient?.name || payment.appointment?.patient?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.agent?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.amount} BDT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.paymentStatus}
                      onChange={(e) => {
                        const status = e.target.value;
                        if (status === 'REJECTED') {
                          const reason = prompt('Rejection reason:');
                          handleVerify(payment.id, status, reason || '');
                        } else {
                          handleVerify(payment.id, status);
                        }
                      }}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: string;
  date: string;
  status: string;
  serviceType: string;
  serviceFee: number;
  patient?: { name: string };
  doctor?: { name: string; specialization?: string };
}

interface Agent {
  id: string;
  name: string;
  phone: string;
}

interface Task {
  id: string;
  taskStatus: string;
  specialInstructions?: string;
  notes?: string;
  discountPercent?: number;
  discountAmount?: number;
  transactionId?: string;
  bkashNumber?: string;
  receiveTime?: string;
  startTime?: string;
  endTime?: string;
  appointment: Appointment;
  agent: Agent;
  payments?: {
    id: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentDate?: string;
    notes?: string;
    transactionId?: string;
    senderNumber?: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  RECEIVED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  SERVICE_COMPLETED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

interface TasksClientProps {
  initialTasks: Task[];
}

function formatTimer(startTime?: string) {
  if (!startTime) return null;
  const start = new Date(startTime).getTime();
  if (Number.isNaN(start)) return null;
  const diff = Date.now() - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function TasksClient({ initialTasks }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [timers, setTimers] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next: Record<string, string> = {};
        let changed = false;
        tasks.forEach((task) => {
          if (task.taskStatus === 'IN_PROGRESS') {
            const timer = formatTimer(task.startTime);
            if (timer) {
              next[task.id] = timer;
              if (prev[task.id] !== timer) changed = true;
            }
          }
        });
        return changed ? { ...prev, ...next } : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID_CLEARED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_VERIFICATION':
        return 'bg-indigo-100 text-indigo-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEndTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskStatus: 'COMPLETED' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Task ended successfully');
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? result.data : t))
        );
      } else {
        toast.error(result.message || 'Failed to end task');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handlePaymentStatusUpdate = async (paymentId: string, paymentStatus: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payment status updated');
        setTasks((prev) =>
          prev.map((t) => {
            if (!t.payments) return t;
            return {
              ...t,
              payments: t.payments.map((p) => (p.id === paymentId ? result.data : p)),
            };
          })
        );
      } else {
        toast.error(result.message || 'Failed to update payment status');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleStatusUpdate = async (taskId: string, taskStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Task status updated');
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? result.data : t))
        );
      } else {
        toast.error(result.message || 'Failed to update task');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'PUT',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Task approved');
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? result.data : t))
        );
      } else {
        toast.error(result.message || 'Failed to approve task');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const result = await response.json();
        if (result.success) {
          setTasks(result.data || []);
        }
      } catch (error) {
        // silent refresh failure
      }
    };

    const interval = setInterval(() => {
      loadTasks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {tasks.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No tasks found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => {
                const payment = task.payments?.[0];
                const canEnd = task.taskStatus === 'SERVICE_COMPLETED' || 
                               (payment && payment.paymentStatus === 'PAID_CLEARED' && task.taskStatus !== 'COMPLETED');
                const timer = task.taskStatus === 'IN_PROGRESS' ? timers[task.id] : null;

                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.appointment.patient?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.appointment.doctor?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.agent.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(task.appointment.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          task.taskStatus
                        )}`}
                      >
                        {task.taskStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {timer ? (
                        <span className="font-mono text-sm text-red-600">{timer}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment ? (
                        <select
                          value={payment.paymentStatus}
                          onChange={(e) => handlePaymentStatusUpdate(payment.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${getPaymentStatusColor(payment.paymentStatus)}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_VERIFICATION">Under Verification</option>
                          <option value="PAID_CLEARED">Paid/Cleared</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      ) : (
                        <span className="text-gray-400 text-sm">No payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment ? payment.paymentMethod.replace(/_/g, ' ') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment ? `${payment.amount} BDT` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment?.transactionId || payment?.senderNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!canEnd && task.taskStatus === 'SERVICE_COMPLETED' && (
                        <button
                          onClick={() => handleApproveTask(task.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve to End
                        </button>
                      )}
                      {canEnd && (
                        <button
                          onClick={() => handleEndTask(task.id)}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                        >
                          End Task
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

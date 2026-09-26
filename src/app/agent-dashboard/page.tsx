'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AgentDashboardLayout from '@/components/layout/AgentDashboardLayout';

interface Task {
  id: string;
  taskStatus: string;
  specialInstructions?: string;
  notes?: string;
  appointment: {
    id: string;
    date: string;
    serviceType: string;
    serviceFee: number;
    patient?: { name: string; phone?: string };
    doctor?: { name: string; specialization?: string };
    hospital?: string;
  };
  agent: {
    id: string;
    name: string;
  };
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate?: string;
  notes?: string;
}

const TASK_STATUSES = [
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SERVICE_COMPLETED', label: 'Service Completed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  SERVICE_COMPLETED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AgentDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const [endForm, setEndForm] = useState<Record<string, { discountAmount: string; transactionId: string; bkashNumber: string }>>({});

  const getAgentToken = () => {
    const match = document.cookie.match(/(?:^|; )agentToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const fetchTasks = async () => {
    try {
      const token = getAgentToken();
      const res = await fetch('/api/tasks', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (data.success) setTasks(data.data || []);
      else toast.error(data.message || 'Failed to load tasks');
    } catch {
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReceiveTask = async (taskId: string) => {
    setUpdating(true);
    try {
      const token = getAgentToken();
      const res = await fetch(`/api/tasks/${taskId}/receive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task received');
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.data : t)));
      } else {
        toast.error(data.message || 'Failed to receive task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    setUpdating(true);
    try {
      const token = getAgentToken();
      const res = await fetch(`/api/tasks/${taskId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Patient received, timer started');
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.data : t)));
      } else {
        toast.error(data.message || 'Failed to start task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleEndTask = async (taskId: string) => {
    setUpdating(true);
    try {
      const token = getAgentToken();
      const form = endForm[taskId] || { discountAmount: '', transactionId: '', bkashNumber: '' };
      const res = await fetch(`/api/tasks/${taskId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          discountAmount: parseFloat(form.discountAmount) || 0,
          transactionId: form.transactionId,
          bkashNumber: form.bkashNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task ended');
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.data : t)));
        setEndForm((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      } else {
        toast.error(data.message || 'Failed to end task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, taskStatus: string) => {
    setUpdating(true);
    try {
      const token = getAgentToken();
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ taskStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task status updated');
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.data : t)));
      } else {
        toast.error(data.message || 'Failed to update task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  const canEndTask = (task: Task) => {
    const form = endForm[task.id];
    if (!form) return false;
    return form.discountAmount !== '' && form.transactionId.trim() !== '' && form.bkashNumber.trim() !== '';
  };

  const updateEndForm = (taskId: string, field: string, value: string) => {
    setEndForm((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { discountAmount: '', transactionId: '', bkashNumber: '' }),
        [field]: value,
      },
    }));
  };

  return (
    <AgentDashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Agent</h1>
        <p className="text-gray-600 mt-2">Manage your tasks and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {tasks.filter((t) => t.taskStatus === 'PENDING' || t.taskStatus === 'ASSIGNED').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Completed Tasks</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {tasks.filter((t) => t.taskStatus === 'COMPLETED').length}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
          No tasks assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => router.push(`/agent-dashboard/tasks/${task.id}`)}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-600">
                  {new Date(task.appointment.date).toLocaleString()}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.taskStatus)}`}>
                  {task.taskStatus}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Patient:</span>{' '}
                  {task.appointment.patient?.name || 'Not assigned'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span>{' '}
                  {task.appointment.doctor?.name || 'N/A'}{' '}
                  {task.appointment.doctor?.specialization ? `(${task.appointment.doctor.specialization})` : ''}
                </p>
                {task.appointment.hospital && (
                  <p className="text-sm">
                    <span className="font-medium">Hospital:</span> {task.appointment.hospital}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Service:</span>{' '}
                  <span className="capitalize">{task.appointment.serviceType}</span> — {task.appointment.serviceFee} BDT
                </p>
                {task.specialInstructions && (
                  <p className="text-sm">
                    <span className="font-medium">Instructions:</span> {task.specialInstructions}
                  </p>
                )}
                {task.notes && (
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {task.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t">
                {task.taskStatus === 'ASSIGNED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReceiveTask(task.id);
                    }}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium mb-2"
                  >
                    Receive Task
                  </button>
                )}
                {task.taskStatus === 'RECEIVED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartTask(task.id);
                    }}
                    disabled={updating}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium mb-2"
                  >
                    Receive Patient
                  </button>
                )}
                 {(task.taskStatus === 'ASSIGNED' || task.taskStatus === 'RECEIVED') && (
                   <select
                     value={task.taskStatus}
                     onClick={(e) => e.stopPropagation()}
                     onChange={(e) => {
                       e.stopPropagation();
                       handleStatusUpdate(task.id, e.target.value);
                     }}
                     className="w-full text-sm border rounded px-2 py-2"
                   >
                     <option value="ASSIGNED">Assigned</option>
                     <option value="RECEIVED">Received</option>
                     <option value="IN_PROGRESS">In Progress</option>
                     <option value="SERVICE_COMPLETED">Service Completed</option>
                     <option value="COMPLETED">Completed</option>
                     <option value="CANCELLED">Cancelled</option>
                   </select>
                 )}
                 {task.taskStatus === 'IN_PROGRESS' && (
                   <div className="space-y-2">
                     <input
                       type="number"
                       placeholder="Discount Amount"
                       value={endForm[task.id]?.discountAmount ?? ''}
                       onClick={(e) => e.stopPropagation()}
                       onChange={(e) => updateEndForm(task.id, 'discountAmount', e.target.value)}
                       className="w-full text-sm border rounded px-2 py-2"
                     />
                     <input
                       type="text"
                       placeholder="Transaction ID"
                       value={endForm[task.id]?.transactionId ?? ''}
                       onClick={(e) => e.stopPropagation()}
                       onChange={(e) => updateEndForm(task.id, 'transactionId', e.target.value)}
                       className="w-full text-sm border rounded px-2 py-2"
                     />
                     <input
                       type="text"
                       placeholder="bKash Number"
                       value={endForm[task.id]?.bkashNumber ?? ''}
                       onClick={(e) => e.stopPropagation()}
                       onChange={(e) => updateEndForm(task.id, 'bkashNumber', e.target.value)}
                       className="w-full text-sm border rounded px-2 py-2"
                     />
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleEndTask(task.id);
                       }}
                       disabled={updating || !canEndTask(task)}
                       className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                     >
                       End Task
                     </button>
                   </div>
                 )}
                {task.taskStatus === 'SERVICE_COMPLETED' && (
                  <div className="text-sm text-green-700 font-medium">This task was completely ended</div>
                )}
                 {(task.taskStatus === 'ASSIGNED' || task.taskStatus === 'RECEIVED') && (
                   <div className="mt-3 flex gap-2">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         router.push(`/payments?taskId=${task.id}`);
                       }}
                       className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                     >
                       Add Payment
                     </button>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AgentDashboardLayout>
  );
}
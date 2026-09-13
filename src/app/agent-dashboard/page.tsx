'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import AgentDashboardLayout from '@/components/layout/AgentDashboardLayout';
import { getStatusLabel, getStatusColor } from '@/lib/appointmentStatus';

interface TaskAppointment {
  id: string;
  patient?: { id: string; name: string; phone?: string };
  doctor?: { id: string; name: string; specialization?: string };
  hospital?: string;
  date: string;
  status: string;
  serviceType: string;
  serviceFee: number;
  discountPercent?: number;
}

export default function AgentDashboardPage() {
  const [tasks, setTasks] = useState<TaskAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) setTasks(data.data || []);
      else toast.error(data.message || 'Failed to load tasks');
    } catch {
      toast.error('Failed to load tasks');
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchTasks().then(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const transition = async (id: string, status: string) => {
    if (status === 'ongoing') {
      const confirmed = window.confirm('Start this task (mark as Ongoing)?');
      if (!confirmed) return;
    }

    const body: Record<string, unknown> = { status };

    if (status === 'completed') {
      const discount = discounts[id]?.trim();
      if (!discount) {
        toast.error('Please enter the discount percentage first');
        return;
      }
      const num = Number(discount);
      if (Number.isNaN(num) || num < 0 || num > 100) {
        toast.error('Discount must be between 0 and 100');
        return;
      }
      body.discountPercent = num;
    }

    setBusyId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task status updated');
      } else {
        toast.error(data.message || 'Failed to update task');
      }
      await fetchTasks();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AgentDashboardLayout>
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
              className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-600">
                  {new Date(task.date).toLocaleString()}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Patient:</span>{' '}
                  {task.patient?.name || 'Not assigned'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span>{' '}
                  {task.doctor?.name || 'N/A'}{' '}
                  {task.doctor?.specialization ? `(${task.doctor.specialization})` : ''}
                </p>
                {task.hospital && (
                  <p className="text-sm">
                    <span className="font-medium">Hospital:</span> {task.hospital}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Service:</span>{' '}
                  <span className="capitalize">{task.serviceType}</span> — {task.serviceFee} BDT
                </p>
                {task.status === 'completed' && (
                  <p className="text-sm">
                    <span className="font-medium">Discount Given:</span>{' '}
                    <span className="text-green-600 font-semibold">
                      {task.discountPercent ?? 0}%
                    </span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t">
                {task.status === 'pending' && (
                  <p className="text-sm text-yellow-700">Awaiting admin approval.</p>
                )}

                {task.status === 'confirmed' && (
                  <button
                    onClick={() => transition(task.id, 'received')}
                    disabled={busyId === task.id}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Receive Task
                  </button>
                )}

                {task.status === 'received' && (
                  <button
                    onClick={() => transition(task.id, 'ongoing')}
                    disabled={busyId === task.id}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    Task Ongoing (Start)
                  </button>
                )}

                {task.status === 'ongoing' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discounts[task.id] ?? ''}
                        onChange={(e) =>
                          setDiscounts((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        placeholder="e.g. 10"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => transition(task.id, 'completed')}
                      disabled={busyId === task.id}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      End Task
                    </button>
                  </div>
                )}

                {task.status === 'completed' && (
                  <p className="text-center text-sm text-green-700 font-medium">
                    Task Completed
                  </p>
                )}

                {task.status === 'cancelled' && (
                  <p className="text-center text-sm text-red-600">Task Cancelled</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AgentDashboardLayout>
  );
}
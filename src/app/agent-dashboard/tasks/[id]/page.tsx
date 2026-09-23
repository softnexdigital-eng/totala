'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AgentDashboardLayout from '@/components/layout/AgentDashboardLayout';

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
  appointment: {
    id: string;
    date: string;
    serviceType: string;
    serviceFee: number;
    patient?: { name: string; phone?: string; address?: string };
    doctor?: { name: string; specialization?: string };
    hospital?: string;
    notes?: string;
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
  transactionId?: string;
  senderNumber?: string;
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
  RECEIVED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  SERVICE_COMPLETED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'HUB_DIRECT', label: 'Hub Direct' },
];

export default function AgentTaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [endForm, setEndForm] = useState({ discountAmount: '', transactionId: '', bkashNumber: '' });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionId: '',
    senderNumber: '',
    notes: '',
  });
  const [discountForm, setDiscountForm] = useState({
    discountPercent: '',
    discountAmount: '',
  });

  const getAgentToken = () => {
    const match = document.cookie.match(/(?:^|; )agentToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const authHeaders = (): Record<string, string> => {
    const token = getAgentToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        headers: authHeaders(),
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setTask(data.data);
      } else {
        toast.error(data.message || 'Failed to load task');
      }
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (!task?.startTime || task.taskStatus !== 'IN_PROGRESS') {
      setTimerRunning(false);
      return;
    }

    setTimerRunning(true);
    const start = new Date(task.startTime).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [task?.startTime, task?.taskStatus]);

  const handleReceiveTask = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/receive`, {
        method: 'PUT',
        headers: {
          ...authHeaders(),
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task received');
        setTask(data.data);
      } else {
        toast.error(data.message || 'Failed to receive task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleStartTask = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/start`, {
        method: 'PUT',
        headers: {
          ...authHeaders(),
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Patient received, timer started');
        setTask(data.data);
      } else {
        toast.error(data.message || 'Failed to start task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleEndTask = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          discountAmount: parseFloat(endForm.discountAmount) || 0,
          transactionId: endForm.transactionId,
          bkashNumber: endForm.bkashNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task ended');
        setTask(data.data);
        setEndForm({ discountAmount: '', transactionId: '', bkashNumber: '' });
      } else {
        toast.error(data.message || 'Failed to end task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (taskStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ taskStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task status updated');
        setTask(data.data);
      } else {
        toast.error(data.message || 'Failed to update task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTask = async (updates: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Updated successfully');
        setTask(data.data);
        setShowDiscountForm(false);
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          taskId: task.id,
          appointmentId: task.appointment.id,
          agentId: task.agent.id,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          transactionId: paymentForm.transactionId || undefined,
          senderNumber: paymentForm.senderNumber || undefined,
          notes: paymentForm.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment added successfully');
        setShowPaymentForm(false);
        setPaymentForm({
          amount: '',
          paymentMethod: 'CASH',
          transactionId: '',
          senderNumber: '',
          notes: '',
        });
        fetchTask();
      } else {
        toast.error(data.message || 'Failed to add payment');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateTask({
      discountPercent: parseFloat(discountForm.discountPercent) || 0,
      discountAmount: parseFloat(discountForm.discountAmount) || 0,
    });
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatElapsed = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AgentDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AgentDashboardLayout>
    );
  }

  if (!task) {
    return (
      <AgentDashboardLayout>
        <div className="text-center py-16 text-gray-500">Task not found</div>
      </AgentDashboardLayout>
    );
  }

  return (
    <AgentDashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task #{task.id.slice(-8)}</h1>
              <p className="text-gray-600 mt-1">
                Booked on {formatDate(task.appointment.date)}
              </p>
              {task.taskStatus === 'IN_PROGRESS' && timerRunning && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                  Live Timer: {formatElapsed(elapsedSeconds)}
                </div>
              )}
              {task.taskStatus === 'IN_PROGRESS' && !timerRunning && task.startTime && (
                <p className="text-gray-500 text-sm mt-1">
                  Started: {formatDate(task.startTime)}
                </p>
              )}
              {task.taskStatus === 'SERVICE_COMPLETED' && (
                <p className="text-green-700 text-sm mt-1 font-medium">This task was completely ended</p>
              )}
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(
                task.taskStatus
              )}`}
            >
              {task.taskStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{task.appointment.patient?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{task.appointment.patient?.phone || 'N/A'}</p>
                </div>
                {task.appointment.patient?.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{task.appointment.patient.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Appointment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-medium">{task.appointment.doctor?.name || 'N/A'}</p>
                  {task.appointment.doctor?.specialization && (
                    <p className="text-sm text-gray-600">
                      {task.appointment.doctor.specialization}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hospital/Clinic</p>
                  <p className="font-medium">{task.appointment.hospital || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium capitalize">{task.appointment.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Fee</p>
                  <p className="font-medium">{formatCurrency(task.appointment.serviceFee)}</p>
                </div>
                {task.appointment.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Patient Notes</p>
                    <p className="font-medium">{task.appointment.notes}</p>
                  </div>
                )}
                {task.specialInstructions && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <p className="font-medium">{task.specialInstructions}</p>
                  </div>
                )}
                {task.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Admin Notes</p>
                    <p className="font-medium">{task.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {task.taskStatus === 'ASSIGNED' && (
                  <button
                    onClick={handleReceiveTask}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Receive Task
                  </button>
                )}
                {task.taskStatus === 'RECEIVED' && (
                  <button
                    onClick={handleStartTask}
                    disabled={updating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Receive Patient
                  </button>
                )}
                {task.taskStatus === 'IN_PROGRESS' && (
                  <button
                    onClick={handleEndTask}
                    disabled={updating || !endForm.discountAmount || !endForm.transactionId || !endForm.bkashNumber}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    End Task
                  </button>
                )}
                <button
                  onClick={() => setShowDiscountForm(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Add Discount
                </button>
                {(!task.payments || task.payments.length === 0) && (
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add Payment
                  </button>
                )}
                {task.payments && task.payments.length > 0 && (
                  <span className="text-sm text-gray-500 italic">
                    Payment already added for this task
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{formatCurrency(task.appointment.serviceFee)}</span>
                </div>
                {task.discountAmount && task.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(task.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(task.appointment.serviceFee - (task.discountAmount || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              {task.payments && task.payments.length > 0 ? (
                <div className="space-y-3">
                  {task.payments.map((payment) => (
                    <div key={payment.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </div>
                      {payment.transactionId && (
                        <p className="text-sm text-gray-600 mt-1">
                          TXN: {payment.transactionId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No payments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Discount Modal */}
        {showDiscountForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Add Discount</h3>
              <form onSubmit={handleDiscountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountForm.discountPercent}
                    onChange={(e) =>
                      setDiscountForm({ ...discountForm, discountPercent: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter percentage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountForm.discountAmount}
                    onChange={(e) =>
                      setDiscountForm({ ...discountForm, discountAmount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
                  >
                    Save Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDiscountForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Add Payment</h3>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                {paymentForm.paymentMethod !== 'CASH' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID
                      </label>
                      <input
                        type="text"
                        value={paymentForm.transactionId}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, transactionId: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter transaction ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender Number
                      </label>
                      <input
                        type="text"
                        value={paymentForm.senderNumber}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, senderNumber: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter sender number"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Submit Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AgentDashboardLayout>
  );
}

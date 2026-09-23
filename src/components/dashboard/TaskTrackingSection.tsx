'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Super-admin "Task Tracking" widget.
 *
 * It reads `GET /api/tasks/tracking` — the SAME shared `Task` table that the
 * agent mutates via "Receive Task" (`taskStatus -> RECEIVED`, `receiveTime`)
 * and "Receive Patient" (`taskStatus -> IN_PROGRESS`, `startTime`).
 *
 * Because the agent and the super admin read from one shared source, whatever
 * stage the agent is in (and whatever timer they see) is mirrored here in real
 * time — exactly as required.
 */

interface TrackingAgent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}
interface TrackingPatient {
  name: string;
  phone?: string;
  address?: string;
}
interface TrackingDoctor {
  name: string;
  specialization?: string;
}
interface TrackingAppointment {
  id: string;
  date: string;
  serviceType: string;
  serviceFee: number;
  hospital?: string | null;
  patient?: TrackingPatient | null;
  doctor?: TrackingDoctor | null;
}
interface TaskTrackingEntry {
  id: string;
  appointmentId: string;
  agentId: string;
  taskStatus: string;
  displayStatus: string;
  receiveTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  elapsedSeconds?: number | null;
  createdAt: string;
  updatedAt: string;
  agent: TrackingAgent;
  appointment: TrackingAppointment;
}

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: 'bg-blue-100 text-blue-800',
  RECEIVED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  SERVICE_COMPLETED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

function elapsedHms(startTime: string | null | undefined, nowMs: number): string | null {
  if (!startTime) return null;
  const start = new Date(startTime).getTime();
  if (Number.isNaN(start)) return null;
  const diff = nowMs - start;
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtClock(date: string | null | undefined) {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatWhen(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ProgressCell({ task }: { task: TaskTrackingEntry }) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1_000);
    return () => clearInterval(t);
  }, []);

  // IN_PROGRESS === agent clicked "Receive Patient" -> show the LIVE running timer.
  if (task.taskStatus === 'IN_PROGRESS' && task.startTime) {
    return (
      <div className="flex flex-col">
        <span className="font-mono text-sm font-medium text-red-600">
          {elapsedHms(task.startTime, nowMs) ?? '-'}
        </span>
        <span className="text-xs text-slate-500">Started at {fmtClock(task.startTime)}</span>
      </div>
    );
  }

  if (task.endTime) {
    return <span className="text-sm text-slate-700">Ended at {fmtClock(task.endTime)}</span>;
  }
  if (task.startTime) {
    return <span className="text-sm text-slate-700">Started at {fmtClock(task.startTime)}</span>;
  }
  if (task.receiveTime) {
    return <span className="text-sm text-slate-700">Received at {fmtClock(task.receiveTime)}</span>;
  }
  return <span className="text-sm text-slate-400">—</span>;
}

interface TaskTrackingSectionProps {
  token: string;
}

export default function TaskTrackingSection({ token }: TaskTrackingSectionProps) {
  const [tasks, setTasks] = useState<TaskTrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const res = await fetch('/api/tasks/tracking', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (data?.success) {
        setTasks(data.data || []);
      } else if (!res.ok) {
        toast.error(data?.message || 'Failed to load task tracking');
      }
    } catch {
      // keep last known data on transient errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const poll = setInterval(fetchTracking, 30_000);
    return () => clearInterval(poll);
  }, [token]);

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Task Tracking</h2>
        {!loading && tasks.length > 0 && (
          <span className="text-xs text-slate-500">
            {tasks.filter((t) => t.taskStatus === 'IN_PROGRESS').length} in progress ·{' '}
            {tasks.length} total
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-slate-500">No tasks to track.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-600">
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Doctor</th>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Progress / Timer</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-100 align-top">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{task.agent?.name || '-'}</span>
                    {task.agent?.phone && (
                      <span className="block text-xs text-slate-500">{task.agent.phone}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{task.appointment?.patient?.name || '-'}</td>
                  <td className="px-4 py-3">{task.appointment?.doctor?.name || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatWhen(task.appointment?.date ?? new Date().toISOString())}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.displayStatus || task.taskStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <ProgressCell task={task} />
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


'use client';

import { useEffect, useState } from 'react';
import PendingAppointments from '@/components/dashboard/PendingAppointments';
import TaskTrackingSection from '@/components/dashboard/TaskTrackingSection';

interface DashboardSummary {
  todayAppointments: number;
  todayTasks: number;
  completedTasks: number;
  activeAgents: number;
  pendingPayments: number;
  paymentsUnderVerification: number;
  todayIncome: number;
  todayExpense: number;
  todayNet: number;
}

function IconUsers({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c1.2-3 3.4-4.6 6-4.6s4.8 1.6 6 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 8a2.6 2.6 0 1 1 0 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.5 15.4c2.1.4 3.7 1.8 4.5 4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconStethoscope({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 3v6.5a4 4 0 0 0 8 0V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 3H4.5M14 3h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 13.5V16a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconCalendar({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconClipboard({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconCheckCircle({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCurrency({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrendingUp({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tint: { bg: string; text: string; blob: string };
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className={`pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full ${tint.blob}`} />
      <div className="relative flex items-center gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${tint.bg} ${tint.text}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">{value}</p>
        </div>
      </div>
    </div>
  );
}

const TIME_ZONE = 'Asia/Dhaka';

export default function DashboardClient({
  token,
  summary,
  totalPatients,
  totalDoctors,
  totalAppointments,
}: {
  token: string;
  summary: DashboardSummary | null;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now?.toLocaleTimeString('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now?.toLocaleDateString('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hour24 = now
    ? parseInt(now.toLocaleString('en-US', { timeZone: TIME_ZONE, hour: '2-digit', hour12: false }), 10)
    : null;
  const greeting = hour24 === null ? 'Welcome back' : hour24 < 12 ? 'Good morning' : hour24 < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="h-screen overflow-y-auto bg-[#FAFAF8]">
      <div className="mx-auto max-w-9xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero header with live local time */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-teal-700 to-teal-600 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-100">{greeting}</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-teal-100">An overview of patients, doctors, appointments, and financials.</p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 sm:flex-col sm:items-end sm:bg-transparent sm:px-0 sm:py-0">
              <IconClock className="h-5 w-5 text-teal-100 sm:hidden" />
              <div>
                <p className="text-2xl font-semibold tabular-nums sm:text-4xl">{timeStr ?? '--:--:--'}</p>
                <p className="mt-0.5 text-xs text-teal-100 sm:text-sm">{dateStr ?? ' '} · Dhaka time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-3 sm:gap-6">
          <StatCard
            label="Total Patients"
            value={totalPatients}
            icon={<IconUsers />}
            tint={{ bg: 'bg-sky-50', text: 'text-sky-700', blob: 'bg-sky-50/70' }}
          />
          <StatCard
            label="Total Doctors"
            value={totalDoctors}
            icon={<IconStethoscope />}
            tint={{ bg: 'bg-teal-50', text: 'text-teal-700', blob: 'bg-teal-50/70' }}
          />
          <StatCard
            label="Total Appointments"
            value={totalAppointments}
            icon={<IconCalendar />}
            tint={{ bg: 'bg-amber-50', text: 'text-amber-700', blob: 'bg-amber-50/70' }}
          />
        </div>

        {/* Phase 2 Stats Cards */}
        {summary && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Today's Appointments"
                value={summary.todayAppointments}
                icon={<IconCalendar />}
                tint={{ bg: 'bg-blue-50', text: 'text-blue-700', blob: 'bg-blue-50/70' }}
              />
              <StatCard
                label="Today's Tasks"
                value={summary.todayTasks}
                icon={<IconClipboard />}
                tint={{ bg: 'bg-purple-50', text: 'text-purple-700', blob: 'bg-purple-50/70' }}
              />
              <StatCard
                label="Completed Tasks"
                value={summary.completedTasks}
                icon={<IconCheckCircle />}
                tint={{ bg: 'bg-green-50', text: 'text-green-700', blob: 'bg-green-50/70' }}
              />
              <StatCard
                label="Active Agents"
                value={summary.activeAgents}
                icon={<IconUsers />}
                tint={{ bg: 'bg-indigo-50', text: 'text-indigo-700', blob: 'bg-indigo-50/70' }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Pending Payments"
                value={summary.pendingPayments}
                icon={<IconCurrency />}
                tint={{ bg: 'bg-yellow-50', text: 'text-yellow-700', blob: 'bg-yellow-50/70' }}
              />
              <StatCard
                label="Payments Under Verification"
                value={summary.paymentsUnderVerification}
                icon={<IconClock />}
                tint={{ bg: 'bg-orange-50', text: 'text-orange-700', blob: 'bg-orange-50/70' }}
              />
              <StatCard
                label="Today's Income"
                value={summary.todayIncome}
                icon={<IconTrendingUp />}
                tint={{ bg: 'bg-emerald-50', text: 'text-emerald-700', blob: 'bg-emerald-50/70' }}
              />
              <StatCard
                label="Today's Net"
                value={summary.todayNet}
                icon={<IconCurrency />}
                tint={{ bg: 'bg-cyan-50', text: 'text-cyan-700', blob: 'bg-cyan-50/70' }}
              />
            </div>
          </>
        )}

        {/* Pending Appointments Section */}
        {token && <PendingAppointments token={token} />}

        {/* Task Tracking — super admin sees every agent's live task status + timer */}
        {token && <TaskTrackingSection token={token} />}
      </div>
    </div>
  );
}

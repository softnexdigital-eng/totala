'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  getBookingStatusLabel,
  getBookingStatusColor,
  BOOKING_STATUS_OPTIONS,
  formatDate,
} from '@/lib/bookingOptions';

interface AgentOption {
  id: string;
  name: string;
}

interface BookingRow {
  id: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  patientAge?: any;
  patientGender?: string;
  patientAddress?: string;
  agentId?: string;
  agentName?: string;
  agent?: { id: string; name: string };
  serviceNeeded?: string;
  serviceType?: string;
  preferredDate?: string;
  date?: string;
  preferredTime?: string;
  time?: string;
  hospital?: string;
  address?: string;
  status?: string;
  createdAt?: string;
}

export default function AgentBookingRequestsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRes, agentsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/agents'),
        ]);

        const bookingsJson = await bookingsRes.json();
        const agentsJson = await agentsRes.json();

        if (bookingsJson.success) setBookings(bookingsJson.data || []);
        if (agentsJson.success) setAgents(agentsJson.data || []);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const assignAgent = async (id: string, agentId: string) => {
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Agent assigned');
        setBookings((prev) =>
          prev.map((bk) =>
            bk.id === id
              ? {
                  ...bk,
                  agentId,
                  agent: { id: agentId, name: json.data?.agent?.name || bk.agent?.name || '' },
                  agentName: json.data?.agent?.name || bk.agentName || '',
                }
              : bk
          )
        );
      } else {
        toast.error(json.message || 'Failed to assign agent');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmittingId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setSubmittingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Booking status updated');
        setBookings((prev) =>
          prev.map((bk) => (bk.id === id ? { ...bk, status } : bk))
        );
      } else {
        toast.error(json.message || 'Failed to update status');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.patientName || '').toLowerCase().includes(term) ||
      (b.patientPhone || '').includes(term.replace(/\s/g, ''))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Agent Booking Requests</h1>
          <p className="text-gray-600 mt-1">
            Booking requests submitted from the public landing page. Review patient
            details, assign an agent and update the status of each request.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by patient name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No booking requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Needed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{b.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{b.patientName || '-'}</p>
                        {b.patientGender && (
                          <p className="text-xs text-gray-500">{b.patientGender}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{b.patientPhone || '-'}</td>
                    <td className="px-6 py-4 text-sm">{b.patientAge || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={b.agentId || ''}
                        disabled={submittingId === b.id}
                        onChange={(e) => {
                          const agentId = e.target.value;
                          if (!agentId) return;
                          assignAgent(b.id, agentId);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-green-500"
                      >
                        <option value="" disabled>
                          {submittingId === b.id ? 'Updating...' : 'Select agent'}
                        </option>
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {b.serviceNeeded || b.serviceType || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(b.preferredDate || b.date)}</td>
                    <td className="px-6 py-4 text-sm">{b.preferredTime || b.time || '-'}</td>
                    <td className="px-6 py-4 text-sm max-w-xs">
                      {b.patientAddress || b.address || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBookingStatusColor(b.status)}`}
                      >
                        {getBookingStatusLabel(b.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(b.createdAt)}</td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <select
                        value=""
                        disabled={submittingId === b.id}
                        onChange={(e) => {
                          if (e.target.value) updateStatus(b.id, e.target.value);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-green-500"
                      >
                        <option value="" disabled>
                          {submittingId === b.id ? 'Updating...' : 'Change status'}
                        </option>
                        {BOOKING_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
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
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';

interface FinancialReport {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  income: {
    serviceCharge: number;
    appointmentPayment: number;
    agentCollectedPayment: number;
    hubDirectPayment: number;
    onlinePayment: number;
    otherIncome: number;
  };
  expense: {
    agentPayment: number;
    transportExpense: number;
    serviceExpense: number;
    otherExpense: number;
  };
}

interface DailySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  totalPaid: number;
  totalDue: number;
  totalPending: number;
  totalRefund: number;
}

interface FinancialReportClientProps {
  financialData: FinancialReport | null;
  dailyData: DailySummary | null;
}

export default function FinancialReportClient({
  financialData,
  dailyData,
}: FinancialReportClientProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [report, setReport] = useState<FinancialReport | null>(financialData);
  const [summary, setSummary] = useState<DailySummary | null>(dailyData);

  useEffect(() => {
    const fetchFinancialReport = async () => {
      if (!startDate && !endDate) return;

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`/api/reports/financial?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
      }
    };

    fetchFinancialReport();
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchDailySummary = async () => {
      if (!selectedDate) return;

      const response = await fetch(`/api/reports/daily-summary?date=${selectedDate}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
      }
    };

    fetchDailySummary();
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setReport(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Financial Report */}
      {report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(report.totalIncome)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Expense</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(report.totalExpense)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Net Amount</p>
              <p className={`text-2xl font-bold mt-2 ${
                report.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(report.netAmount)}
              </p>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Income Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Service Charge</p>
                <p className="font-medium">{formatCurrency(report.income.serviceCharge)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Appointment Payment</p>
                <p className="font-medium">{formatCurrency(report.income.appointmentPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Agent Collected Payment</p>
                <p className="font-medium">{formatCurrency(report.income.agentCollectedPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hub Direct Payment</p>
                <p className="font-medium">{formatCurrency(report.income.hubDirectPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Online Payment</p>
                <p className="font-medium">{formatCurrency(report.income.onlinePayment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Other Income</p>
                <p className="font-medium">{formatCurrency(report.income.otherIncome)}</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Agent Payment/Commission</p>
                <p className="font-medium">{formatCurrency(report.expense.agentPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transport Expense</p>
                <p className="font-medium">{formatCurrency(report.expense.transportExpense)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Expense</p>
                <p className="font-medium">{formatCurrency(report.expense.serviceExpense)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Other Approved Expenses</p>
                <p className="font-medium">{formatCurrency(report.expense.otherExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Expense</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Net Amount</p>
              <p className={`text-xl font-bold mt-1 ${
                summary.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.netAmount)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-xl font-bold text-yellow-600 mt-1">
                {formatCurrency(summary.totalDue)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-3">
              <p className="text-sm text-gray-600">Total Refund</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {formatCurrency(summary.totalRefund)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

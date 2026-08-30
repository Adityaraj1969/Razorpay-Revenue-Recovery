'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatINR } from '@/lib/formatters';

interface PTPRecord {
  id: string;
  customerName: string;
  daysOffset: number; // 0 for today, 1 for tomorrow, etc.
  promisedDateStr: string;
  promisedTime: string;
  amountPaise: number;
  method: string;
  channel: 'VOICE_AGENT' | 'WHATSAPP' | 'EMAIL';
  transcriptExcerpt: string;
  status: 'PTP_LOCKED' | 'RECOVERED' | 'ESCALATED_HUMAN' | 'PENDING';
}

export default function PTPCalendarPage() {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PTP_LOCKED' | 'RECOVERED' | 'ESCALATED_HUMAN'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [countdownStr, setCountdownStr] = useState<string>('00h 00m 00s');

  // Real-time Next 7 Days generator
  const [timelineDays, setTimelineDays] = useState<Array<{
    offset: number;
    date: Date;
    dateISO: string;
    dayLabel: string;
    dateLabel: string;
    isToday: boolean;
  }>>([]);

  const [ptpCases, setPtpCases] = useState<PTPRecord[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize Real-Time Dates and Dynamic Commitments
  useEffect(() => {
    const today = new Date();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const isToday = i === 0;
      const isTomorrow = i === 1;

      const dayLabel = isToday
        ? 'Today'
        : isTomorrow
        ? 'Tomorrow'
        : d.toLocaleDateString('en-IN', { weekday: 'short' });

      const dateLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const dateISO = d.toISOString().split('T')[0];

      days.push({
        offset: i,
        date: d,
        dateISO,
        dayLabel,
        dateLabel,
        isToday,
      });
    }

    setTimelineDays(days);

    // Populate commitments anchored to live dynamic dates
    setPtpCases([
      {
        id: 'CAS-1030',
        customerName: 'John Doe (SaaS Pro)',
        daysOffset: 0,
        promisedDateStr: days[0].dateISO,
        promisedTime: '16:30 IST',
        amountPaise: 149900,
        method: 'UPI AutoPay Mandate',
        channel: 'WHATSAPP',
        transcriptExcerpt: '"Salary credit ho gaya hai, aaj shaam tak UPI se pay kar dunga."',
        status: 'PTP_LOCKED',
      },
      {
        id: 'CAS-1029',
        customerName: 'Acme Corp (B2B Invoice)',
        daysOffset: 1,
        promisedDateStr: days[1].dateISO,
        promisedTime: '11:00 IST',
        amountPaise: 32000000,
        method: 'Virtual Account (NEFT/RTGS)',
        channel: 'VOICE_AGENT',
        transcriptExcerpt: '"Kal subah 11 baje accounts team RTGS initiate kar degi."',
        status: 'PTP_LOCKED',
      },
      {
        id: 'CAS-1032',
        customerName: 'TechFlow Enterprises',
        daysOffset: 2,
        promisedDateStr: days[2].dateISO,
        promisedTime: '14:00 IST',
        amountPaise: 15000000,
        method: 'Razorpay Smart Collect',
        channel: 'VOICE_AGENT',
        transcriptExcerpt: '"Parso 2 baje meeting ke baad payment link se clear karenge."',
        status: 'PTP_LOCKED',
      },
      {
        id: 'CAS-1034',
        customerName: 'Priya Patel (E-Commerce)',
        daysOffset: 0,
        promisedDateStr: days[0].dateISO,
        promisedTime: '10:15 IST',
        amountPaise: 450000,
        method: '1-Click WhatsApp Link',
        channel: 'WHATSAPP',
        transcriptExcerpt: '"Link mil gaya hai, abhi card se complete karti hoon."',
        status: 'RECOVERED',
      },
      {
        id: 'CAS-1035',
        customerName: 'Bharat Traders',
        daysOffset: 4,
        promisedDateStr: days[4].dateISO,
        promisedTime: '18:00 IST',
        amountPaise: 48500000,
        method: 'Smart Collect Bank Transfer',
        channel: 'EMAIL',
        transcriptExcerpt: '"Vendor payment cycle on Friday."',
        status: 'PTP_LOCKED',
      },
      {
        id: 'CAS-1036',
        customerName: 'Wayne Enterprises',
        daysOffset: 0,
        promisedDateStr: days[0].dateISO,
        promisedTime: '09:00 IST',
        amountPaise: 8000000,
        method: 'Subscription Retry',
        channel: 'VOICE_AGENT',
        transcriptExcerpt: '"Broken commitment after 2 unanswered attempts."',
        status: 'ESCALATED_HUMAN',
      },
    ]);
  }, []);

  // Live countdown clock to next upcoming commitment window (today 18:00 IST)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(18, 0, 0, 0); // End of standard banking operating window

      if (now > target) {
        target.setDate(target.getDate() + 1);
        target.setHours(11, 0, 0, 0); // Next morning window
      }

      const diffMs = target.getTime() - now.getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdownStr(
        `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Action Handlers
  const handleSendReminder = (ptp: PTPRecord) => {
    showToast(`📲 Real-time WhatsApp PTP Reminder dispatched to ${ptp.customerName} for ${ptp.promisedTime}!`);
  };

  const handleMarkFulfilled = (ptpId: string) => {
    setPtpCases((prev) =>
      prev.map((c) => (c.id === ptpId ? { ...c, status: 'RECOVERED' } : c))
    );
    showToast(`✅ Case ${ptpId} marked as FULFILLED & RECOVERED! Immutable audit ledger updated.`);
  };

  // Filter cases by day offset & status
  const filteredCases = ptpCases.filter((c) => {
    const matchesDay = selectedDayOffset === null || c.daysOffset === selectedDayOffset;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesDay && matchesStatus;
  });

  // Calculate daily stats for the 7-day timeline bar chart
  const getDayStats = (offset: number) => {
    const dayCases = ptpCases.filter((c) => c.daysOffset === offset);
    const totalPaise = dayCases.reduce((sum, c) => sum + c.amountPaise, 0);
    const count = dayCases.length;
    return { count, totalPaise };
  };

  const maxDailyPaise = Math.max(
    ...timelineDays.map((d) => getDayStats(d.offset).totalPaise),
    1
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Promise to Pay (PTP) Calendar</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Real-time tracking of AI Voice & WhatsApp payment commitments mapped to live calendar deadlines.
          </p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="text-left">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Next Banking Window</div>
            <div className="text-2xl font-bold text-brand-primary font-mono tracking-tight">{countdownStr}</div>
          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl shadow-sm text-sm font-semibold flex justify-between items-center animate-fade-in-down">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Live 7-Day Interactive Real-Time Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Live Commitment Timeline (Next 7 Days)</h2>
            <p className="text-xs text-gray-500">Click any date bar to filter commitments due on that day.</p>
          </div>
          {selectedDayOffset !== null && (
            <button
              onClick={() => setSelectedDayOffset(null)}
              className="text-xs font-semibold text-brand-primary hover:underline bg-blue-50 border border-blue-200 px-3 py-1 rounded-md"
            >
              Reset to All 7 Days ✕
            </button>
          )}
        </div>

        {/* Real-time Bars */}
        <div className="grid grid-cols-7 gap-2 bg-gray-50/80 p-4 rounded-xl border border-gray-100 items-end min-h-[160px]">
          {timelineDays.map((day) => {
            const { count, totalPaise } = getDayStats(day.offset);
            const isSelected = selectedDayOffset === day.offset;
            const heightPercent = totalPaise > 0 ? Math.max(20, Math.round((totalPaise / maxDailyPaise) * 100)) : 10;

            return (
              <button
                key={day.offset}
                onClick={() => setSelectedDayOffset(isSelected ? null : day.offset)}
                className={`group flex flex-col items-center justify-end h-full p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-100/70 ring-2 ring-brand-primary shadow-sm'
                    : 'hover:bg-white hover:shadow-sm'
                }`}
              >
                {/* Tooltip Amount */}
                <div className="mb-2 text-center">
                  <span className="text-[11px] font-bold text-gray-700 block font-mono">
                    {totalPaise > 0 ? formatINR(totalPaise) : '₹0'}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-medium">
                    {count} {count === 1 ? 'case' : 'cases'}
                  </span>
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-10 rounded-t-lg transition-all ${
                    day.isToday
                      ? 'bg-amber-400 group-hover:bg-amber-500'
                      : totalPaise > 0
                      ? 'bg-brand-primary group-hover:bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                ></div>

                {/* Day Labels */}
                <div className="mt-3 text-center border-t border-gray-200/60 pt-2 w-full">
                  <div className={`text-xs font-bold ${day.isToday ? 'text-amber-600' : 'text-gray-800'}`}>
                    {day.dayLabel}
                  </div>
                  <div className="text-[10px] text-gray-400">{day.dateLabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commitments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3 bg-gray-50">
          <div className="flex space-x-2">
            {[
              { id: 'ALL', label: 'All Commitments' },
              { id: 'PTP_LOCKED', label: 'PTP Locked' },
              { id: 'RECOVERED', label: 'Recovered' },
              { id: 'ESCALATED_HUMAN', label: 'Escalated' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Showing <strong>{filteredCases.length}</strong> commitments
          </div>
        </div>

        <table className="w-full text-left text-sm whitespace-nowrap divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Case ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Live Commitment Time</th>
              <th className="px-6 py-4">Amount at Risk</th>
              <th className="px-6 py-4">Fulfillment Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Autonomous Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredCases.map((ptp) => (
              <tr key={ptp.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-brand-primary">{ptp.id}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{ptp.customerName}</div>
                  <div className="text-xs text-gray-400 italic truncate max-w-xs mt-0.5" title={ptp.transcriptExcerpt}>
                    {ptp.transcriptExcerpt}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-800">{ptp.promisedDateStr}</div>
                  <div className="text-xs text-gray-500 font-mono">{ptp.promisedTime}</div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                  {formatINR(ptp.amountPaise)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {ptp.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={ptp.status} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {ptp.status === 'PTP_LOCKED' && (
                    <>
                      <button
                        onClick={() => handleSendReminder(ptp)}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-brand-primary border border-blue-200 rounded hover:bg-brand-primary hover:text-white transition-colors"
                      >
                        Send Reminder
                      </button>
                      <button
                        onClick={() => handleMarkFulfilled(ptp.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        Mark Kept ✓
                      </button>
                    </>
                  )}
                  {ptp.status === 'RECOVERED' && (
                    <span className="text-xs font-semibold text-emerald-600">Settlement Verified</span>
                  )}
                  {ptp.status === 'ESCALATED_HUMAN' && (
                    <span className="text-xs font-semibold text-red-600">In Review Desk</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No Promise-to-Pay commitments scheduled for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

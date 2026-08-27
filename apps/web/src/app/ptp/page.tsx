import React from 'react';
import { StatusBadge } from '@/components/StatusBadge';

export default function PTPCalendarPage() {
  const mockPTPs = [
    { id: 'CASE-001', customer: 'Acme Corp', promisedDate: '2026-08-30', amount: 4500000, method: 'Virtual Account', status: 'PTP_LOCKED' },
    { id: 'CASE-015', customer: 'Stark Ind', promisedDate: '2026-08-27', amount: 1200000, method: 'Payment Link', status: 'RECOVERED' },
    { id: 'CASE-042', customer: 'Wayne Ent', promisedDate: '2026-08-25', amount: 800000, method: 'Subscription Retry', status: 'ESCALATED_HUMAN' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promise to Pay (PTP) Calendar</h1>
          <p className="text-gray-500 mt-2">Track and manage upcoming customer payment commitments.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-center">
          <div className="text-xs text-gray-500 font-semibold uppercase">Next Deadline In</div>
          <div className="text-2xl font-bold text-blue-600 font-mono">14h 22m</div>
        </div>
      </div>

      {/* Timeline Visualization (Mockup) */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Commitment Timeline (Next 7 Days)</h2>
        <div className="relative h-24 bg-gray-50 rounded-lg border flex items-end px-4 pb-2">
          {/* Mock Timeline bars */}
          <div className="w-1/6 flex flex-col items-center group">
            <div className="w-8 bg-green-400 h-16 rounded-t transition-all group-hover:bg-green-500"></div>
            <div className="text-xs mt-2 text-gray-500">Aug 26</div>
          </div>
          <div className="w-1/6 flex flex-col items-center group">
            <div className="w-8 bg-amber-400 h-10 rounded-t transition-all group-hover:bg-amber-500"></div>
            <div className="text-xs mt-2 text-gray-500 font-bold">Today</div>
          </div>
          <div className="w-1/6 flex flex-col items-center group">
            <div className="w-8 bg-blue-400 h-12 rounded-t transition-all group-hover:bg-blue-500"></div>
            <div className="text-xs mt-2 text-gray-500">Aug 28</div>
          </div>
          <div className="w-1/6 flex flex-col items-center group">
            <div className="w-8 bg-blue-200 h-4 rounded-t"></div>
            <div className="text-xs mt-2 text-gray-400">Aug 29</div>
          </div>
          <div className="w-1/6 flex flex-col items-center group">
            <div className="w-8 bg-blue-400 h-20 rounded-t transition-all group-hover:bg-blue-500"></div>
            <div className="text-xs mt-2 text-gray-500">Aug 30</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Case ID</th>
              <th className="px-6 py-4 font-medium text-gray-600">Customer</th>
              <th className="px-6 py-4 font-medium text-gray-600">Promised Date</th>
              <th className="px-6 py-4 font-medium text-gray-600">Amount (₹)</th>
              <th className="px-6 py-4 font-medium text-gray-600">Fulfillment Method</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockPTPs.map((ptp, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-gray-500">{ptp.id}</td>
                <td className="px-6 py-4 font-medium">{ptp.customer}</td>
                <td className="px-6 py-4 text-gray-600">{ptp.promisedDate}</td>
                <td className="px-6 py-4 font-medium">{(ptp.amount / 100).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-gray-600">{ptp.method}</td>
                <td className="px-6 py-4"><StatusBadge status={ptp.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

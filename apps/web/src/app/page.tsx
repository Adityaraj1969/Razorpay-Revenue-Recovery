'use client';
import { formatINR, formatPercent } from '../lib/formatters';
import { useEventStream } from '../lib/sse';

export default function DashboardPage() {
  const events = useEventStream('/api/v1/events/stream');

  const cases = [
    { id: 'CAS-1029', customer: 'Acme Corp', entity: 'B2B Invoice', amount: 32000000, rootCause: 'DGN_09 (Disputed)', state: 'HITL_REVIEW', action: 'A10' },
    { id: 'CAS-1030', customer: 'John Doe', entity: 'Subscription', amount: 149900, rootCause: 'DGN_01 (NSF)', state: 'PTP_LOCKED', action: 'A9' },
    { id: 'CAS-1031', customer: 'Jane Smith', entity: 'Checkout', amount: 450000, rootCause: 'DGN_07 (Abandoned)', state: 'RECOVERED', action: 'A5' },
    { id: 'CAS-1032', customer: 'TechFlow Inc', entity: 'B2B Invoice', amount: 15000000, rootCause: 'DGN_08 (Overdue)', state: 'SCHEDULED', action: 'A8' },
  ];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Executive Revenue Radar
        </h2>
        <p className="mt-1 text-sm text-gray-500">Real-time recovery metrics and live agent action stream.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-red-500 bg-gradient-to-b from-red-50 to-white">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">REVENUE AT RISK</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{formatINR(1245000000)}</dd>
            <dd className="mt-2 text-sm text-gray-600">1,000 active cases</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-emerald-500 bg-gradient-to-b from-emerald-50 to-white">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">TREATED RECOVERED</dt>
            <dd className="mt-1 text-3xl font-semibold text-emerald-600">{formatINR(748494000)}</dd>
            <dd className="mt-2 text-sm text-gray-600">66.80% recovery rate</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-blue-500 bg-gradient-to-b from-blue-50 to-white">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">INCREMENTAL YIELD (IRY)</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">{formatPercent(49.30)}</dd>
            <dd className="mt-2 text-sm text-gray-600">vs 17.50% Control</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-indigo-500 bg-gradient-to-b from-indigo-50 to-white">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">NET ROI MULTIPLIER</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">1,542.2&times;</dd>
            <dd className="mt-2 text-sm text-gray-600">Net: {formatINR(552400000)}</dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cases Table */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Active Recovery Cases</h3>
          </div>
          <div className="px-4 py-3 border-b border-gray-200 flex space-x-4 text-sm">
            <span className="font-semibold text-brand-primary border-b-2 border-brand-primary pb-1">All</span>
            <span className="text-gray-500 cursor-pointer">Checkouts</span>
            <span className="text-gray-500 cursor-pointer">Subscriptions</span>
            <span className="text-gray-500 cursor-pointer">B2B Invoices</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {cases.map((c) => (
              <li key={c.id} className="hover:bg-gray-50 cursor-pointer">
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-brand-primary truncate">{c.id} - {c.customer}</p>
                    <p className="mt-1 text-sm text-gray-500">{c.entity} • {c.rootCause}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-bold text-gray-900">{formatINR(c.amount)}</p>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.state === 'RECOVERED' ? 'bg-green-100 text-green-800' :
                      c.state === 'PTP_LOCKED' ? 'bg-amber-100 text-amber-800' :
                      c.state === 'HITL_REVIEW' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {c.state}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Stream */}
        <div className="bg-gray-900 shadow rounded-lg text-white">
          <div className="px-4 py-5 border-b border-gray-700 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium">Live Agent Action Stream</h3>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="p-4 h-96 overflow-y-auto space-y-3 font-mono text-sm">
            {events.map((evt, i) => (
              <div key={evt.id} className="animate-fade-in-down">
                <div className="flex items-start">
                  <span className="text-gray-500 text-xs mt-1 w-20 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1 ${evt.color}`}>
                      {evt.type}
                    </span>
                    <p className="text-gray-300">{evt.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

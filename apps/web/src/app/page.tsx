'use client';

import React, { useState } from 'react';
import { formatINR, formatPercent } from '../lib/formatters';
import { useEventStream } from '../lib/sse';
import { CaseDrawer } from '../components/CaseDrawer';
import { RecoveryCase } from '../components/CaseTable';
import { StatusBadge } from '../components/StatusBadge';

export default function DashboardPage() {
  const events = useEventStream('/api/v1/events/stream');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHECKOUT' | 'SUBSCRIPTION' | 'B2B_INVOICE'>('ALL');
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const initialCases: RecoveryCase[] = [
    { id: 'CAS-1029', customerName: 'Acme Corp', entityType: 'B2B_INVOICE', amount: 32000000, rootCause: 'DGN_09 (Disputed)', status: 'HITL_REVIEW', action: 'A10_ESCALATE_TO_HUMAN' },
    { id: 'CAS-1030', customerName: 'John Doe', entityType: 'SUBSCRIPTION', amount: 149900, rootCause: 'DGN_01 (NSF)', status: 'PTP_LOCKED', action: 'A9_CAPTURE_PROMISE_TO_PAY' },
    { id: 'CAS-1031', customerName: 'Jane Smith', entityType: 'CHECKOUT', amount: 450000, rootCause: 'DGN_07 (Abandoned)', status: 'RECOVERED', action: 'A5_OFFER_BOUNDED_INCENTIVE' },
    { id: 'CAS-1032', customerName: 'TechFlow Inc', entityType: 'B2B_INVOICE', amount: 15000000, rootCause: 'DGN_08 (Overdue)', status: 'SCHEDULED', action: 'A8_B2B_DUNNING_STEP' },
  ];

  const filteredCases = activeTab === 'ALL'
    ? initialCases
    : initialCases.filter((c) => c.entityType === activeTab);

  const handleCaseClick = (c: RecoveryCase) => {
    setSelectedCase(c);
    setIsDrawerOpen(true);
  };

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
        <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Active Recovery Cases</h3>
            <span className="text-xs text-gray-500">Click any row to open diagnostic drawer</span>
          </div>
          
          {/* Interactive Cohort Filter Tabs */}
          <div className="px-4 py-3 border-b border-gray-200 flex space-x-2 bg-gray-50 text-sm">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CHECKOUT', label: 'Checkouts' },
              { id: 'SUBSCRIPTION', label: 'Subscriptions' },
              { id: 'B2B_INVOICE', label: 'B2B Invoices' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ul className="divide-y divide-gray-200 flex-1">
            {filteredCases.map((c) => (
              <li
                key={c.id}
                onClick={() => handleCaseClick(c)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-brand-primary hover:underline flex items-center">
                      {c.id} - {c.customerName}
                      <span className="ml-2 text-xs text-gray-400 font-mono font-normal">→ Inspect</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {c.entityType === 'B2B_INVOICE' ? 'B2B Invoice' : c.entityType === 'SUBSCRIPTION' ? 'Subscription' : 'Checkout'} • {c.rootCause}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-bold text-gray-900">{formatINR(c.amount)}</p>
                    <div className="mt-1">
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {filteredCases.length === 0 && (
              <li className="p-8 text-center text-sm text-gray-500">
                No active recovery cases found for this filter cohort.
              </li>
            )}
          </ul>
        </div>

        {/* Live Stream */}
        <div className="bg-gray-900 shadow rounded-lg text-white flex flex-col">
          <div className="px-4 py-5 border-b border-gray-700 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium">Live Agent Action Stream</h3>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="p-4 h-96 overflow-y-auto space-y-3 font-mono text-sm">
            {events.map((evt) => (
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

      {/* Case Diagnostic & Audit Drawer */}
      <CaseDrawer
        caseData={selectedCase}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

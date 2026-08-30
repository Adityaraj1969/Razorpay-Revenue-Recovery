'use client';

import React, { useState } from 'react';
import { formatINR } from '../../lib/formatters';
import { CaseDrawer } from '../../components/CaseDrawer';
import { RecoveryCase } from '../../components/CaseTable';
import { StatusBadge } from '../../components/StatusBadge';
import { DiagnosisBadge } from '../../components/DiagnosisBadge';

export default function CasesPage() {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('ALL');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const initialCases: RecoveryCase[] = [
    { id: 'CAS-1029', customerName: 'Acme Corp', entityType: 'B2B_INVOICE', amount: 32000000, rootCause: 'DGN_09', status: 'HITL_REVIEW', action: 'A10_ESCALATE_TO_HUMAN' },
    { id: 'CAS-1030', customerName: 'John Doe', entityType: 'SUBSCRIPTION', amount: 149900, rootCause: 'DGN_01', status: 'PTP_LOCKED', action: 'A9_CAPTURE_PROMISE_TO_PAY' },
    { id: 'CAS-1031', customerName: 'Jane Smith', entityType: 'CHECKOUT', amount: 450000, rootCause: 'DGN_07', status: 'RECOVERED', action: 'A5_OFFER_BOUNDED_INCENTIVE' },
    { id: 'CAS-1032', customerName: 'TechFlow Inc', entityType: 'B2B_INVOICE', amount: 15000000, rootCause: 'DGN_08', status: 'SCHEDULED', action: 'A8_B2B_DUNNING_STEP' },
    { id: 'CAS-1033', customerName: 'Rohan Sharma', entityType: 'SUBSCRIPTION', amount: 299900, rootCause: 'DGN_02', status: 'ACTION_TAKEN', action: 'A7_REQUEST_CARD_UPDATE' },
    { id: 'CAS-1034', customerName: 'Priya Patel', entityType: 'CHECKOUT', amount: 89900, rootCause: 'DGN_05', status: 'RECOVERED', action: 'A1_RETRY_PAYMENT_SAME_METHOD' },
    { id: 'CAS-1035', customerName: 'Bharat Traders', entityType: 'B2B_INVOICE', amount: 48500000, rootCause: 'DGN_10', status: 'ACTION_TAKEN', action: 'A3_SEND_REMINDER_SOFT' },
  ];

  const filteredCases = initialCases.filter((c) => {
    const matchesDiagnosis = selectedDiagnosis === 'ALL' || c.rootCause.startsWith(selectedDiagnosis);
    const matchesEntity = selectedEntity === 'ALL' || c.entityType === selectedEntity;
    const matchesSearch = searchQuery === '' || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiagnosis && matchesEntity && matchesSearch;
  });

  const handleInspect = (c: RecoveryCase) => {
    setSelectedCase(c);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Opportunities & Pipeline</h2>
          <p className="mt-1 text-sm text-gray-500">Manage, filter, and inspect all active autonomous recovery cases.</p>
        </div>
        <div className="bg-white border rounded-lg px-3 py-1.5 shadow-sm text-xs font-mono text-gray-500">
          Showing <strong className="text-gray-900">{filteredCases.length}</strong> of {initialCases.length} cases
        </div>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        {/* Interactive Filter & Search Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 justify-between items-center bg-gray-50">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md text-sm shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary w-64"
            />

            {/* Diagnosis Filter */}
            <select
              value={selectedDiagnosis}
              onChange={(e) => setSelectedDiagnosis(e.target.value)}
              className="border border-gray-300 rounded-md text-sm shadow-sm p-2 bg-white font-medium text-gray-700 cursor-pointer"
            >
              <option value="ALL">All Diagnosis Codes</option>
              <option value="DGN_01">DGN_01 (Insufficient Funds)</option>
              <option value="DGN_02">DGN_02 (Card Expired)</option>
              <option value="DGN_05">DGN_05 (Gateway Timeout)</option>
              <option value="DGN_07">DGN_07 (Cart Abandonment)</option>
              <option value="DGN_08">DGN_08 (Invoice Overdue)</option>
              <option value="DGN_09">DGN_09 (Disputed Invoice)</option>
              <option value="DGN_10">DGN_10 (VA Underpaid)</option>
            </select>

            {/* Entity Filter */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="border border-gray-300 rounded-md text-sm shadow-sm p-2 bg-white font-medium text-gray-700 cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              <option value="CHECKOUT">Checkouts</option>
              <option value="SUBSCRIPTION">Subscriptions</option>
              <option value="B2B_INVOICE">B2B Invoices</option>
            </select>

            {(selectedDiagnosis !== 'ALL' || selectedEntity !== 'ALL' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedDiagnosis('ALL');
                  setSelectedEntity('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-brand-primary hover:underline px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID / Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnosis Cause</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount at Risk</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifecycle Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCases.map((c) => (
              <tr
                key={c.id}
                onClick={() => handleInspect(c)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-brand-primary">{c.id}</div>
                  <div className="text-sm text-gray-700 font-medium">{c.customerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {c.entityType === 'B2B_INVOICE' ? 'B2B Invoice' : c.entityType === 'SUBSCRIPTION' ? 'Subscription' : 'Checkout'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DiagnosisBadge code={c.rootCause} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                  {formatINR(c.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspect(c);
                    }}
                    className="inline-flex items-center px-3 py-1 border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                  >
                    Inspect ↗
                  </button>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No cases match the selected filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

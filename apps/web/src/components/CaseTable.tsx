'use client';

import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';

export interface RecoveryCase {
  id: string;
  customerName: string;
  entityType: 'CHECKOUT' | 'SUBSCRIPTION' | 'B2B_INVOICE';
  amount: number;
  rootCause: string;
  status: string;
  action: string;
}

interface CaseTableProps {
  cases: RecoveryCase[];
  onRowClick?: (c: RecoveryCase) => void;
}

const formatINR = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(paise / 100);
};

export const CaseTable: React.FC<CaseTableProps> = ({ cases, onRowClick }) => {
  const [filter, setFilter] = useState<'ALL' | 'CHECKOUT' | 'SUBSCRIPTION' | 'B2B_INVOICE'>('ALL');
  
  const filteredCases = filter === 'ALL' 
    ? cases 
    : cases.filter(c => c.entityType === filter);

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="border-b px-4 py-3 flex space-x-4 bg-gray-50">
        {['ALL', 'CHECKOUT', 'SUBSCRIPTION', 'B2B_INVOICE'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${filter === tab ? 'bg-white shadow-sm border text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            {tab === 'B2B_INVOICE' ? 'B2B Invoices' : tab === 'CHECKOUT' ? 'Checkouts' : tab === 'SUBSCRIPTION' ? 'Subscriptions' : 'All'}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors">ID ↕</th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors">Customer ↕</th>
              <th className="px-6 py-3">Entity Type</th>
              <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors">Amount ↕</th>
              <th className="px-6 py-3">Root Cause</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCases.map(c => (
              <tr 
                key={c.id} 
                onClick={() => onRowClick?.(c)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{c.customerName}</td>
                <td className="px-6 py-4 text-gray-600">{c.entityType}</td>
                <td className="px-6 py-4 font-medium">{formatINR(c.amount)}</td>
                <td className="px-6 py-4 text-gray-600">{c.rootCause}</td>
                <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                <td className="px-6 py-4 text-gray-600">{c.action}</td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No active cases found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

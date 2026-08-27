import React from 'react';

interface DiagnosisBadgeProps {
  code: string;
}

const dgnMap: Record<string, { label: string; color: string }> = {
  DGN_01: { label: 'Insufficient Funds', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  DGN_02: { label: 'Card Expired/Blocked', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  DGN_03: { label: 'Generic Decline', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  DGN_04: { label: 'Auth Failure', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  DGN_05: { label: 'Gateway Downtime', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  DGN_06: { label: 'Mandate Failure', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  DGN_07: { label: 'Cart Abandonment', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  DGN_10: { label: 'VA Amount Mismatch', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  DGN_11: { label: 'Fraud Block', color: 'bg-red-100 text-red-800 border-red-200' },
  DGN_12: { label: 'Unknown Error', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export const DiagnosisBadge: React.FC<DiagnosisBadgeProps> = ({ code }) => {
  const info = dgnMap[code] || { label: code, color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${info.color}`}>
      {code}: {info.label}
    </span>
  );
};

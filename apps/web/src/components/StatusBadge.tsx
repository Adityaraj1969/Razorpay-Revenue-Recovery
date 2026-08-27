import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let config = { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' };

  switch (status.toUpperCase()) {
    case 'RECOVERED':
      config = { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      break;
    case 'PTP_LOCKED':
      config = { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
      break;
    case 'SCHEDULED':
    case 'ACTION_TAKEN':
      config = { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
      break;
    case 'ESCALATED_HUMAN':
      config = { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      break;
    case 'SUPPRESSED':
      config = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
      break;
    case 'OPEN':
    default:
      config = { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' };
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}></span>
      {status.replace('_', ' ')}
    </span>
  );
};

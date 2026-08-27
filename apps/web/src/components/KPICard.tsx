import React from 'react';

interface KPICardProps {
  label: string;
  value: string;
  subtitle: string;
  color: 'green' | 'red' | 'blue' | 'amber' | 'emerald';
  icon?: React.ReactNode;
}

const colorMap = {
  green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-900',
  red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-900',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900',
  amber: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-900',
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
};

export const KPICard: React.FC<KPICardProps> = ({ label, value, subtitle, color, icon }) => {
  return (
    <div className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm opacity-80">{label}</h3>
        {icon && <div className="opacity-70">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-70 font-medium">{subtitle}</div>
      </div>
    </div>
  );
};

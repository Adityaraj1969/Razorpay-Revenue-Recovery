'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from './Logo';
import { useHITLCount } from '../lib/HITLContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { pendingCount } = useHITLCount();

  const navItems = [
    { name: 'Revenue Radar', icon: '📊', path: '/' },
    { name: 'Opportunities & Pipeline', icon: '📋', path: '/cases' },
    { name: 'Human Console', icon: '⚠️', path: '/console' },
    { name: 'PTP Calendar', icon: '📅', path: '/ptp' },
    { name: 'Audit Log', icon: '🔒', path: '/audit' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className={`h-screen bg-[#0C2340] text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          {!collapsed ? (
            <Logo size="md" variant="full" />
          ) : (
            <Logo size="sm" variant="icon" />
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          ☰
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const showBadge = item.path === '/console' && pendingCount > 0;
          return (
            <Link 
              key={item.name}
              href={item.path}
              className={`flex items-center px-4 py-3 transition-colors ${isActive ? 'bg-[#3B82F6]/20 border-r-4 border-[#3B82F6] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
              title={collapsed ? item.name : undefined}
            >
              <span className="text-xl flex-shrink-0 w-8 text-center">{item.icon}</span>
              {!collapsed && (
                <span className="ml-3 font-medium flex-1 text-sm">{item.name}</span>
              )}
              {!collapsed && showBadge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-xs text-white/40 text-center">
        {!collapsed ? 'Razorpay Buildathon 2026' : 'RB26'}
      </div>
    </div>
  );
};

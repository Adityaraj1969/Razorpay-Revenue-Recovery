'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const iconDimensions = {
    sm: { width: 30, height: 30, text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { width: 36, height: 36, text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { width: 46, height: 46, text: 'text-2xl', badge: 'text-xs px-2.5 py-0.5' },
  };

  const { width, height, text, badge } = iconDimensions[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Exact 3-Arc Emblem with Center Animation */}
      <div className="relative flex items-center justify-center shrink-0 bg-white p-1 rounded-xl shadow-md border border-white/20 transition-transform duration-200 hover:scale-105">
        <svg
          width={width}
          height={height}
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="segAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0A93C" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="segNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B3A63" />
              <stop offset="100%" stopColor="#0C2340" />
            </linearGradient>
            <linearGradient id="segEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Three modular arcs: Detect (Amber) -> Decide & Act (Navy) -> Recovered (Emerald) */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="url(#segAmber)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="55.85 195.48"
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />

          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="url(#segNavy)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="55.85 195.48"
            strokeDashoffset="-83.78"
            transform="rotate(-90 60 60)"
          />

          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="url(#segEmerald)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="55.85 195.48"
            strokeDashoffset="-167.55"
            transform="rotate(-90 60 60)"
          />

          {/* Small directional arrowhead on the emerald segment showing continuous loop */}
          <path d="M 83 30 L 90.5 33.8 L 85.5 40.4 Z" fill="#059669" />

          {/* Center live pulse: the system watching live signals */}
          <circle cx="60" cy="60" r="6.5" fill="#0C2340" />
          <circle cx="60" cy="60" r="6.5" fill="none" stroke="#0C2340" strokeWidth="1.5" opacity="0.35">
            <animate attributeName="r" values="6.5;14;6.5" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* Modular Brand Wordmark */}
      {variant !== 'icon' && (
        <div className="flex items-center gap-2 leading-none">
          <div className="flex items-baseline">
            <span className={`font-extrabold tracking-tight text-white ${text}`}>
              Rev
            </span>
            <span className={`font-extrabold tracking-tight text-amber-400 ${text}`}>
              Loop
            </span>
          </div>

          <span className={`font-mono font-bold tracking-wider uppercase rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-sm ${badge}`}>
            AI
          </span>
        </div>
      )}
    </div>
  );
};

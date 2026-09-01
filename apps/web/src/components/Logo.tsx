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
    sm: { width: 32, height: 32, text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { width: 38, height: 38, text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { width: 48, height: 48, text: 'text-2xl', badge: 'text-xs px-2.5 py-0.5' },
  };

  const { width, height, text, badge } = iconDimensions[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Balanced 3-Arc Emblem Seamlessly Integrated with Sidepanel */}
      <div className="relative flex items-center justify-center shrink-0 p-1 rounded-xl bg-[#081B33]/90 border border-blue-400/25 shadow-lg shadow-black/20 hover:border-blue-400/50 transition-all duration-300">
        <svg
          width={width}
          height={height}
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* 1. Amber Detection Gradient */}
            <linearGradient id="segAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* 2. Luminous Blue/Navy Action Arc (Balanced with #0C2340 Sidepanel) */}
            <linearGradient id="segLuminousNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* 3. Emerald Recovery & Settlement Gradient */}
            <linearGradient id="segEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Soft Ambient Radial Glow */}
            <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0C2340" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Ambient Glow */}
          <circle cx="60" cy="60" r="36" fill="url(#hubGlow)" />

          {/* Three Modular Arcs: Amber -> Luminous Blue -> Emerald */}
          {/* Arc 1: Detect (Amber) */}
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

          {/* Arc 2: Decide & Act (Luminous Blue/Navy) */}
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="none"
            stroke="url(#segLuminousNavy)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="55.85 195.48"
            strokeDashoffset="-83.78"
            transform="rotate(-90 60 60)"
          />

          {/* Arc 3: Recovered & Verified (Emerald) */}
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

          {/* Directional Arrowhead showing the closed loop continues */}
          <path d="M 83 30 L 90.5 33.8 L 85.5 40.4 Z" fill="#10B981" />

          {/* Center Pulse: The Autonomous Cognitive Hub Watching Live Signals */}
          <circle cx="60" cy="60" r="7" fill="#60A5FA" />
          <circle cx="60" cy="60" r="3.5" fill="#FFFFFF" />
          <circle cx="60" cy="60" r="7" fill="none" stroke="#60A5FA" strokeWidth="1.8" opacity="0.6">
            <animate attributeName="r" values="7;18;7" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
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

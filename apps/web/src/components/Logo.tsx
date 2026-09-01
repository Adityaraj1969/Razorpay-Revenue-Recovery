'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const iconDimensions = {
    sm: { width: 28, height: 28, text: 'text-base', badge: 'text-[9px] px-1 py-0.5' },
    md: { width: 34, height: 34, text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { width: 44, height: 44, text: 'text-2xl', badge: 'text-xs px-2 py-0.5' },
  };

  const { width, height, text, badge } = iconDimensions[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modular Closed-Loop Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={width}
          height={height}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200 hover:scale-105 drop-shadow-md"
        >
          <defs>
            {/* Dynamic Electric Blue to Cyan Gradient (Razorpay / Trust) */}
            <linearGradient id="rl-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Dynamic Emerald to Teal Gradient (Recovered Capital / Yield) */}
            <linearGradient id="rl-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* AI Core Radial Glow */}
            <radialGradient id="rl-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dark Glass Container */}
          <rect width="40" height="40" rx="10" fill="#0C1B2E" />
          <rect width="40" height="40" rx="10" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

          {/* Soft ambient background radial glow */}
          <circle cx="20" cy="20" r="14" fill="url(#rl-core-glow)" />

          {/* Top Closed-Loop Arc with Arrowhead (Ingestion & Diagnosis) */}
          <path
            d="M10 20C10 14.477 14.477 10 20 10C24.418 10 28.18 12.85 29.5 16.8"
            stroke="url(#rl-blue)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M31 12L30 17.5L24.5 16.5"
            stroke="url(#rl-blue)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom Closed-Loop Return Arc with Arrowhead (Recovery & Settlement) */}
          <path
            d="M30 20C30 25.523 25.523 30 20 30C15.582 30 11.82 27.15 10.5 23.2"
            stroke="url(#rl-emerald)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M9 28L10 22.5L15.5 23.5"
            stroke="url(#rl-emerald)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central AI Pulse Hub (Cognitive Invariant Node) */}
          <circle cx="20" cy="20" r="3.2" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="1.8" fill="#2563EB" />
        </svg>
      </div>

      {/* Modular Brand Wordmark */}
      {variant !== 'icon' && (
        <div className="flex items-center gap-2 leading-none">
          <div className="flex items-baseline">
            <span className={`font-extrabold tracking-tight text-white ${text}`}>
              Rev
            </span>
            <span className={`font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 ${text}`}>
              Loop
            </span>
          </div>
          
          <span className={`font-mono font-bold tracking-wider uppercase rounded-md bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-400/40 text-sky-300 shadow-sm ${badge}`}>
            AI
          </span>
        </div>
      )}
    </div>
  );
};

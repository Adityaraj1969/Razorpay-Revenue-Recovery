'use client';

import React, { useEffect, useState, useRef } from 'react';

export interface FeedEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  icon?: string;
}

interface LiveEventFeedProps {
  initialEvents?: FeedEvent[];
  demoMode?: boolean;
}

const typeColorMap: Record<string, string> = {
  WEBHOOK_RECEIVED: 'bg-blue-100 text-blue-800 border-blue-200',
  DIAGNOSIS_COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
  ACTION_DISPATCHED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SETTLEMENT_VERIFIED: 'bg-green-100 text-green-800 border-green-200',
  PTP_LOCKED: 'bg-amber-100 text-amber-800 border-amber-200',
  HARD_STOP_TRIGGERED: 'bg-red-100 text-red-800 border-red-200',
};

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ initialEvents = [], demoMode = false }) => {
  const [events, setEvents] = useState<FeedEvent[]>(initialEvents);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!demoMode) return;
    
    const types = Object.keys(typeColorMap);
    const interval = setInterval(() => {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newEvent: FeedEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomType,
        timestamp: new Date().toLocaleTimeString(),
        description: `Demo event generated for ${randomType.toLowerCase().replace('_', ' ')}`,
        icon: '⚡'
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [demoMode]);

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Live Event Stream</h3>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-gray-500">Live</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="overflow-y-auto p-4 space-y-3" 
        style={{ maxHeight: '320px' }}
      >
        {events.map(event => (
          <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 bg-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-xl flex-shrink-0 mt-1">{event.icon || '🔹'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${typeColorMap[event.type] || 'bg-gray-100 text-gray-800'}`}>
                  {event.type}
                </span>
                <span className="text-xs text-gray-400">{event.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 truncate">{event.description}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center text-gray-400 py-8 text-sm">Waiting for events...</div>
        )}
      </div>
    </div>
  );
};

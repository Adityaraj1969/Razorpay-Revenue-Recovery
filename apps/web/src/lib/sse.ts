'use client';
import { useState, useEffect } from 'react';

export function useEventStream(url: string) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Demo mode implementation for mockup
    const demoEvents = [
      { id: '1', type: 'WHATSAPP_RECOVERED', summary: 'Payment recovered for Case #90210 via WhatsApp link', timestamp: new Date().toISOString(), color: 'bg-green-100 text-green-800' },
      { id: '2', type: 'PTP_LOCKED', summary: 'Promise to Pay logged for Case #44102', timestamp: new Date(Date.now() - 5000).toISOString(), color: 'bg-amber-100 text-amber-800' },
      { id: '3', type: 'VOICE_CONNECTED', summary: 'AI Voice Agent connected with customer for Case #33190', timestamp: new Date(Date.now() - 15000).toISOString(), color: 'bg-purple-100 text-purple-800' },
      { id: '4', type: 'HARD_STOP_TRIGGERED', summary: 'Case #11002 halted: Customer requested opt-out', timestamp: new Date(Date.now() - 45000).toISOString(), color: 'bg-red-100 text-red-800' },
    ];
    
    setEvents(demoEvents);

    const interval = setInterval(() => {
      const newEvent = {
        id: Math.random().toString(36).substring(7),
        type: 'ACTION_DISPATCHED',
        summary: `Automated email sent for Case #${Math.floor(Math.random() * 100000)}`,
        timestamp: new Date().toISOString(),
        color: 'bg-blue-100 text-blue-800'
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 4000);

    return () => clearInterval(interval);
  }, [url]);

  return events;
}

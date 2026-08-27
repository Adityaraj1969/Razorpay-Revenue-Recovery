'use client';

import React from 'react';
import { RecoveryCase } from './CaseTable';
import { DiagnosisBadge } from './DiagnosisBadge';

interface CaseDrawerProps {
  caseData: RecoveryCase | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatINR = (paise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(paise / 100);
};

export const CaseDrawer: React.FC<CaseDrawerProps> = ({ caseData, isOpen, onClose }) => {
  if (!isOpen || !caseData) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-[540px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{caseData.customerName}</h2>
            <div className="text-sm text-gray-500 font-mono mt-1">{caseData.id} • {formatINR(caseData.amount)}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Diagnostic Breakdown */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Diagnostic Breakdown</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 font-medium">Detected Category</span>
                <DiagnosisBadge code={caseData.rootCause} />
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Confidence Score</span>
                  <span>96%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border text-sm text-gray-600 font-mono shadow-inner">
                Telemetry Context: Issuer bank declined due to temporary downtime. No fraud flags.
              </div>
            </div>
          </section>

          {/* Policy Decision */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Policy Decision</h3>
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <div className="font-medium text-gray-800 mb-1">Rule Triggered: Pol_SmartRetries</div>
              <div className="text-sm text-gray-600">Authorized action: <span className="font-semibold">{caseData.action}</span></div>
            </div>
          </section>

          {/* Audit Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Audit Timeline</h3>
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {[
                { seq: 1, type: 'PAYMENT_FAILED', time: '10:00 AM', actor: 'SYSTEM', hash: 'a1b2c3d4e5f6' },
                { seq: 2, type: 'DIAGNOSED', time: '10:00:05 AM', actor: 'AI_AGENT', hash: 'f6e5d4c3b2a1' },
                { seq: 3, type: 'POLICY_EVALUATED', time: '10:00:10 AM', actor: 'SYSTEM', hash: 'b2c3d4e5f6a1' },
                { seq: 4, type: 'ACTION_EXECUTED', time: '10:01:00 AM', actor: 'SYSTEM', hash: 'd4e5f6a1b2c3' }
              ].map((event, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 top-1.5 border-2 border-white"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">Seq #{event.seq} • {event.time} • {event.actor}</div>
                      <div className="font-medium text-sm text-gray-800">{event.type}</div>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 border rounded">
                      #{event.hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

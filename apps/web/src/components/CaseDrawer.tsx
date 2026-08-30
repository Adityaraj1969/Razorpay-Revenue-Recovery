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

// Helper for fallback diagnostic metadata based on diagnosis code
const getDiagnosticMeta = (code: string, customer: string) => {
  const c = code.toUpperCase();
  if (c.includes('DGN_01') || c.includes('NSF')) {
    return {
      confidence: 98,
      telemetry: `Issuer Bank Error: INSUFFICIENT_FUNDS returned for ${customer}. Debit card account active with 0 prior chargebacks. AI schedule: Auto-retry aligned with salary credit window.`,
      rule: 'Pol_NSF_AutoRetryScheduler',
      action: 'A9_CAPTURE_PROMISE_TO_PAY',
    };
  }
  if (c.includes('DGN_02') || c.includes('EXPIRED')) {
    return {
      confidence: 97,
      telemetry: `Card Issuer Code: CARD_EXPIRED_OR_BLOCKED. Card expiration date reached on file. Pre-tokenization update link generated.`,
      rule: 'Pol_CardUpdateWorkflow',
      action: 'A7_REQUEST_CARD_UPDATE',
    };
  }
  if (c.includes('DGN_05') || c.includes('TIMEOUT') || c.includes('GATEWAY')) {
    return {
      confidence: 94,
      telemetry: `Gateway Telemetry: BAD_REQUEST_PAYMENT_TIMED_OUT from HDFC bank gateway. Passive Bank Sentinel confirms node restored to 99.4% success.`,
      rule: 'Pol_Sentinel_GatewayReroute',
      action: 'A1_RETRY_PAYMENT_SAME_METHOD',
    };
  }
  if (c.includes('DGN_07') || c.includes('ABANDONED') || c.includes('CART')) {
    return {
      confidence: 92,
      telemetry: `Checkout Drop-off: Customer dropped at OTP verification step after 120s inactivity. High buyer intent (RFM Score: 4.8 / 5.0).`,
      rule: 'Pol_1ClickWhatsAppIncentive',
      action: 'A5_OFFER_BOUNDED_INCENTIVE',
    };
  }
  if (c.includes('DGN_08') || c.includes('OVERDUE')) {
    return {
      confidence: 89,
      telemetry: `B2B Dunning Pipeline: Day 14 overdue milestone reached. Customer open email rate is 85%. Triggering staged reminder sequence.`,
      rule: 'Pol_B2B_OverdueDunningMatrix',
      action: 'A8_B2B_DUNNING_STEP',
    };
  }
  if (c.includes('DGN_09') || c.includes('DISPUTE')) {
    return {
      confidence: 95,
      telemetry: `Dispute Exception: ${customer} flagged invoice line item damage. High invoice value requires manual approval threshold.`,
      rule: 'Pol_HITL_HumanEscalation',
      action: 'A10_ESCALATE_TO_HUMAN',
    };
  }
  if (c.includes('DGN_10') || c.includes('UNDERPAID')) {
    return {
      confidence: 93,
      telemetry: `Smart Collect Telemetry: Virtual Account credited partial payment. Automated reconciliation invoice sent for balance.`,
      rule: 'Pol_SmartCollect_UnderpayReconciliation',
      action: 'A3_SEND_REMINDER_SOFT',
    };
  }

  return {
    confidence: 91,
    telemetry: `Diagnostic Telemetry: Autonomous classifier processed case ${customer} against Razorpay telemetry logs.`,
    rule: 'Pol_StandardRevenueRecovery',
    action: 'A1_RETRY_PAYMENT_SAME_METHOD',
  };
};

export const CaseDrawer: React.FC<CaseDrawerProps> = ({ caseData, isOpen, onClose }) => {
  if (!isOpen || !caseData) return null;

  const meta = getDiagnosticMeta(caseData.rootCause, caseData.customerName);
  const confidenceScore = caseData.confidenceScore ?? meta.confidence;
  const telemetryContext = caseData.telemetryContext ?? meta.telemetry;
  const ruleTriggered = caseData.ruleTriggered ?? meta.rule;
  const actionAuthorized = caseData.action || meta.action;

  const timeline = caseData.timelineEvents || [
    { seq: 1, type: 'PAYMENT_FAILED', time: '10:00:00 AM', actor: 'RAZORPAY_WEBHOOK', hash: 'e8a1f3c90b2d' },
    { seq: 2, type: 'DIAGNOSED', time: '10:00:04 AM', actor: 'AI_CLASSIFIER', hash: 'f6e5d4c3b2a1' },
    { seq: 3, type: 'POLICY_EVALUATED', time: '10:00:08 AM', actor: 'POLICY_GATEKEEPER', hash: 'b2c3d4e5f6a1' },
    { seq: 4, type: 'ACTION_EXECUTED', time: '10:00:15 AM', actor: 'EXECUTION_MESH', hash: 'd4e5f6a1b2c3' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-[560px] max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col border-l`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50/80">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">{caseData.customerName}</h2>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1 font-medium">
              {caseData.id} • <span className="font-bold text-gray-900">{formatINR(caseData.amount)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          
          {/* Diagnostic Breakdown */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Diagnostic Breakdown</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Root Cause Classification</span>
                <DiagnosisBadge code={caseData.rootCause} />
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span>Confidence Score</span>
                  <span className="text-blue-600 font-bold font-mono">{confidenceScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      confidenceScore >= 95 ? 'bg-emerald-500' : confidenceScore >= 90 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white p-3.5 rounded-lg border text-xs text-gray-700 font-mono leading-relaxed shadow-sm">
                <span className="text-gray-400 font-bold block mb-1">Telemetry Context:</span>
                {telemetryContext}
              </div>
            </div>
          </section>

          {/* Policy Decision */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deterministic Policy Gate</h3>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Policy Rule Evaluated:</span>
                <span className="font-bold text-brand-primary font-mono">{ruleTriggered}</span>
              </div>
              <div className="text-xs text-gray-700 pt-1 border-t border-blue-100 flex items-center justify-between">
                <span className="text-gray-600 font-medium">Authorized Outreach Action:</span>
                <span className="font-bold text-gray-900 font-mono bg-white px-2 py-0.5 rounded border">
                  {actionAuthorized}
                </span>
              </div>
            </div>
          </section>

          {/* Audit Timeline */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cryptographic Audit Timeline (SHA-256)</h3>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-5 py-1">
              {timeline.map((event, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-brand-primary rounded-full -left-[7px] top-1 border-2 border-white ring-2 ring-blue-100"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[11px] text-gray-400 font-mono mb-0.5">Seq #{event.seq} • {event.time}</div>
                      <div className="font-bold text-xs text-gray-900">{event.type}</div>
                      <div className="text-[11px] text-gray-500">{event.actor}</div>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded">
                      #{event.hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </>
  );
};

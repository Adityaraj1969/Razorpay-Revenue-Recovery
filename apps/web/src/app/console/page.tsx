'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '../../lib/formatters';
import { useHITLCount } from '../../lib/HITLContext';

interface HITLCase {
  id: string;
  customerName: string;
  entityType: string;
  rootCause: string;
  amountPaise: number;
  flaggedReason: string;
  customerExcerpt: string;
  recommendedResolution: string;
  creditNoteAmountPaise: number;
  status: 'PENDING_REVIEW' | 'CREDIT_APPROVED' | 'REASSIGNED_SALES' | 'DISMISSED';
}

export default function ConsolePage() {
  const [cases, setCases] = useState<HITLCase[]>([
    {
      id: 'CAS-8422',
      customerName: 'Global Exports Pvt Ltd',
      entityType: 'B2B Invoice',
      rootCause: 'Overdue Disputed (DGN_09)',
      amountPaise: 32000000,
      flaggedReason: 'Customer responded to dunning email claiming 10% of items in recent shipment were damaged.',
      customerExcerpt: '"We received the shipment on Tuesday but unfortunately 2 of the 20 pallets were completely crushed. I cannot pay the full invoice until this is resolved."',
      recommendedResolution: 'Issue 10% Credit Note (₹32,000) and generate dynamic Razorpay Smart Collect link for adjusted balance ₹2,88,000.',
      creditNoteAmountPaise: 3200000,
      status: 'PENDING_REVIEW',
    },
    {
      id: 'CAS-9104',
      customerName: 'Apex Logistics Ltd',
      entityType: 'B2B Invoice',
      rootCause: 'Disputed Tax Invoice (DGN_09)',
      amountPaise: 18500000,
      flaggedReason: 'Customer claims GSTIN number on invoice #INV-9901 does not match registered Maharashtra entity.',
      customerExcerpt: '"Please revise the GST invoice with our SEZ tax exemption certificate before we process the RTGS transfer."',
      recommendedResolution: 'Route to Finance & Tax team for SEZ zero-rating endorsement.',
      creditNoteAmountPaise: 0,
      status: 'PENDING_REVIEW',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const activeCase = cases[currentIndex];

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleApproveCreditNote = () => {
    setCases((prev) =>
      prev.map((c, i) =>
        i === currentIndex
          ? { ...c, status: 'CREDIT_APPROVED' }
          : c
      )
    );
    showToast(`✅ Credit Note Approved for ${activeCase.customerName}! 1-Click Recovery Payment Link generated and dispatched via WhatsApp/Email.`, 'success');
  };

  const handleReassignToSales = () => {
    setCases((prev) =>
      prev.map((c, i) =>
        i === currentIndex
          ? { ...c, status: 'REASSIGNED_SALES' }
          : c
      )
    );
    showToast(`📋 ${activeCase.id} successfully reassigned to Account Executive & Sales desk with CRM ticket #SLS-4029.`, 'info');
  };

  const handleDismiss = () => {
    setCases((prev) =>
      prev.map((c, i) =>
        i === currentIndex
          ? { ...c, status: 'DISMISSED' }
          : c
      )
    );
    showToast(`⚠️ Case ${activeCase.id} marked as dismissed. Automatic recovery outreach paused.`, 'warn');
  };

  const pendingCount = cases.filter((c) => c.status === 'PENDING_REVIEW').length;
  const { setPendingCount } = useHITLCount();

  useEffect(() => {
    setPendingCount(pendingCount);
  }, [pendingCount, setPendingCount]);

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Human Console (HITL)
          </h2>
          <p className="mt-1 text-sm text-gray-500">Manual review queue for high-value disputes and AI exception triage.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            {pendingCount} Pending Triage
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-white disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(cases.length - 1, prev + 1))}
              disabled={currentIndex === cases.length - 1}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-white disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {feedbackToast && (
        <div
          className={`p-4 rounded-lg border text-sm font-medium flex items-center justify-between shadow-md transition-all ${
            feedbackToast.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : feedbackToast.type === 'info'
              ? 'bg-blue-50 border-blue-300 text-blue-800'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}
        >
          <span>{feedbackToast.message}</span>
          <button onClick={() => setFeedbackToast(null)} className="ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Case Review Card */}
      {activeCase && (
        <div className="bg-white shadow rounded-xl p-6 border-l-4 border-red-500 space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-gray-900">Case #{activeCase.id} • {activeCase.customerName}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">Queue {currentIndex + 1} of {cases.length}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{activeCase.entityType} • {activeCase.rootCause}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 font-mono">{formatINR(activeCase.amountPaise)}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                  activeCase.status === 'CREDIT_APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : activeCase.status === 'REASSIGNED_SALES'
                    ? 'bg-blue-100 text-blue-800'
                    : activeCase.status === 'DISMISSED'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {activeCase.status}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg space-y-3 border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Diagnostic Reason & Excerpt</h4>
            <p className="text-sm text-gray-700">
              <strong>Flagged Reason:</strong> {activeCase.flaggedReason}
            </p>
            <div className="border-l-4 border-indigo-400 pl-4 italic text-sm text-gray-700 bg-white p-3 rounded shadow-sm">
              {activeCase.customerExcerpt}
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-1">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">AI Proposed Resolution</h4>
            <p className="text-sm text-gray-800 font-medium">{activeCase.recommendedResolution}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleApproveCreditNote}
              disabled={activeCase.status !== 'PENDING_REVIEW'}
              className="bg-brand-primary text-white px-5 py-2.5 rounded-lg shadow text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center"
            >
              ✓ Approve Credit Note & Send Link
            </button>
            <button
              onClick={handleReassignToSales}
              disabled={activeCase.status !== 'PENDING_REVIEW'}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Re-assign to Sales
            </button>
            <button
              onClick={handleDismiss}
              disabled={activeCase.status !== 'PENDING_REVIEW'}
              className="bg-white border border-red-300 text-red-700 px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium hover:bg-red-50 disabled:opacity-50 ml-auto transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

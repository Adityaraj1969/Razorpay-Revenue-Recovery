'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [voiceAttempts, setVoiceAttempts] = useState(2);
  const [whatsappMessages, setWhatsappMessages] = useState(3);
  const [dunningEmails, setDunningEmails] = useState(4);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('19:00');
  const [marginFloor, setMarginFloor] = useState(5.0);
  
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);
  const [showKillSwitchConfirm, setShowKillSwitchConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('✅ Merchant recovery guardrails and TRAI operating windows saved successfully!');
  };

  const handleToggleKillSwitch = () => {
    const nextState = !isKillSwitchActive;
    setIsKillSwitchActive(nextState);
    setShowKillSwitchConfirm(false);
    if (nextState) {
      showToast('🛑 EMERGENCY KILL SWITCH ACTIVATED! All automated outbound recovery workflows have been immediately halted.');
    } else {
      showToast('🟢 Kill Switch Deactivated. Standard autonomous recovery schedules resumed.');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Settings & Guardrails</h2>
          <p className="mt-1 text-sm text-gray-500">Configure regulatory compliance, channel touchpoint caps, and safety limits.</p>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-lg shadow-sm text-sm font-semibold flex justify-between items-center animate-fade-in-down">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Kill Switch Active Warning Banner */}
      {isKillSwitchActive && (
        <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">EMERGENCY KILL SWITCH IS CURRENTLY ACTIVE</h4>
              <p className="text-xs text-red-100">All outbound WhatsApp messages, voice calls, and automated payment retries are blocked.</p>
            </div>
          </div>
          <button
            onClick={() => setShowKillSwitchConfirm(true)}
            className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-gray-100 transition-colors"
          >
            Deactivate Kill Switch
          </button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Channel Rate Limits */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Channel Rate Limits (per case)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Voice Attempts</label>
            <input
              type="number"
              min={0}
              max={5}
              value={voiceAttempts}
              onChange={(e) => setVoiceAttempts(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
            <p className="text-xs text-gray-400 mt-1">TRAI statutory cap: 2 voice attempts per case.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max WhatsApp Messages</label>
            <input
              type="number"
              min={0}
              max={10}
              value={whatsappMessages}
              onChange={(e) => setWhatsappMessages(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max Dunning Emails</label>
            <input
              type="number"
              min={0}
              max={10}
              value={dunningEmails}
              onChange={(e) => setDunningEmails(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Margin Concession Floor (%)</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={marginFloor}
              onChange={(e) => setMarginFloor(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum bounded incentive discount permitted for AI offers (capped at 5%).</p>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm text-sm transition-all"
          >
            Save Guardrails
          </button>
        </div>

        {/* TRAI Operating Hours & Emergency Controls */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">TRAI Statutory Quiet Hours</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Start Time (IST)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">End Time (IST)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Outreach is strictly prohibited between 21:00 and 09:00 IST in accordance with Telecom Commercial Communications regulations.
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-bold text-red-600 mb-2 flex items-center">
              <span className="mr-1.5">🛑</span> Emergency Operational Controls
            </h3>
            <button
              type="button"
              onClick={() => setShowKillSwitchConfirm(true)}
              className={`w-full py-3 px-4 rounded-lg shadow text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isKillSwitchActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isKillSwitchActive ? 'Deactivate Kill Switch' : 'Activate Kill Switch'}
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              {isKillSwitchActive
                ? 'Click to resume normal closed-loop recovery operations.'
                : 'Instantly halts all automated outbound communications across all merchant channels.'}
            </p>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showKillSwitchConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowKillSwitchConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-50 w-full max-w-md border space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-bold text-lg text-gray-900">
                {isKillSwitchActive ? 'Deactivate Kill Switch?' : 'Activate Global Kill Switch?'}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {isKillSwitchActive
                ? 'This will resume outbound automated recovery actions and allow the AI engine to dispatch messages and calls.'
                : 'This will immediately abort all in-flight recovery attempts, stop voice agent calls, and pause all scheduled dunning queues.'}
            </p>
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowKillSwitchConfirm(false)}
                className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleKillSwitch}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow ${
                  isKillSwitchActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {isKillSwitchActive ? 'Resume' : 'Halt All'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

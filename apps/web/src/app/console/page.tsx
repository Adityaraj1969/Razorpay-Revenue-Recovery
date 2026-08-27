import { formatINR } from '../../lib/formatters';

export default function ConsolePage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Human Console (HITL)
        </h2>
        <p className="mt-1 text-sm text-gray-500">Manual review queue for escalated cases.</p>
      </header>

      <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-red-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold">Case #CAS-8422 • Global Exports</h3>
            <p className="text-sm text-gray-500">B2B Invoice • Overdue Disputed (DGN_09)</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{formatINR(32000000)}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
              ESCALATED_HUMAN
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Diagnostic Summary</h4>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Flagged Reason:</strong> Customer responded to dunning email claiming 10% of items in recent shipment were damaged.
          </p>
          <div className="border-l-4 border-indigo-300 pl-4 italic text-sm text-gray-600 bg-white p-3 rounded">
            "We received the shipment on Tuesday but unfortunately 2 of the 20 pallets were completely crushed. I cannot pay the full invoice until this is resolved."
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="bg-brand-primary text-white px-4 py-2 rounded shadow text-sm font-medium hover:bg-opacity-90">
            Approve Credit Note & Send Link
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-gray-50">
            Re-assign to Sales
          </button>
          <button className="bg-white border border-red-300 text-red-700 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-red-50 ml-auto">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

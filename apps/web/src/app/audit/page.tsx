export default function AuditPage() {
  const audits = [
    { seq: 4, type: 'ACTION_DISPATCHED', actor: 'SYSTEM', hash: '8f4a2b...', prevHash: '1c9d4e...', ts: '2026-08-26T10:15:00Z' },
    { seq: 3, type: 'DIAGNOSIS_COMPLETED', actor: 'AI_ENGINE', hash: '1c9d4e...', prevHash: 'a3b5c7...', ts: '2026-08-26T10:14:55Z' },
    { seq: 2, type: 'WEBHOOK_RECEIVED', actor: 'WEBHOOK_GW', hash: 'a3b5c7...', prevHash: '000000...', ts: '2026-08-26T10:14:50Z' },
  ];

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Audit Log Explorer</h2>
          <p className="mt-1 text-sm text-gray-500">Cryptographic hash chain verification.</p>
        </div>
        <button className="bg-brand-primary text-white px-4 py-2 rounded shadow text-sm font-medium">
          Verify Chain Integrity
        </button>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden font-mono text-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Seq</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Timestamp</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Event</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Actor</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Hash Chain</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {audits.map((a) => (
              <tr key={a.seq} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{a.seq}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(a.ts).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-brand-primary">{a.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{a.actor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Prev: {a.prevHash}</span>
                    <span className="text-green-600 font-bold">Curr: {a.hash}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

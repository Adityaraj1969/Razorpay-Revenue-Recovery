import { formatINR } from '../../lib/formatters';

export default function CasesPage() {
  const cases = [
    { id: 'CAS-1029', customer: 'Acme Corp', entity: 'B2B Invoice', amount: 32000000, rootCause: 'DGN_09 (Disputed)', state: 'HITL_REVIEW', action: 'A10' },
    { id: 'CAS-1030', customer: 'John Doe', entity: 'Subscription', amount: 149900, rootCause: 'DGN_01 (NSF)', state: 'PTP_LOCKED', action: 'A9' },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Opportunities & Pipeline</h2>
        <p className="mt-1 text-sm text-gray-500">Manage all open recovery cases.</p>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex space-x-2">
            <select className="border-gray-300 rounded-md text-sm shadow-sm p-2 bg-white">
              <option>All Diagnosis Codes</option>
              <option>DGN_01 (NSF)</option>
              <option>DGN_09 (Disputed)</option>
            </select>
            <select className="border-gray-300 rounded-md text-sm shadow-sm p-2 bg-white">
              <option>All Entities</option>
              <option>Checkouts</option>
              <option>Subscriptions</option>
            </select>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID / Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity / Cause</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{c.id}</div>
                  <div className="text-sm text-gray-500">{c.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{c.entity}</div>
                  <div className="text-sm text-gray-500">{c.rootCause}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatINR(c.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {c.state}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-brand-primary hover:text-blue-900">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

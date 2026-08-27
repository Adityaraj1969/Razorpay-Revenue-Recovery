export default function SettingsPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Settings & Guardrails</h2>
        <p className="mt-1 text-sm text-gray-500">Configure recovery limits and operating hours.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Rate Limits (per case)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Voice Attempts</label>
              <input type="number" defaultValue={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max WhatsApp Messages</label>
              <input type="number" defaultValue={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Dunning Emails</label>
              <input type="number" defaultValue={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">TRAI Operating Hours</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input type="time" defaultValue="09:00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" defaultValue="19:00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-red-600">Emergency Controls</h3>
            <button className="w-full bg-red-600 text-white px-4 py-3 rounded-md shadow text-sm font-bold hover:bg-red-700 uppercase tracking-wider">
              Activate Kill Switch
            </button>
            <p className="mt-2 text-xs text-gray-500">Instantly halts all automated outbound communications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

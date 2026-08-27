import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RevLoop AI Dashboard',
  description: 'AI Revenue Recovery Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen bg-gray-50`}>
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-brand-primary text-white flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
              RevLoop
              <span className="ml-1 text-blue-400">AI</span>
            </h1>
            <div className="mt-2 flex items-center text-xs font-medium text-gray-300">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE MODE
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {[
              { name: 'Revenue Radar', path: '/' },
              { name: 'Opportunities & Pipeline', path: '/cases' },
              { name: 'Human Console', path: '/console' },
              { name: 'PTP Calendar', path: '/ptp' },
              { name: 'Audit Log', path: '/audit' },
              { name: 'Settings', path: '/settings' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white text-gray-300"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

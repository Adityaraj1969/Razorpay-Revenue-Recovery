import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '../components/Sidebar';
import { HITLProvider } from '../lib/HITLContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RevLoop AI Dashboard — Razorpay Autonomous Revenue Recovery',
  description: 'Closed-Loop Autonomous AI Revenue Recovery Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen bg-gray-50 overflow-hidden`}>
        <HITLProvider>
          {/* Dynamic Sidebar with active routes and collapse toggle */}
          <Sidebar />

          {/* Main content scroll container */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </HITLProvider>
      </body>
    </html>
  );
}

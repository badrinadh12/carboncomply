import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CARBONCOMPLY — Citizen Carbon Footprint & Government Compliance Platform',
  description:
    'Track. Reduce. Comply. A government-oriented carbon tracking and compliance digital service for citizens. Real-World AI Products prototype.',
  keywords: [
    'carbon footprint',
    'government compliance',
    'climate tech',
    'carbon tracking',
    'carbon fee',
    'citizen compliance',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col text-slate-900 bg-slate-50">
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-slate-700">
              CARBONCOMPLY — Citizen Carbon Tracking & Compliance Digital Service
            </p>
            <p className="text-[11px] text-slate-400">
              Track 2: Real-World AI Products Hackathon Prototype • Statutory Monday–Sunday Cycle • Fixed 100 kg CO₂ Threshold
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

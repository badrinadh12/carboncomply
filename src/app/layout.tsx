import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

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
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-sage-canvas text-[#16324F]">
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="mt-auto py-6 border-t border-[#E1E8D5] bg-[#FFFFFF]/70 backdrop-blur-xs text-center text-xs text-[#718096]">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-[#16324F]">
              CARBONCOMPLY — Citizen Carbon Tracking & Compliance Platform
            </p>
            <p className="text-[11px] text-[#526579]">
              Track 2: Real-World AI Products Prototype • Statutory Monday–Sunday Cycle • Fixed 100 kg CO₂ Threshold
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

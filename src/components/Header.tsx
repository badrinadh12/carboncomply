'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  PlusCircle,
  BarChart3,
  History,
  Settings,
  Building2,
  Menu,
  X,
  Sparkles,
  RotateCcw,
  Leaf,
} from 'lucide-react';
import { resetNotificationState } from '@/lib/notificationTracker';
import { getAppDemoDate, setAppDemoDate } from '@/lib/demoDate';
import { formatDisplayDate, getWeekRangeForDate } from '@/lib/dateUtils';

interface HeaderProps {
  onQuickLog?: () => void;
  onSeedDemo?: () => void;
  onResetData?: () => void;
}

export default function Header({ onQuickLog, onSeedDemo, onResetData }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState(false);
  const [activeDemoDate, setActiveDemoDate] = useState<string | null>(null);

  React.useEffect(() => {
    setActiveDemoDate(getAppDemoDate());
    const handleDateChanged = () => {
      setActiveDemoDate(getAppDemoDate());
    };
    window.addEventListener('carboncomply_date_changed', handleDateChanged);
    return () => window.removeEventListener('carboncomply_date_changed', handleDateChanged);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'Log Activity', href: '/log', icon: PlusCircle },
    { label: 'History', href: '/history', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Gov Overview', href: '/government-overview', icon: Building2 },
  ];

  const handleSeed = async () => {
    if (demoActionLoading) return;
    setDemoActionLoading(true);
    try {
      if (onSeedDemo) {
        await onSeedDemo();
      } else {
        await fetch('/api/demo-seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'seed' }),
        });
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (demoActionLoading) return;
    if (!confirm('Reset demo data?\n\nThis will remove all demo activities, compliance history, fee records, and travel tracking data and restore the application to a clean starting state.')) return;
    setDemoActionLoading(true);
    try {
      resetNotificationState();
      setAppDemoDate(null);
      if (onResetData) {
        await onResetData();
      } else {
        await fetch('/api/demo-seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' }),
        });
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoActionLoading(false);
    }
  };

  const handleClearDemoDate = () => {
    setAppDemoDate(null);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E8D5] shadow-2xs">
      {/* Top status banner with soft sage tint */}
      <div className="bg-[#EFF5E2] border-b border-[#E1E8D5] px-4 py-1 text-xs text-[#526579]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
            <span className="font-semibold text-[#16324F]">National Carbon Compliance Platform</span>
            <span className="text-[#718096] hidden sm:inline">• Statutory Monday–Sunday Cycle</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-[#526579] hidden md:inline">
              Statutory Threshold: <strong className="text-[#16324F] font-bold">100 kg CO₂/wk</strong>
            </span>
            <div className="flex items-center space-x-2 pl-2 border-l border-[#D3DEC3] text-[#526579]">
              <button
                onClick={handleSeed}
                disabled={demoActionLoading}
                title="Populates realistic demo dataset"
                className="hover:text-[#0F6E56] transition flex items-center space-x-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3 text-[#0F6E56]" />
                <span>{demoActionLoading ? 'Loading...' : 'Demo Data'}</span>
              </button>
              <span className="text-[#C9D6B8]">|</span>
              <button
                onClick={handleReset}
                disabled={demoActionLoading}
                title="Resets database to clean state"
                className="hover:text-rose-600 transition flex items-center space-x-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3 text-[#718096]" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Date Active Alert Strip */}
      {activeDemoDate && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold">DEMO DATE ACTIVE:</span>
              <span>Simulated Date is <strong>{formatDisplayDate(activeDemoDate)}</strong></span>
              <span className="hidden md:inline text-amber-800">
                (Compliance Cycle: {getWeekRangeForDate(activeDemoDate).label})
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={handleClearDemoDate}
                className="text-amber-900 underline font-semibold hover:text-amber-950 cursor-pointer"
              >
                Restore Real Date
              </button>
              <Link href="/settings" className="text-amber-800 hover:text-amber-950 font-medium">
                Dev Controls →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#0F6E56] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-[#0A5C45] transition">
                <Leaf className="w-5 h-5 text-[#EBF4E0]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-bold tracking-tight text-[#16324F]">
                    CARBON<span className="text-[#0F6E56]">COMPLY</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#EBF4E0] text-[#0F6E56] border border-[#D3DEC3] px-1.5 py-0.2 rounded-md">
                    Gov
                  </span>
                </div>
                <p className="text-[11px] text-[#526579] font-medium -mt-0.5">
                  Track. Reduce. Comply.
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#EBF4E0] text-[#0F6E56]'
                      : 'text-[#16324F] hover:text-[#0F6E56] hover:bg-[#F3F8E8]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F6E56]' : 'text-[#718096]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Primary Action Button: Deep Emerald */}
          <div className="hidden sm:flex items-center space-x-3">
            {onQuickLog ? (
              <button
                onClick={onQuickLog}
                id="header-quick-log-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </button>
            ) : (
              <Link
                href="/log"
                id="header-quick-log-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#16324F] hover:bg-[#F3F8E8] focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E1E8D5] bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-[#EBF4E0] text-[#0F6E56]'
                    : 'text-[#16324F] hover:bg-[#F3F8E8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F6E56]' : 'text-[#718096]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#E1E8D5]">
            {onQuickLog ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onQuickLog();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </button>
            ) : (
              <Link
                href="/log"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

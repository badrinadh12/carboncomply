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

interface HeaderProps {
  onQuickLog?: () => void;
  onSeedDemo?: () => void;
  onResetData?: () => void;
}

export default function Header({ onQuickLog, onSeedDemo, onResetData }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState(false);

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
    if (!confirm('Reset all citizen activity records to a fresh slate?')) return;
    setDemoActionLoading(true);
    try {
      resetNotificationState();
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Refined subtle top status strip (light, calm, not dark!) */}
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-1 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">Citizen Carbon Platform</span>
            <span className="text-slate-400 hidden sm:inline">• Official Weekly Compliance (Mon–Sun)</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-slate-600 hidden md:inline">
              Statutory Limit: <strong className="text-slate-800 font-semibold">100 kg CO₂/wk</strong>
            </span>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-slate-500">
              <button
                onClick={handleSeed}
                disabled={demoActionLoading}
                title="Populates realistic multi-week demo dataset"
                className="hover:text-emerald-700 transition flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{demoActionLoading ? 'Loading...' : 'Demo Data'}</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleReset}
                disabled={demoActionLoading}
                title="Resets database to clean state"
                className="hover:text-rose-600 transition flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-emerald-800 transition">
                <Leaf className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    CARBON<span className="text-emerald-700">COMPLY</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
                    Gov
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
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
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Primary Action Button: Prominent Green Log Activity */}
          <div className="hidden sm:flex items-center space-x-3">
            {onQuickLog ? (
              <button
                onClick={onQuickLog}
                id="header-quick-log-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </button>
            ) : (
              <Link
                href="/log"
                id="header-quick-log-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition"
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
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
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
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            {onQuickLog ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onQuickLog();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </button>
            ) : (
              <Link
                href="/log"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
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

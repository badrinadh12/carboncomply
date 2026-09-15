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
} from 'lucide-react';

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
    { label: 'History & Audit', href: '/history', icon: History },
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
    if (!confirm('Are you sure you want to reset all citizen activity records to a blank state?')) return;
    setDemoActionLoading(true);
    try {
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Government Prototype Notice Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-100">National Carbon Compliance Platform</span>
          <span className="text-slate-400 hidden sm:inline">• Track 2: Real-World AI Products Prototype</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-300">
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Gov Threshold: 100 kg CO₂/wk
          </span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hidden md:inline">
            Travel: 200 kg CO₂/mo
          </span>
          <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-700">
            <button
              onClick={handleSeed}
              disabled={demoActionLoading}
              title="Populates realistic multi-week demo data with compliance fee test cases"
              className="text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1 underline cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{demoActionLoading ? 'Seeding...' : 'Seed Demo Data'}</span>
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={handleReset}
              disabled={demoActionLoading}
              title="Clears all activities for fresh testing"
              className="text-slate-400 hover:text-rose-300 transition flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-emerald-800 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    CARBON<span className="text-emerald-700">COMPLY</span>
                  </span>
                  <span className="text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                    Citizen
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium tracking-wide">
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
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Button: Quick Log Activity */}
          <div className="hidden sm:flex items-center space-x-3">
            {onQuickLog ? (
              <button
                onClick={onQuickLog}
                id="header-quick-log-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </button>
            ) : (
              <Link
                href="/log"
                id="header-quick-log-btn"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-xs transition"
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
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
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
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity</span>
              </button>
            ) : (
              <Link
                href="/log"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-xs"
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

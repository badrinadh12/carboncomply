'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { formatCo2 } from '@/lib/calculations';
import Link from 'next/link';
import {
  Target,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  Info,
  ArrowLeft,
  Calendar,
  Sparkles,
  RotateCcw,
  Sliders,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  getAppDemoDate,
  getAppEffectiveDate,
  setAppDemoDate,
  isDemoDateActive,
} from '@/lib/demoDate';
import { getWeekRangeForDate, getTodayDateString, formatDisplayDate } from '@/lib/dateUtils';
import { resetNotificationState } from '@/lib/notificationTracker';

export default function SettingsPage() {
  const [personalTarget, setPersonalTarget] = useState<string>('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Demo / Dev state
  const [currentDemoDate, setCurrentDemoDate] = useState<string | null>(null);
  const [demoInputDate, setDemoInputDate] = useState<string>('');
  const [devMessage, setDevMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setPersonalTarget(String(d.settings.personal_weekly_target));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    // Load active demo date from localStorage
    const demo = getAppDemoDate();
    setCurrentDemoDate(demo);
    setDemoInputDate(demo || '2026-09-21');
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const val = parseFloat(personalTarget);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid positive weekly target greater than 0.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personal_weekly_target: val }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update personal target.');
      }
      setSuccessMessage('Personal Weekly Target updated and saved.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while updating settings.');
    } finally {
      setSaving(false);
    }
  };

  // Demo week simulation handlers
  const handleApplyDemoDate = (dateStr: string | null) => {
    setDevMessage(null);
    if (!dateStr) {
      setAppDemoDate(null);
      setCurrentDemoDate(null);
      setDevMessage({
        text: `Demo date cleared. Application restored to real system date (${formatDisplayDate(getTodayDateString())}).`,
        type: 'info',
      });
      return;
    }

    const range = getWeekRangeForDate(dateStr);
    setAppDemoDate(dateStr);
    setCurrentDemoDate(dateStr);
    setDevMessage({
      text: `DEMO DATE ACTIVE: Simulated date set to ${formatDisplayDate(dateStr)}. Current statutory compliance week is now ${range.label}.`,
      type: 'success',
    });
  };

  // Reset Demo Data execution
  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/demo-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset demo data.');
      }

      // Clear local notification and demo date state
      resetNotificationState();
      setAppDemoDate(null);
      setCurrentDemoDate(null);
      setPersonalTarget('100');

      setIsResetModalOpen(false);
      setDevMessage({
        text: 'All demo activities, compliance records, fee records, and travel tracking data have been removed. Application restored to clean starting state (0.00 kg CO₂ for the current week).',
        type: 'success',
      });
    } catch (err: any) {
      setDevMessage({ text: err.message || 'Error resetting demo data.', type: 'error' });
    } finally {
      setResetting(false);
    }
  };

  // Seed demo data handler
  const handleSeedDemoData = async () => {
    setSeeding(true);
    setDevMessage(null);
    try {
      const res = await fetch('/api/demo-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to seed demo data.');
      }
      setDevMessage({
        text: 'Sample statutory demo data loaded (2 historical weeks + current week activities).',
        type: 'success',
      });
    } catch (err: any) {
      setDevMessage({ text: err.message || 'Error loading demo data.', type: 'error' });
    } finally {
      setSeeding(false);
    }
  };

  const currentEffectiveDate = getAppEffectiveDate();
  const currentWeekRange = getWeekRangeForDate(currentEffectiveDate);

  return (
    <div className="min-h-screen flex flex-col bg-sage-canvas">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#526579] hover:text-[#16324F] transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#16324F]">
            Settings & Compliance Controls
          </h1>
          <p className="text-xs text-[#526579] mt-0.5">
            Manage your citizen reduction targets and review developer evaluation settings.
          </p>
        </div>

        {/* Setting Form Card: Citizen Target */}
        <div className="gov-card p-6 sm:p-8 bg-white border border-[#E1E8D5] rounded-2xl shadow-xs">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-[#E1E8D5]">
              <div className="w-9 h-9 rounded-xl bg-[#EBF4E0] text-[#0F6E56] flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#16324F]">Personal Weekly CO₂ Target</h2>
                <p className="text-xs text-[#526579]">
                  User-controlled target to motivate personal reduction progress
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start space-x-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 bg-[#EBF4E0] border border-[#C9D6B8] rounded-xl flex items-start space-x-2 text-xs text-[#0F6E56] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div>
                <label
                  htmlFor="personal-target-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#16324F] mb-1.5"
                >
                  Personal Target (kg CO₂ / week)
                </label>
                <div className="relative">
                  <input
                    id="personal-target-input"
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={personalTarget}
                    onChange={(e) => setPersonalTarget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#C9D6B8] rounded-xl text-sm text-[#16324F] font-bold focus:ring-2 focus:ring-[#0F6E56] focus:border-[#0F6E56] focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold text-[#718096]">
                    kg / week
                  </div>
                </div>
                <p className="text-[11px] text-[#718096] mt-1">
                  Recommended default: 100.00 kg CO₂/week
                </p>
              </div>

              {/* Locked Statutory Threshold Card */}
              <div className="p-4 rounded-xl bg-[#F8FAF4] border border-[#E1E8D5] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#0F6E56]" />
                    <span>Government Carbon Threshold</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-[#EBF4E0] text-[#0F6E56] border border-[#D3DEC3] px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Fixed statutory</span>
                  </span>
                </div>
                <div className="text-xl font-extrabold text-[#0F6E56]">100.00 kg CO₂ / week</div>
                <p className="text-[11px] text-[#526579]">
                  Fixed statutory limit. Cannot be edited. Determines official compliance and fees.
                </p>
              </div>
            </div>

            {/* Clear explanation note */}
            <div className="p-4 rounded-xl bg-[#F8FAF4] border border-[#E1E8D5] text-xs text-[#16324F] flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-[#0F6E56] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#16324F]">
                  “Your personal target is for your own progress. It does not change the fixed government threshold.”
                </p>
                <p className="text-[11px] text-[#526579]">
                  This eliminates moral hazard: raising your personal target will never waive statutory government compliance or the ₹10 Carbon Compliance Fee.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                id="save-settings-btn"
                className="px-5 py-2.5 bg-[#0F6E56] hover:bg-[#0A5C45] disabled:bg-[#C9D6B8] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Target'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================================================== */}
        {/* DEMO / DEVELOPMENT CONTROLS (HACKATHON EVALUATION) */}
        {/* ================================================== */}
        <section className="gov-card p-6 sm:p-8 bg-white border border-[#E1E8D5] rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E1E8D5]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-[#16324F]">Demo / Development Controls</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                    Hackathon Only
                  </span>
                </div>
                <p className="text-xs text-[#526579] mt-0.5">
                  Evaluation tools for testing week rollover, threshold alerts, and fresh starting states.
                </p>
              </div>
            </div>

            {currentDemoDate && (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>DEMO DATE ACTIVE</span>
              </span>
            )}
          </div>

          {devMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start space-x-2 text-xs font-medium ${
                devMessage.type === 'success'
                  ? 'bg-[#EBF4E0] border-[#C9D6B8] text-[#0F6E56]'
                  : devMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{devMessage.text}</div>
              <button
                onClick={() => setDevMessage(null)}
                className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Control 1: Demo Week Simulation */}
          <div className="p-5 rounded-xl bg-[#F8FAF4] border border-[#E1E8D5] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#16324F] flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-[#0F6E56]" />
                  <span>1. Demo Week Simulation (Evaluation Date)</span>
                </h3>
                <p className="text-xs text-[#526579] mt-1">
                  Simulate advancing to a new week without changing your computer’s clock.
                  The application will automatically determine the Monday–Sunday cycle, start at 0.00 kg CO₂ if no activities exist for that period, and archive previous weeks in History.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleApplyDemoDate(null)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition text-left cursor-pointer flex flex-col justify-between ${
                  !currentDemoDate
                    ? 'bg-white border-[#0F6E56] ring-2 ring-[#0F6E56]/20 text-[#0F6E56]'
                    : 'bg-white border-[#E1E8D5] text-[#526579] hover:border-[#C9D6B8]'
                }`}
              >
                <span className="font-bold">Real System Date</span>
                <span className="text-[11px] text-[#718096] mt-0.5">
                  {formatDisplayDate(getTodayDateString())}
                </span>
                <span className="text-[10px] text-[#0F6E56] font-bold mt-1">
                  {!currentDemoDate ? '✓ Currently Active' : 'Use Real Clock'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyDemoDate('2026-09-21')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition text-left cursor-pointer flex flex-col justify-between ${
                  currentDemoDate === '2026-09-21'
                    ? 'bg-white border-[#0F6E56] ring-2 ring-[#0F6E56]/20 text-[#0F6E56]'
                    : 'bg-white border-[#E1E8D5] text-[#526579] hover:border-[#C9D6B8]'
                }`}
              >
                <span className="font-bold">Next Week (Monday)</span>
                <span className="text-[11px] text-[#718096] mt-0.5">Sep 21, 2026</span>
                <span className="text-[10px] text-[#0F6E56] font-bold mt-1">
                  {currentDemoDate === '2026-09-21' ? '✓ Currently Active' : 'Starts at 0.00 kg'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyDemoDate('2026-09-28')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition text-left cursor-pointer flex flex-col justify-between ${
                  currentDemoDate === '2026-09-28'
                    ? 'bg-white border-[#0F6E56] ring-2 ring-[#0F6E56]/20 text-[#0F6E56]'
                    : 'bg-white border-[#E1E8D5] text-[#526579] hover:border-[#C9D6B8]'
                }`}
              >
                <span className="font-bold">2 Weeks Ahead</span>
                <span className="text-[11px] text-[#718096] mt-0.5">Sep 28, 2026</span>
                <span className="text-[10px] text-[#0F6E56] font-bold mt-1">
                  {currentDemoDate === '2026-09-28' ? '✓ Currently Active' : 'Starts at 0.00 kg'}
                </span>
              </button>
            </div>

            {/* Custom Date Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-[#E1E8D5]">
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-xs text-[#526579] font-medium shrink-0">Custom Demo Date:</span>
                <input
                  type="date"
                  value={demoInputDate}
                  onChange={(e) => setDemoInputDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-[#C9D6B8] rounded-lg text-[#16324F] font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#0F6E56]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyDemoDate(demoInputDate)}
                className="px-3 py-1.5 bg-white border border-[#0F6E56] text-[#0F6E56] hover:bg-[#EBF4E0] rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Apply Custom Date
              </button>
            </div>

            {/* Current Active Week Indicator */}
            <div className="p-3 bg-white rounded-lg border border-[#E1E8D5] text-xs flex items-center justify-between">
              <span className="text-[#526579]">
                Active Application Date: <strong className="text-[#16324F]">{formatDisplayDate(currentEffectiveDate)}</strong>
              </span>
              <span className="text-[#0F6E56] font-bold">
                Compliance Cycle: {currentWeekRange.label}
              </span>
            </div>
          </div>

          {/* Control 2: Reset Demo Data */}
          <div className="p-5 rounded-xl bg-[#FDFBF7] border border-amber-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center space-x-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-700" />
                  <span>2. Reset Demo Data (Clean Starting State)</span>
                </h3>
                <p className="text-xs text-[#526579] mt-1">
                  Removes all demo activities, compliance week records, fee records, and travel tracking data.
                  Restores targets to 100 kg and the current week to 0.00 kg without changing system clock.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSeedDemoData}
                  disabled={seeding}
                  className="px-3.5 py-2 bg-white border border-[#C9D6B8] hover:bg-[#EBF4E0] text-[#0F6E56] rounded-xl text-xs font-bold shadow-2xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0F6E56]" />
                  <span>{seeding ? 'Loading...' : 'Re-Seed Demo Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-4 py-2 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================== */}
      {/* CONFIRMATION MODAL: RESET DEMO DATA */}
      {/* ================================================== */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16324F]/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E1E8D5] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16324F]">Reset demo data?</h3>
                <p className="text-xs text-[#718096]">Development & testing procedure</p>
              </div>
            </div>

            <p className="text-xs text-[#526579] leading-relaxed">
              This will remove all demo activities, compliance history, fee records, and travel tracking data and restore the application to a clean starting state.
            </p>

            <div className="p-3 bg-[#F8FAF4] border border-[#E1E8D5] rounded-xl text-[11px] text-[#526579] space-y-1">
              <div className="font-semibold text-[#16324F]">The reset will:</div>
              <div>• Set current weekly footprint to 0.00 kg CO₂</div>
              <div>• Reset Personal Weekly Target to 100 kg</div>
              <div>• Maintain fixed Government Threshold at 100 kg</div>
              <div>• Clear statutory compliance fee records (₹0)</div>
              <div>• Clear violation history and alert notification state</div>
              <div>• Restore real application date calculation</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={resetting}
                className="px-4 py-2 bg-white border border-[#C9D6B8] hover:bg-slate-50 text-[#526579] rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-rose-300 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

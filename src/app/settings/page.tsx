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
  Scale,
  ArrowLeft,
} from 'lucide-react';

export default function SettingsPage() {
  const [personalTarget, setPersonalTarget] = useState<string>('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Target Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal weekly goal while adhering to statutory government compliance limits.
          </p>
        </div>

        {/* Setting Form Card */}
        <div className="gov-card p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Personal Weekly CO₂ Target</h2>
                <p className="text-xs text-slate-500">
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
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div>
                <label
                  htmlFor="personal-target-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
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
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                    kg / week
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recommended default: 100.00 kg CO₂/week
                </p>
              </div>

              {/* Locked Statutory Threshold Card */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-teal-600" />
                    <span>Government Carbon Threshold</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Fixed by system</span>
                  </span>
                </div>
                <div className="text-xl font-extrabold text-teal-800">100.00 kg CO₂ / week</div>
                <p className="text-[11px] text-slate-500">
                  Fixed statutory limit. Cannot be edited. Determines official compliance and fees.
                </p>
              </div>
            </div>

            {/* Clear explanation note */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  “Your personal target is for your own progress. It does not change the fixed government threshold.”
                </p>
                <p className="text-[11px] text-slate-500">
                  This eliminates moral hazard: raising your personal target will never waive statutory government compliance or the ₹10 Carbon Compliance Fee.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                id="save-settings-btn"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Target'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

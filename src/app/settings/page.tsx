'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { formatCo2 } from '@/lib/calculations';
import {
  Settings,
  Target,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  Info,
  Scale,
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
      setSuccessMessage('Personal Weekly Target successfully updated and persisted!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while updating settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Citizen Preferences
            </span>
            <span className="text-xs text-slate-400">• Carbon Policies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Personal Target & Statutory Threshold Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your individual carbon reduction goal and inspect the dual-limit compliance architecture.
          </p>
        </div>

        {/* Setting Form Card */}
        <div className="gov-card p-6 sm:p-8 bg-white border border-slate-200">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Weekly CO₂ Target</h2>
                <p className="text-xs text-slate-500">
                  User-controlled target to motivate personal reduction progress
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <label
                  htmlFor="personal-target-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Personal Target (kg CO₂ / week)
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <input
                    id="personal-target-input"
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={personalTarget}
                    onChange={(e) => setPersonalTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                    kg CO₂ / week
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default recommendation: 100.00 kg CO₂/week.
                </p>
              </div>

              {/* Locked Statutory Threshold Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <span>Government Carbon Threshold</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" />
                    <span>Fixed / System Locked</span>
                  </span>
                </div>
                <div className="text-xl font-extrabold text-emerald-800">100.00 kg CO₂ / week</div>
                <p className="text-[11px] text-slate-500">
                  Fixed statutory limit. Cannot be edited by citizens. Determines official government
                  compliance and fee calculations.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold">
                  “This is your personal target. It does not change the government compliance threshold.”
                </p>
                <p className="text-[11px] opacity-90">
                  Modifying your personal target adjusts your dashboard goals and internal progress tracking,
                  but will NEVER alter the 100 kg Government Threshold or waive compliance fees.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                id="save-settings-btn"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Save Personal Target'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section: Why Two Limits Exist (Educational Explainer) */}
        <section className="gov-card p-6 sm:p-8 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <Scale className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              Architecture Explainer: Why Two Distinct Limits Exist
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-bold text-slate-800 text-sm">Example Scenario 1</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Personal Target = <strong>70 kg</strong></li>
                <li>Government Threshold = <strong>100 kg</strong></li>
                <li>Citizen Footprint = <strong>85 kg</strong></li>
              </ul>
              <div className="pt-2 border-t border-slate-200 text-emerald-800 font-semibold">
                Result: Personal target exceeded. Government compliant. ₹0 fee.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-bold text-slate-800 text-sm">Example Scenario 2</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Personal Target = <strong>150 kg</strong></li>
                <li>Government Threshold = <strong>100 kg</strong></li>
                <li>Citizen Footprint = <strong>120 kg</strong></li>
              </ul>
              <div className="pt-2 border-t border-slate-200 text-rose-800 font-semibold">
                Result: Personal target achieved. Government threshold exceeded. Compliance fee applies.
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            This design eliminates moral hazard: citizens cannot arbitrarily raise their personal target
            to evade statutory government compliance or the ₹10 Carbon Compliance Fee.
          </p>
        </section>
      </main>
    </div>
  );
}

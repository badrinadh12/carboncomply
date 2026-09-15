'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { formatCo2 } from '@/lib/calculations';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  BarChart3,
  Plane,
  Layers,
  ArrowLeft,
  Info,
} from 'lucide-react';

export default function GovernmentOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    fetch('/api/compliance')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data?.aggregateStats || {};
  const totalWeeks = stats.totalWeeksRecorded || 1;
  const avgWeeklyCo2 = totalWeeks > 0 ? stats.totalAllCo2 / totalWeeks : 0;
  const complianceRate =
    totalWeeks > 0
      ? Math.round(((totalWeeks - (stats.totalViolations || 0)) / totalWeeks) * 100)
      : 100;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onSeedDemo={fetchOverview} onResetData={fetchOverview} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Light Government Overview Banner */}
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white border border-emerald-100/80 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Government Compliance Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Aggregated transparency metrics for statutory compliance auditing, travel allowances, and fee reconciliation.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-xs max-w-xs shadow-2xs">
              <span className="font-bold text-slate-700 block mb-0.5">Prototype / Demo Data Notice</span>
              <p className="text-[11px] text-slate-500 leading-tight">
                This dashboard displays metrics derived strictly from local prototype data. It does NOT represent real national government data.
              </p>
            </div>
          </div>
        </div>

        {/* Aggregated KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total CO₂ Recorded
              </span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {formatCo2(stats.totalAllCo2 || 0)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Across all verified log entries</p>
          </div>

          <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Average Weekly Footprint
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {formatCo2(avgWeeklyCo2)} <span className="text-xs font-normal text-slate-500">kg/wk</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Statutory Limit: 100 kg/week</p>
          </div>

          <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compliance Rate
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">{complianceRate}%</div>
            <p className="text-[10px] text-slate-400 mt-1">Weeks within statutory threshold</p>
          </div>

          <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Fees Accrued
              </span>
              <span className="text-xs font-bold text-slate-500">₹10 rate</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹{stats.totalFeesAccrued || 0}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {stats.totalViolations || 0} total violations recorded
            </p>
          </div>
        </div>

        {/* Breakdown of Policies & Framework */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gov-card p-6 bg-white border border-slate-200/90 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Statutory Compliance Policy Standards</span>
            </h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-slate-900">• Compliance Week:</span>
                <span>Monday 00:00:00 to Sunday 23:59:59 (ISO standard).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-slate-900">• First-Ever Exceedance:</span>
                <span>Receives educational compliance reminder at ₹0 fee.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-slate-900">• Subsequent Exceedances:</span>
                <span>Predictable ₹10 Carbon Compliance Fee applied per violating week.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-slate-900">• Persistent Date Binding:</span>
                <span>Calculations derive strictly from activity_date, never created_at.</span>
              </li>
            </ul>
          </div>

          <div className="gov-card p-6 bg-white border border-slate-200/90 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Plane className="w-4 h-4 text-purple-700" />
              <span>Fair Travel Policy & Quotas</span>
            </h3>
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-1">
              <div className="font-bold">Total Flight Emissions Recorded:</div>
              <div className="text-xl font-extrabold text-purple-900">
                {formatCo2(stats.totalFlightCo2 || 0)} kg CO₂
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Subject to 200 kg CO₂ / month fair mobility allowance. Flights are non-exempt and remain calculated in the total citizen carbon footprint.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

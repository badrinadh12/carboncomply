'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CarbonMeter from '@/components/CarbonMeter';
import ComplianceFeeCard from '@/components/ComplianceFeeCard';
import TravelAllowanceCard from '@/components/TravelAllowanceCard';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import PersonalInsights from '@/components/PersonalInsights';
import LogActivityModal from '@/components/LogActivityModal';
import Link from 'next/link';
import {
  WeeklyComplianceSummary,
  CategoryBreakdownItem,
  MonthlyTravelAllowance,
  DeterministicInsight,
  Activity,
  UserSettings,
} from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import { formatDisplayDate } from '@/lib/dateUtils';
import {
  PlusCircle,
  History,
  Shield,
  ArrowRight,
  TrendingDown,
  Calendar,
  Sparkles,
  Plane,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<WeeklyComplianceSummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [travelAllowance, setTravelAllowance] = useState<MonthlyTravelAllowance | null>(null);
  const [insights, setInsights] = useState<DeterministicInsight[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, actsRes] = await Promise.all([
        fetch('/api/compliance'),
        fetch('/api/activities'),
      ]);

      const compData = await compRes.json();
      const actsData = await actsRes.json();

      if (compData.success) {
        setCurrentWeek(compData.currentWeek);
        setCategories(compData.categories || []);
        setTravelAllowance(compData.travelAllowance);
        setInsights(compData.insights || []);
        setUserSettings(compData.userSettings);
      }

      if (actsData.success) {
        setRecentActivities(actsData.activities.slice(0, 5));
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onQuickLog={() => setIsLogModalOpen(true)}
        onSeedDemo={fetchDashboardData}
        onResetData={fetchDashboardData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Overview Banner */}
        <section className="gov-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-0 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CURRENT COMPLIANCE WEEK
                </span>
                <span className="text-slate-400 text-xs flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{currentWeek?.weekLabel || 'Loading...'}</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {loading ? (
                  <span className="opacity-50">Calculating...</span>
                ) : (
                  <>
                    {formatCo2(currentWeek?.totalCo2 || 0)}{' '}
                    <span className="text-xl sm:text-2xl font-medium text-slate-300">kg CO₂</span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Official weekly footprint tracking under the statutory 100 kg CO₂ government threshold
                (Monday 00:00 to Sunday 23:59).
              </p>
            </div>

            {/* Quick Hero Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsLogModalOpen(true)}
                id="hero-log-activity-btn"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Log New Activity</span>
              </button>
              <Link
                href="/history"
                className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl text-sm font-semibold border border-slate-700 transition flex items-center space-x-1.5"
              >
                <History className="w-4 h-4" />
                <span>Full Audit History</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1: Visual Carbon Meter */}
        <section aria-labelledby="carbon-meter-heading">
          <h2 id="carbon-meter-heading" className="sr-only">
            Weekly Carbon Meter
          </h2>
          {currentWeek && (
            <CarbonMeter
              totalCo2={currentWeek.totalCo2}
              governmentThreshold={currentWeek.governmentThreshold}
              personalTarget={currentWeek.personalTarget}
              percentageUsed={currentWeek.percentageUsed}
              remainingCo2={currentWeek.remainingCo2}
              status={currentWeek.status}
              statusColor={currentWeek.statusColor}
              isExceeded={currentWeek.isExceeded}
              weekLabel={currentWeek.weekLabel}
            />
          )}
        </section>

        {/* Section 2: Statutory Compliance Fee Card & Fair Travel Allowance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {currentWeek && (
            <ComplianceFeeCard
              totalCo2={currentWeek.totalCo2}
              governmentThreshold={currentWeek.governmentThreshold}
              status={currentWeek.status}
              statusColor={currentWeek.statusColor}
              isExceeded={currentWeek.isExceeded}
              isFirstViolation={currentWeek.isFirstViolation}
              feeAmount={currentWeek.feeAmount}
              feeStatusLabel={currentWeek.feeStatusLabel}
            />
          )}

          {travelAllowance && <TravelAllowanceCard allowance={travelAllowance} />}
        </div>

        {/* Section 3: Category Breakdown & Deterministic Personal Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CategoryBreakdown
            categories={categories}
            totalCo2={currentWeek?.totalCo2 || 0}
          />

          <PersonalInsights insights={insights} />
        </div>

        {/* Section 4: Recent Logged Activities */}
        <section className="gov-card p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Citizen Activity Entries</h3>
              <p className="text-xs text-slate-500">
                Logged entries sorted by activity_date (stored persistently in backend)
              </p>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>View All Activities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {recentActivities.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-slate-500">No activities logged yet.</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-emerald-800 transition"
                  >
                    Log First Activity
                  </button>
                  <button
                    onClick={async () => {
                      await fetch('/api/demo-seed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'seed' }),
                      });
                      fetchDashboardData();
                    }}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
                  >
                    Load Sample Demo Data
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date (activity_date)</th>
                    <th className="py-2.5 px-3">Activity Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Factor (kg/unit)</th>
                    <th className="py-2.5 px-3 text-right">Emission (kg CO₂)</th>
                    <th className="py-2.5 px-3 text-center">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {formatDisplayDate(act.activity_date)}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {act.activity_date}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 capitalize">
                        {act.activity_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {act.quantity.toLocaleString()} {act.unit}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono">
                        {act.emission_factor.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCo2(act.co2_kg)} kg
                      </td>
                      <td className="py-3 px-3 text-center">
                        {act.activity_type === 'flight' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
                            <Plane className="w-3 h-3" />
                            <span>Travel</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            Everyday
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}

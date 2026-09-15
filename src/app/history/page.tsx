'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import HistoryFilterBar from '@/components/HistoryFilterBar';
import { Activity, WeeklyComplianceSummary } from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import { formatDisplayDate } from '@/lib/dateUtils';
import Link from 'next/link';
import {
  History,
  Plane,
  Trash2,
  Calendar,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export default function HistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [historicalWeeks, setHistoricalWeeks] = useState<WeeklyComplianceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters state
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [isFiltered, setIsFiltered] = useState<boolean>(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const [actsRes, compRes] = await Promise.all([
        fetch(`/api/activities?${params.toString()}`),
        fetch('/api/compliance'),
      ]);

      const actsData = await actsRes.json();
      const compData = await compRes.json();

      if (actsData.success) {
        setActivities(actsData.activities || []);
      }
      if (compData.success) {
        setHistoricalWeeks(compData.allWeeks || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleApplyFilters = () => {
    setIsFiltered(Boolean((filterType && filterType !== 'all') || filterStartDate || filterEndDate));
    fetchHistory();
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setIsFiltered(false);
    // Fetch without query params
    setTimeout(() => {
      fetch('/api/activities')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setActivities(d.activities || []);
        });
    }, 50);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity record?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  // Reconciled total for filtered results
  const totalFilteredCo2 = activities.reduce((s, a) => s + (Number(a.co2_kg) || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onSeedDemo={fetchHistory} onResetData={fetchHistory} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Official Records
              </span>
              <span className="text-xs text-slate-500">• Complete Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Historical Activities & Compliance Audit
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Every logged activity is permanently archived by activity_date and grouped into Monday–Sunday compliance weeks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/log"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Activity</span>
            </Link>
          </div>
        </div>

        {/* Section 1: Historical Compliance Weeks Overview */}
        <section className="gov-card p-6 bg-white border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Monday–Sunday Compliance Weeks Summary
                </h2>
                <p className="text-xs text-slate-500">
                  Statutory history preserved permanently. Prior weeks never reset.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              {historicalWeeks.length} Weeks Recorded
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Compliance Week</th>
                  <th className="py-2.5 px-3">Status Period</th>
                  <th className="py-2.5 px-3 text-right">Total Footprint</th>
                  <th className="py-2.5 px-3 text-right">Gov Threshold</th>
                  <th className="py-2.5 px-3 text-center">Compliance Status</th>
                  <th className="py-2.5 px-3 text-right">Compliance Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicalWeeks.map((week) => (
                  <tr
                    key={week.weekStart}
                    className={`hover:bg-slate-50 transition ${
                      week.isCurrentWeek ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{week.weekLabel}</div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {week.weekStart} → {week.weekEnd}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {week.isCurrentWeek ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Current Week
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Archived Week</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCo2(week.totalCo2)} kg CO₂
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-500">
                      {formatCo2(week.governmentThreshold)} kg
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          week.isExceeded
                            ? 'bg-rose-100 text-rose-800'
                            : week.status === 'APPROACHING LIMIT' || week.status === 'NEAR LIMIT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {week.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      {week.feeAmount > 0 ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          ₹{week.feeAmount}
                        </span>
                      ) : week.isExceeded ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          ₹0 (Reminder)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">₹0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Audit Filters & Activities List */}
        <section className="gov-card p-6 bg-white border border-slate-200 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Search & Filter Activity Log</h2>
            <p className="text-xs text-slate-500">
              Filter by activity type and date range based strictly on stored activity_date.
            </p>
          </div>

          <HistoryFilterBar
            selectedType={filterType}
            startDate={filterStartDate}
            endDate={filterEndDate}
            onTypeChange={setFilterType}
            onStartDateChange={setFilterStartDate}
            onEndDateChange={setFilterEndDate}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            isFiltered={isFiltered}
          />

          {/* Table Header / Summary */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-700">
              Showing {activities.length} logged record{activities.length === 1 ? '' : 's'}
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              Filtered Footprint: {formatCo2(totalFilteredCo2)} kg CO₂
            </span>
          </div>

          {/* Activities Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-sm text-slate-500">Loading audit records...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 space-y-2 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm font-medium text-slate-600">No matching activities found.</p>
                <p className="text-xs text-slate-400">
                  Try adjusting the filters above or record a new activity.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date (activity_date)</th>
                    <th className="py-2.5 px-3">Activity</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit</th>
                    <th className="py-2.5 px-3 text-right">Factor (kg/unit)</th>
                    <th className="py-2.5 px-3 text-right">CO₂ (kg)</th>
                    <th className="py-2.5 px-3 text-center">Travel Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((act) => (
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
                        {act.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono">
                        {act.unit}
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
                            <span>Travel Allowance</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          disabled={deletingId === act.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

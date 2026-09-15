'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import HistoryFilterBar from '@/components/HistoryFilterBar';
import { Activity, WeeklyComplianceSummary } from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import { formatDisplayDate } from '@/lib/dateUtils';
import { getAppEffectiveDate } from '@/lib/demoDate';
import Link from 'next/link';
import {
  History,
  Plane,
  Trash2,
  Calendar,
  PlusCircle,
  Check,
  ArrowLeft,
  AlertTriangle,
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
      const effDate = getAppEffectiveDate();
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);

      const [actsRes, compRes] = await Promise.all([
        fetch(`/api/activities?${params.toString()}`),
        fetch(`/api/compliance?date=${effDate}`),
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

    const handleDateChanged = () => {
      fetchHistory();
    };
    window.addEventListener('carboncomply_date_changed', handleDateChanged);
    return () => window.removeEventListener('carboncomply_date_changed', handleDateChanged);
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
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const totalFilteredCo2 = activities.reduce((s, a) => s + (Number(a.co2_kg) || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-sage-canvas">
      <Header onSeedDemo={fetchHistory} onResetData={fetchHistory} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#526579] hover:text-[#16324F] transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#16324F]">
              Activity History & Statutory Audit
            </h1>
            <p className="text-xs text-[#526579] mt-0.5">
              Permanent citizen log entries grouped into Monday–Sunday statutory compliance cycles.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/log"
              className="px-4 py-2 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Activity</span>
            </Link>
          </div>
        </div>

        {/* Section 1: Archived Compliance Weeks */}
        <section className="gov-card p-6 bg-white border border-[#E1E8D5] rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#E1E8D5]">
            <div>
              <h2 className="text-sm font-bold text-[#16324F]">
                Compliance Weeks Summary
              </h2>
              <p className="text-xs text-[#526579]">
                Monday–Sunday statutory cycles preserved permanently
              </p>
            </div>
            <span className="text-xs font-semibold text-[#526579] bg-[#F8FAF4] px-2.5 py-1 rounded-full border border-[#E1E8D5]">
              {historicalWeeks.length} Weeks Recorded
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-[#526579]">
              <thead className="bg-[#EFF5E2]/80 text-[#16324F] font-semibold border-y border-[#E1E8D5]">
                <tr>
                  <th className="py-2.5 px-3">Compliance Week</th>
                  <th className="py-2.5 px-3 text-right">Total Footprint</th>
                  <th className="py-2.5 px-3 text-right">Threshold</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E8D5]">
                {historicalWeeks.map((week) => (
                  <tr
                    key={week.weekStart}
                    className={`hover:bg-[#F8FAF4] transition ${
                      week.isCurrentWeek ? 'bg-[#EBF4E0]/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#16324F] flex items-center space-x-2">
                        <span>{week.weekLabel}</span>
                        {week.isCurrentWeek && (
                          <span className="text-[9px] font-bold bg-[#EBF4E0] text-[#0F6E56] border border-[#D3DEC3] px-1.5 py-0.5 rounded">
                            Current Week
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#718096] font-mono">
                        {week.weekStart} → {week.weekEnd}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#16324F]">
                      {formatCo2(week.totalCo2)} kg
                    </td>
                    <td className="py-3 px-3 text-right text-[#526579]">
                      {formatCo2(week.governmentThreshold)} kg
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          week.isExceeded
                            ? week.isFirstViolation
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-[#EBF4E0] text-[#0F6E56] border-[#C9D6B8]'
                        }`}
                      >
                        {!week.isExceeded ? (
                          <>
                            <Check className="w-2.5 h-2.5 mr-1" />
                            <span>ON TRACK</span>
                          </>
                        ) : week.isFirstViolation ? (
                          <span>First Violation (Reminder)</span>
                        ) : (
                          <span>LIMIT EXCEEDED</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      {week.feeAmount > 0 ? (
                        <span className="text-rose-700 font-bold">₹{week.feeAmount}</span>
                      ) : (
                        <span className="text-[#718096]">₹0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Audit Filters & Activities List */}
        <section className="gov-card p-6 bg-white border border-[#E1E8D5] rounded-2xl space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#16324F]">Filter Activity Records</h2>
            <p className="text-xs text-[#526579]">
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

          {/* Table Header Summary */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="font-semibold text-[#526579]">
              {activities.length} record{activities.length === 1 ? '' : 's'} found
            </span>
            <span className="font-bold text-[#16324F] bg-[#EFF5E2] border border-[#E1E8D5] px-3 py-1 rounded-xl">
              Filtered Total: {formatCo2(totalFilteredCo2)} kg CO₂
            </span>
          </div>

          {/* Activities Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-xs text-[#526579]">Loading audit records...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-10 space-y-1.5 border border-dashed border-[#E1E8D5] rounded-xl bg-[#F8FAF4]">
                <p className="text-xs font-semibold text-[#16324F]">No matching activities found.</p>
                <p className="text-[11px] text-[#718096]">
                  Try adjusting the filters above or record a new activity.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#526579]">
                <thead className="bg-[#EFF5E2]/80 text-[#16324F] font-semibold border-y border-[#E1E8D5]">
                  <tr>
                    <th className="py-2.5 px-3">Date (activity_date)</th>
                    <th className="py-2.5 px-3">Activity</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit</th>
                    <th className="py-2.5 px-3 text-right">Factor</th>
                    <th className="py-2.5 px-3 text-right">CO₂ (kg)</th>
                    <th className="py-2.5 px-3 text-center">Category</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E8D5]">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-[#F8FAF4] transition">
                      <td className="py-3 px-3 font-medium text-[#16324F]">
                        {formatDisplayDate(act.activity_date)}
                        <span className="text-[10px] text-[#718096] block font-mono">
                          {act.activity_date}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#16324F] capitalize">
                        {act.activity_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[#16324F]">
                        {act.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-[#718096] font-mono">
                        {act.unit}
                      </td>
                      <td className="py-3 px-3 text-right text-[#718096] font-mono">
                        {act.emission_factor.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#16324F]">
                        {formatCo2(act.co2_kg)} kg
                      </td>
                      <td className="py-3 px-3 text-center">
                        {act.activity_type === 'flight' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Plane className="w-3 h-3" />
                            <span>Travel</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EFF5E2] text-[#0F6E56] border border-[#D3DEC3]">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          disabled={deletingId === act.id}
                          className="p-1.5 text-[#718096] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

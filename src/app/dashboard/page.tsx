'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CarbonFootprintHero from '@/components/CarbonFootprintHero';
import SummaryCards from '@/components/SummaryCards';
import EmissionsDonutBreakdown from '@/components/EmissionsDonutBreakdown';
import RecentActivitiesCard from '@/components/RecentActivitiesCard';
import InsightAndQuickActions from '@/components/InsightAndQuickActions';
import TravelAllowanceCard from '@/components/TravelAllowanceCard';
import DashboardComplianceHistory from '@/components/DashboardComplianceHistory';
import LogActivityModal from '@/components/LogActivityModal';
import {
  WeeklyComplianceSummary,
  CategoryBreakdownItem,
  MonthlyTravelAllowance,
  Activity,
  UserSettings,
} from '@/lib/types';

import ThresholdExceededToast from '@/components/ThresholdExceededToast';
import { evaluateAndTriggerThresholdAlert } from '@/lib/notificationTracker';
import { getAppEffectiveDate } from '@/lib/demoDate';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<WeeklyComplianceSummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [travelAllowance, setTravelAllowance] = useState<MonthlyTravelAllowance | null>(null);
  const [allWeeks, setAllWeeks] = useState<WeeklyComplianceSummary[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Toast notification state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTotal, setToastTotal] = useState(0);

  const fetchDashboardData = useCallback(async (isUserAction: boolean = false) => {
    try {
      setLoading(true);
      const effDate = getAppEffectiveDate();
      const [compRes, actsRes] = await Promise.all([
        fetch(`/api/compliance?date=${effDate}`),
        fetch('/api/activities'),
      ]);

      const compData = await compRes.json();
      const actsData = await actsRes.json();

      if (compData.success && compData.currentWeek) {
        setCurrentWeek(compData.currentWeek);
        setCategories(compData.categories || []);
        setTravelAllowance(compData.travelAllowance);
        setAllWeeks(compData.allWeeks || []);
        setUserSettings(compData.userSettings);

        // Check if threshold was newly crossed and trigger sound + toast alert
        if (isUserAction) {
          evaluateAndTriggerThresholdAlert(
            compData.currentWeek.totalCo2,
            compData.currentWeek.weekStart,
            (total) => {
              setToastTotal(total);
              setToastOpen(true);
            },
            true
          );
        }
      }

      if (actsData.success) {
        setRecentActivities(actsData.activities.slice(0, 6));
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount (not user action, avoids autoplay block or duplicate alert on refresh)
    fetchDashboardData(false);

    const handleDateChanged = () => {
      fetchDashboardData(false);
    };
    window.addEventListener('carboncomply_date_changed', handleDateChanged);
    return () => window.removeEventListener('carboncomply_date_changed', handleDateChanged);
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen flex flex-col bg-sage-canvas">
      <Header
        onQuickLog={() => setIsLogModalOpen(true)}
        onSeedDemo={fetchDashboardData}
        onResetData={fetchDashboardData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
        {/* 1. Carbon Footprint Light Hero */}
        {currentWeek && (
          <CarbonFootprintHero
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

        {/* 2. Four Elegant Summary Cards with Compact Progress Bars */}
        {currentWeek && (
          <SummaryCards
            totalCo2={currentWeek.totalCo2}
            governmentThreshold={currentWeek.governmentThreshold}
            personalTarget={currentWeek.personalTarget}
            status={currentWeek.status}
            statusColor={currentWeek.statusColor}
            isExceeded={currentWeek.isExceeded}
            isFirstViolation={currentWeek.isFirstViolation}
            feeAmount={currentWeek.feeAmount}
            feeStatusLabel={currentWeek.feeStatusLabel}
            travelAllowance={travelAllowance}
          />
        )}

        {/* 3. Middle Section: Emissions Donut Breakdown + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmissionsDonutBreakdown
            categories={categories}
            totalCo2={currentWeek?.totalCo2 || 0}
          />

          <RecentActivitiesCard
            activities={recentActivities}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        </div>

        {/* 4. Compact Advisory Insight & Quick Citizen Actions */}
        {currentWeek && (
          <InsightAndQuickActions
            currentWeek={currentWeek}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}

        {/* 5. Lower Section: Compliance History Table + Travel Allowance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DashboardComplianceHistory weeks={allWeeks} />
          </div>

          <div>
            {travelAllowance && <TravelAllowanceCard allowance={travelAllowance} />}
          </div>
        </div>
      </main>

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={() => fetchDashboardData(true)}
      />

      {/* Threshold Exceeded In-App Toast Alert */}
      <ThresholdExceededToast
        isOpen={toastOpen}
        totalCo2={toastTotal}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

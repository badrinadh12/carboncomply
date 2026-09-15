'use client';

import React from 'react';
import Link from 'next/link';
import { formatCo2 } from '@/lib/calculations';
import { WeeklyComplianceSummary } from '@/lib/types';
import {
  PlusCircle,
  Target,
  History,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

interface InsightAndQuickActionsProps {
  currentWeek: WeeklyComplianceSummary;
  onOpenLogModal: () => void;
}

export default function InsightAndQuickActions({
  currentWeek,
  onOpenLogModal,
}: InsightAndQuickActionsProps) {
  const { totalCo2, governmentThreshold, remainingCo2, isExceeded, percentageUsed, isFirstViolation } = currentWeek;

  const diffOver = Math.max(0, Math.round((totalCo2 - governmentThreshold + Number.EPSILON) * 100) / 100);

  // Generate calm, professional status insight
  let insightTitle = '✓ ON TRACK';
  let insightMessage = `You are at ${percentageUsed}% of your 100 kg government threshold. You have ${formatCo2(remainingCo2)} kg remaining this week.`;
  let insightBorder = 'border-[#C9D6B8] bg-[#F4F9EC] text-[#16324F]';
  let badgeColor = 'bg-[#EBF4E0] text-[#0F6E56] border-[#C9D6B8]';
  let Icon = CheckCircle2;

  if (isExceeded) {
    insightTitle = '! LIMIT EXCEEDED';
    insightMessage = isFirstViolation
      ? `You are ${formatCo2(diffOver)} kg above the government weekly threshold. As this is your first breach, a statutory reminder has been issued at ₹0 fee.`
      : `You are ${formatCo2(diffOver)} kg above the government weekly threshold. A ₹10 Carbon Compliance Fee has been applied for this week.`;
    insightBorder = 'border-[#FECDD3] bg-[#FFF5F5] text-[#16324F]';
    badgeColor = 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]';
    Icon = AlertOctagon;
  } else if (percentageUsed >= 90) {
    insightTitle = '⚠ NEAR LIMIT';
    insightMessage = `You are within 10% of the statutory threshold with ${formatCo2(remainingCo2)} kg remaining. Keep an eye on upcoming emissions.`;
    insightBorder = 'border-[#FDBA74] bg-[#FFF7ED] text-[#16324F]';
    badgeColor = 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]';
    Icon = AlertTriangle;
  } else if (percentageUsed >= 70) {
    insightTitle = '⚠ APPROACHING LIMIT';
    insightMessage = `You're at ${percentageUsed}% of your government threshold with ${formatCo2(remainingCo2)} kg remaining. Keep an eye on your next activities.`;
    insightBorder = 'border-[#FDE047] bg-[#FEFCE8] text-[#16324F]';
    badgeColor = 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]';
    Icon = AlertTriangle;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Compact Insight Card */}
      <div className={`gov-card p-6 border rounded-2xl flex flex-col justify-between space-y-4 shadow-xs ${insightBorder}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {insightTitle}
          </span>
          <Icon className="w-4 h-4 opacity-75 shrink-0" />
        </div>

        <p className="text-xs leading-relaxed font-medium text-[#16324F]">
          “{insightMessage}”
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-black/5">
          <span className="text-[11px] text-[#526579]">Weekly Compliance Advisory</span>
          <Link
            href="/settings"
            className="text-xs font-semibold text-[#0F6E56] hover:underline transition cursor-pointer"
          >
            Review Policy Tips →
          </Link>
        </div>
      </div>

      {/* 2. Clean Quick Actions Card */}
      <div className="gov-card p-6 bg-white border border-[#E1E8D5] rounded-2xl flex flex-col justify-between space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#16324F]">Quick Citizen Actions</h3>
          <p className="text-xs text-[#526579]">Record activity, adjust targets, or inspect compliance audits</p>
        </div>

        <div className="space-y-2.5">
          {/* Primary Action Button (Strongest) */}
          <button
            onClick={onOpenLogModal}
            id="quick-log-btn"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log Activity</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/settings"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#F8FAF5] hover:bg-[#EFF5E2] text-[#16324F] border border-[#E1E8D5] rounded-xl text-xs font-semibold transition"
            >
              <Target className="w-3.5 h-3.5 text-[#0F6E56]" />
              <span>Personal Target</span>
            </Link>

            <Link
              href="/history"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#F8FAF5] hover:bg-[#EFF5E2] text-[#16324F] border border-[#E1E8D5] rounded-xl text-xs font-semibold transition"
            >
              <History className="w-3.5 h-3.5 text-[#0F6E56]" />
              <span>Audit History</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

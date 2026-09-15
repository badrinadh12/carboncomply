'use client';

import React from 'react';
import Link from 'next/link';
import { formatCo2 } from '@/lib/calculations';
import { WeeklyComplianceSummary } from '@/lib/types';
import {
  PlusCircle,
  Target,
  History,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Info,
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
  let insightTitle = 'ON TRACK';
  let insightMessage = `You are at ${percentageUsed}% of your 100 kg government threshold. You have ${formatCo2(remainingCo2)} kg remaining this week.`;
  let insightBorder = 'border-emerald-200/80 bg-emerald-50/50 text-emerald-950';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let Icon = CheckCircle2;

  if (isExceeded) {
    insightTitle = 'LIMIT EXCEEDED';
    insightMessage = isFirstViolation
      ? `You are ${formatCo2(diffOver)} kg above the government weekly threshold. As this is your first breach, a statutory reminder has been issued at ₹0 fee.`
      : `You are ${formatCo2(diffOver)} kg above the government weekly threshold. A ₹10 Carbon Compliance Fee has been applied for this week.`;
    insightBorder = 'border-rose-200/80 bg-rose-50/50 text-rose-950';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    Icon = AlertOctagon;
  } else if (percentageUsed >= 90) {
    insightTitle = 'NEAR LIMIT';
    insightMessage = `You are within 10% of the statutory threshold with ${formatCo2(remainingCo2)} kg remaining. Consider low-emission alternatives for upcoming trips.`;
    insightBorder = 'border-orange-200/80 bg-orange-50/50 text-orange-950';
    badgeColor = 'bg-orange-100 text-orange-800 border-orange-200';
    Icon = AlertTriangle;
  } else if (percentageUsed >= 70) {
    insightTitle = 'APPROACHING LIMIT';
    insightMessage = `You're at ${percentageUsed}% of your government threshold with ${formatCo2(remainingCo2)} kg remaining. Keep an eye on your next activities.`;
    insightBorder = 'border-amber-200/80 bg-amber-50/50 text-amber-950';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Compact Insight Card */}
      <div className={`gov-card p-6 border rounded-2xl flex flex-col justify-between space-y-4 ${insightBorder}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {insightTitle}
            </span>
          </div>
          <Icon className="w-4 h-4 opacity-75 shrink-0" />
        </div>

        <p className="text-xs leading-relaxed font-medium">
          “{insightMessage}”
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] opacity-70">Weekly Compliance Advisory</span>
          <Link
            href="/settings"
            className="text-xs font-semibold underline hover:opacity-80 transition cursor-pointer"
          >
            Review Policy Tips →
          </Link>
        </div>
      </div>

      {/* 2. Clean Quick Actions Card */}
      <div className="gov-card p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Quick Citizen Actions</h3>
          <p className="text-xs text-slate-500">Record, adjust targets, or inspect compliance audits</p>
        </div>

        <div className="space-y-2.5">
          {/* Primary Action Button (Strongest) */}
          <button
            onClick={onOpenLogModal}
            id="quick-log-btn"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log Activity</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/settings"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <Target className="w-3.5 h-3.5 text-slate-500" />
              <span>Personal Target</span>
            </Link>

            <Link
              href="/history"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Audit History</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

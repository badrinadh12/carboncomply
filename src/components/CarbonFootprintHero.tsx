'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { ComplianceStatus } from '@/lib/types';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Shield,
  Target,
  Edit2,
  Calendar,
} from 'lucide-react';

interface CarbonFootprintHeroProps {
  totalCo2: number;
  governmentThreshold: number; // 100 kg
  personalTarget: number;       // default 100 kg
  percentageUsed: number;
  remainingCo2: number;
  status: ComplianceStatus;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  isExceeded: boolean;
  weekLabel: string;
}

export default function CarbonFootprintHero({
  totalCo2,
  governmentThreshold,
  personalTarget,
  percentageUsed,
  remainingCo2,
  status,
  statusColor,
  isExceeded,
  weekLabel,
}: CarbonFootprintHeroProps) {
  // Status badge styling
  const statusBadge = {
    green: {
      label: '✓ On Track',
      pill: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80',
    },
    yellow: {
      label: 'Approaching Limit',
      pill: 'bg-amber-100/90 text-amber-800 border-amber-300/80',
    },
    orange: {
      label: 'Near Limit',
      pill: 'bg-orange-100/90 text-orange-800 border-orange-300/80',
    },
    red: {
      label: 'Limit Exceeded',
      pill: 'bg-rose-100/90 text-rose-800 border-rose-300/80',
    },
  }[statusColor];

  const diffOverLimit = Math.max(0, Math.round((totalCo2 - governmentThreshold + Number.EPSILON) * 100) / 100);

  return (
    <section className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border border-emerald-100/80 rounded-2xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Main Footprint Stats */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-white/90 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
              Your Carbon Footprint
            </span>
            <span className="text-slate-400 text-xs flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{weekLabel}</span>
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {formatCo2(totalCo2)}
            </h1>
            <span className="text-lg sm:text-xl font-medium text-slate-500">kg CO₂</span>
            <span className="text-xs font-medium text-slate-400 ml-1">This week</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.pill}`}
            >
              {statusBadge.label}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {isExceeded ? (
                <span className="text-rose-700 font-semibold">
                  {formatCo2(diffOverLimit)} kg over the government threshold.
                </span>
              ) : (
                <span>
                  {formatCo2(remainingCo2)} kg below the government threshold.
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Dual Threshold Cards (Clean, soft cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 lg:w-96">
          {/* Government Threshold Card */}
          <div className="p-4 rounded-xl bg-white/90 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Gov Threshold</span>
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                Fixed
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {formatCo2(governmentThreshold)} <span className="text-xs font-normal text-slate-500">kg CO₂/wk</span>
            </div>
            <p className="text-[10px] text-slate-400">Statutory Monday–Sunday Limit</p>
          </div>

          {/* Personal Target Card */}
          <div className="p-4 rounded-xl bg-white/90 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personal Target</span>
              </span>
              <Link
                href="/settings"
                className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-0.5"
              >
                <span>Edit</span>
                <Edit2 className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="text-lg font-bold text-slate-900">
              {formatCo2(personalTarget)} <span className="text-xs font-normal text-slate-500">kg CO₂/wk</span>
            </div>
            <p className="text-[10px] text-slate-400">Personal Goal Setting</p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { ComplianceStatus } from '@/lib/types';
import Link from 'next/link';
import {
  Shield,
  Target,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
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
  // Small elegant pill-shaped status badges
  const statusBadge = {
    green: {
      label: '✓ ON TRACK',
      pill: 'bg-[#EBF4E0] text-[#0F6E56] border-[#C9D6B8]',
      icon: CheckCircle2,
    },
    yellow: {
      label: '⚠ APPROACHING LIMIT',
      pill: 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]',
      icon: AlertTriangle,
    },
    orange: {
      label: '⚠ NEAR LIMIT',
      pill: 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]',
      icon: AlertTriangle,
    },
    red: {
      label: '! LIMIT EXCEEDED',
      pill: 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]',
      icon: AlertOctagon,
    },
  }[statusColor];

  const diffOverLimit = Math.max(0, Math.round((totalCo2 - governmentThreshold + Number.EPSILON) * 100) / 100);

  return (
    <section className="bg-white border border-[#E1E8D5] rounded-2xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Main Footprint Stats */}
        <div className="space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F6E56] bg-[#EBF4E0] border border-[#D3DEC3] px-2.5 py-0.5 rounded-md">
              Your Carbon Footprint
            </span>
            <span className="text-[#718096] text-xs flex items-center space-x-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#718096]" />
              <span>{weekLabel}</span>
            </span>
          </div>

          {/* Large, Clean CO2 Number */}
          <div className="flex items-baseline space-x-3">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-[#16324F] tracking-tight">
              {formatCo2(totalCo2)}
            </h1>
            <span className="text-xl sm:text-2xl font-bold text-[#526579]">kg CO₂</span>
            <span className="text-xs font-medium text-[#718096]">This week</span>
          </div>

          {/* Status pill & supporting text */}
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
            <span
              className={`inline-flex items-center px-2.5 py-0.8 rounded-full text-xs font-bold border ${statusBadge.pill} ${
                isExceeded ? 'ring-2 ring-rose-200/80 animate-pulse' : ''
              }`}
            >
              {statusBadge.label}
            </span>
            <span className="text-xs text-[#526579] font-medium">
              {isExceeded ? (
                <span className="text-[#9F1239] font-semibold">
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

        {/* Right: Dual Threshold Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 lg:w-96">
          {/* Government Threshold Card */}
          <div className="p-4 rounded-xl bg-[#F8FAF5] border border-[#E1E8D5] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#0F6E56]" />
                <span>Gov Threshold</span>
              </span>
              <span className="text-[10px] font-bold bg-[#EBF4E0] text-[#0F6E56] px-1.5 py-0.5 rounded border border-[#D3DEC3]">
                Fixed
              </span>
            </div>
            <div className="text-lg font-bold text-[#16324F]">
              {formatCo2(governmentThreshold)} <span className="text-xs font-normal text-[#526579]">kg CO₂/wk</span>
            </div>
            <p className="text-[10px] text-[#718096]">Statutory Mon–Sun Threshold</p>
          </div>

          {/* Personal Target Card */}
          <div className="p-4 rounded-xl bg-[#F8FAF5] border border-[#E1E8D5] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-[#0F6E56]" />
                <span>Personal Target</span>
              </span>
              <Link
                href="/settings"
                className="text-[10px] font-semibold text-[#0F6E56] hover:text-[#0A5C45] flex items-center space-x-0.5"
              >
                <span>Edit</span>
                <Edit2 className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="text-lg font-bold text-[#16324F]">
              {formatCo2(personalTarget)} <span className="text-xs font-normal text-[#526579]">kg CO₂/wk</span>
            </div>
            <p className="text-[10px] text-[#718096]">User-Defined Goal</p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { ComplianceStatus } from '@/lib/types';
import { Shield, Target, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';

interface CarbonMeterProps {
  totalCo2: number;
  governmentThreshold: number; // 100.00 kg
  personalTarget: number;       // default 100.00 kg
  percentageUsed: number;
  remainingCo2: number;
  status: ComplianceStatus;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  isExceeded: boolean;
  weekLabel: string;
}

export default function CarbonMeter({
  totalCo2,
  governmentThreshold,
  personalTarget,
  percentageUsed,
  remainingCo2,
  status,
  statusColor,
  isExceeded,
  weekLabel,
}: CarbonMeterProps) {
  // Cap visual bar at 100% for normal fill, and show overflow indicator if exceeded
  const visualFillPercentage = Math.min(100, Math.max(0, percentageUsed));

  // Visual styling mapped to warning level
  const statusConfig = {
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-100',
      badgeBorder: 'border-emerald-300',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
      description: 'Your weekly emissions are within normal, sustainable parameters.',
    },
    yellow: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badgeBg: 'bg-amber-100',
      badgeBorder: 'border-amber-300',
      barColor: 'bg-amber-500',
      icon: AlertTriangle,
      description: 'Caution: You have utilized over 70% of your weekly government threshold.',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      badgeBg: 'bg-orange-100',
      badgeBorder: 'border-orange-300',
      barColor: 'bg-orange-500',
      icon: AlertTriangle,
      description: 'High warning: You are within 10% of reaching the government compliance ceiling.',
    },
    red: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      badgeBg: 'bg-rose-100',
      badgeBorder: 'border-rose-300',
      barColor: 'bg-rose-500',
      icon: AlertOctagon,
      description: 'The official government weekly carbon threshold has been exceeded.',
    },
  }[statusColor];

  const StatusIcon = statusConfig.icon;

  // Calculate personal target position relative to government threshold (e.g. if personal is 80kg, position is 80%)
  const personalTargetMarkerPercent = Math.min(100, Math.max(0, (personalTarget / governmentThreshold) * 100));

  return (
    <div className="gov-card p-6 border border-slate-200 bg-white">
      {/* Header with Week & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              CURRENT WEEKLY METER
            </span>
            <span className="text-xs font-medium text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-700">{weekLabel}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {formatCo2(totalCo2)}{' '}
            <span className="text-sm font-medium text-slate-500">kg CO₂ logged</span>
          </h2>
        </div>

        {/* Compliance Status Chip */}
        <div
          className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide ${statusConfig.badgeBg} ${statusConfig.badgeBorder} ${statusConfig.text}`}
          id="compliance-status-badge"
        >
          <StatusIcon className="w-4 h-4 shrink-0" />
          <span>STATUS: {status}</span>
        </div>
      </div>

      {/* Main Dual-Track Visual Meter */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>0 kg</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span>Personal Goal: {formatCo2(personalTarget)} kg</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Gov Threshold: {formatCo2(governmentThreshold)} kg</span>
            </span>
          </div>
        </div>

        {/* Meter Track Container */}
        <div className="relative w-full h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          {/* Active Fill Bar */}
          <div
            className={`h-full transition-all duration-500 ease-out ${statusConfig.barColor}`}
            style={{ width: `${visualFillPercentage}%` }}
          />

          {/* Personal Target Indicator Marker */}
          {personalTargetMarkerPercent < 100 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
              style={{ left: `${personalTargetMarkerPercent}%` }}
              title={`Personal Target: ${personalTarget} kg`}
            />
          )}

          {/* 100 kg Government Threshold Marker */}
          <div
            className="absolute top-0 bottom-0 right-0 w-1 bg-emerald-700 z-10"
            title="Government Weekly Threshold: 100 kg"
          />
        </div>

        {/* Below Meter Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 text-center sm:text-left">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Threshold Usage</span>
            <span className="text-lg font-bold text-slate-900">{percentageUsed}%</span>
            <span className="text-[10px] text-slate-500 block">of 100.00 kg limit</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Headroom Remaining</span>
            <span className={`text-lg font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
              {isExceeded ? '0.00' : formatCo2(remainingCo2)} kg
            </span>
            <span className="text-[10px] text-slate-500 block">
              {isExceeded ? 'Threshold exceeded' : 'under limit'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Personal Target</span>
            <span className="text-lg font-bold text-slate-900">{formatCo2(personalTarget)} kg</span>
            <span className="text-[10px] text-slate-500 block">
              {totalCo2 > personalTarget ? 'Target exceeded' : 'On goal'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Gov Threshold</span>
            <span className="text-lg font-bold text-emerald-700">100.00 kg</span>
            <span className="text-[10px] text-slate-500 block">Fixed statutory limit</span>
          </div>
        </div>

        {/* Clear Explanatory Notice distinguishing Personal vs Government */}
        <div className={`mt-4 p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}>
          <StatusIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{statusConfig.description}</p>
            <p className="text-[11px] opacity-90">
              <span className="font-bold">Important Distinction:</span> Your Personal Target (
              {personalTarget} kg) guides individual progress. Only the fixed Government Threshold
              (100 kg) governs statutory compliance and fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

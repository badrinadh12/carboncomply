'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { ComplianceStatus, MonthlyTravelAllowance } from '@/lib/types';
import { Target, Shield, Plane, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface SummaryCardsProps {
  totalCo2: number;
  governmentThreshold: number; // 100 kg
  personalTarget: number;       // default 100 kg
  status: ComplianceStatus;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  isExceeded: boolean;
  isFirstViolation: boolean;
  feeAmount: number;
  feeStatusLabel: string;
  travelAllowance: MonthlyTravelAllowance | null;
}

export default function SummaryCards({
  totalCo2,
  governmentThreshold,
  personalTarget,
  status,
  statusColor,
  isExceeded,
  isFirstViolation,
  feeAmount,
  feeStatusLabel,
  travelAllowance,
}: SummaryCardsProps) {
  // 1. Personal Target calculations
  const personalRemaining = Math.max(0, Math.round((personalTarget - totalCo2 + Number.EPSILON) * 100) / 100);
  const personalOver = Math.max(0, Math.round((totalCo2 - personalTarget + Number.EPSILON) * 100) / 100);
  const personalPercent = Math.round((totalCo2 / personalTarget) * 1000) / 10;
  const personalBarFill = Math.min(100, Math.max(0, personalPercent));

  // 2. Government Threshold calculations
  const govRemaining = Math.max(0, Math.round((governmentThreshold - totalCo2 + Number.EPSILON) * 100) / 100);
  const govOver = Math.max(0, Math.round((totalCo2 - governmentThreshold + Number.EPSILON) * 100) / 100);
  const govPercent = Math.round((totalCo2 / governmentThreshold) * 1000) / 10;
  const govBarFill = Math.min(100, Math.max(0, govPercent));

  // 3. Travel Allowance
  const travelCo2 = travelAllowance?.travelCo2 || 0;
  const travelLimit = travelAllowance?.allowanceLimit || 200;
  const travelPercent = Math.round((travelCo2 / travelLimit) * 1000) / 10;
  const travelBarFill = Math.min(100, Math.max(0, travelPercent));
  const travelRemaining = Math.max(0, Math.round((travelLimit - travelCo2 + Number.EPSILON) * 100) / 100);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* CARD 1: Personal Target (Green Accent) */}
      <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Personal Target</span>
          </span>
          <Target className="w-4 h-4 text-emerald-600" />
        </div>

        <div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCo2(personalTarget)}{' '}
            <span className="text-xs font-normal text-slate-500">kg / week</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalCo2 > personalTarget ? (
              <span className="text-amber-700 font-medium">{formatCo2(personalOver)} kg over goal</span>
            ) : (
              <span>{formatCo2(personalRemaining)} kg remaining</span>
            )}
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>{personalPercent}% used</span>
            <span>{formatCo2(totalCo2)} / {formatCo2(personalTarget)} kg</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                totalCo2 > personalTarget ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${personalBarFill}%` }}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Government Threshold (Blue/Teal Accent, Fixed) */}
      <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Gov Threshold</span>
          </span>
          <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60 px-1.5 py-0.2 rounded">
            Fixed
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCo2(governmentThreshold)}{' '}
            <span className="text-xs font-normal text-slate-500">kg / week</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isExceeded ? (
              <span className="text-rose-700 font-medium">{formatCo2(govOver)} kg over limit</span>
            ) : (
              <span>{formatCo2(govRemaining)} kg remaining</span>
            )}
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>{govPercent}% used</span>
            <span>{formatCo2(totalCo2)} / {formatCo2(governmentThreshold)} kg</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isExceeded
                  ? 'bg-rose-500'
                  : govPercent >= 90
                  ? 'bg-orange-500'
                  : govPercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-teal-600'
              }`}
              style={{ width: `${govBarFill}%` }}
            />
          </div>
        </div>
      </div>

      {/* CARD 3: Travel Allowance (Soft Purple Accent) */}
      <div className="gov-card p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Travel Allowance</span>
          </span>
          <Plane className="w-4 h-4 text-purple-600" />
        </div>

        <div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCo2(travelCo2)}{' '}
            <span className="text-xs font-normal text-slate-500">/ {travelLimit} kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            This month • {formatCo2(travelRemaining)} kg remaining
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>{travelPercent}% used</span>
            <span>{travelAllowance?.isExceeded ? 'Exceeded' : 'Fair mobility'}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                travelAllowance?.isExceeded ? 'bg-rose-500' : 'bg-purple-500'
              }`}
              style={{ width: `${travelBarFill}%` }}
            />
          </div>
        </div>
      </div>

      {/* CARD 4: Compliance Status (Subtle Green or Soft Rose Warning, NEVER harsh red block!) */}
      <div
        className={`gov-card p-5 rounded-2xl flex flex-col justify-between space-y-3 ${
          isExceeded
            ? 'bg-rose-50/40 border border-rose-200/70'
            : 'bg-white border border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isExceeded ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <span>Compliance Status</span>
          </span>
          {isExceeded ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xl font-bold ${
                isExceeded ? 'text-rose-800' : 'text-slate-900'
              }`}
            >
              {isExceeded ? 'Limit Exceeded' : 'Compliant'}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">
            Fee: <span className={feeAmount > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>₹{feeAmount}</span>
          </div>
        </div>

        <div className="pt-1">
          <p className="text-[11px] text-slate-500 leading-snug">
            {isExceeded
              ? isFirstViolation
                ? 'First threshold violation — reminder issued.'
                : 'Subsequent violation — ₹10 fee applies.'
              : 'Within statutory threshold. No action required.'}
          </p>
        </div>
      </div>
    </section>
  );
}

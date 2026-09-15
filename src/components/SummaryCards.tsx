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
      {/* CARD 1: Personal Target (Green/Teal Accent) */}
      <div className="gov-card p-5 bg-white border border-[#E1E8D5] rounded-2xl flex flex-col justify-between space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F6E56]" />
            <span>Personal Target</span>
          </span>
          <Target className="w-4 h-4 text-[#0F6E56]" />
        </div>

        <div>
          <div className="text-2xl font-bold text-[#16324F]">
            {formatCo2(personalTarget)}{' '}
            <span className="text-xs font-normal text-[#526579]">kg / week</span>
          </div>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            {totalCo2 > personalTarget ? (
              <span className="text-[#854D0E] font-semibold">{formatCo2(personalOver)} kg over goal</span>
            ) : (
              <span>{formatCo2(personalRemaining)} kg remaining</span>
            )}
          </p>
        </div>

        {/* Compact Progress Bar with percentage aligned right */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#526579]">
            <span>{formatCo2(totalCo2)} / {formatCo2(personalTarget)} kg</span>
            <span className="text-[#16324F]">{personalPercent}% used</span>
          </div>
          <div className="w-full h-2.5 bg-[#E9EFE0] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                totalCo2 > personalTarget ? 'bg-[#D97706]' : 'bg-[#0F6E56]'
              }`}
              style={{ width: `${personalBarFill}%` }}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Government Threshold (Blue/Teal Accent, Fixed) */}
      <div className="gov-card p-5 bg-white border border-[#E1E8D5] rounded-2xl flex flex-col justify-between space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span>Gov Threshold</span>
          </span>
          <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-1.5 py-0.2 rounded">
            Fixed
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold text-[#16324F]">
            {formatCo2(governmentThreshold)}{' '}
            <span className="text-xs font-normal text-[#526579]">kg / week</span>
          </div>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            {isExceeded ? (
              <span className="text-[#9F1239] font-semibold">{formatCo2(govOver)} kg over limit</span>
            ) : (
              <span>{formatCo2(govRemaining)} kg remaining</span>
            )}
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#526579]">
            <span>{formatCo2(totalCo2)} / {formatCo2(governmentThreshold)} kg</span>
            <span className="text-[#16324F]">{govPercent}% used</span>
          </div>
          <div className="w-full h-2.5 bg-[#E9EFE0] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isExceeded
                  ? 'bg-[#E11D48]'
                  : govPercent >= 90
                  ? 'bg-[#EA580C]'
                  : govPercent >= 70
                  ? 'bg-[#D97706]'
                  : 'bg-[#0284C7]'
              }`}
              style={{ width: `${govBarFill}%` }}
            />
          </div>
        </div>
      </div>

      {/* CARD 3: Travel Allowance (Soft Purple Accent) */}
      <div className="gov-card p-5 bg-white border border-[#E1E8D5] rounded-2xl flex flex-col justify-between space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
            <span>Travel Allowance</span>
          </span>
          <Plane className="w-4 h-4 text-[#7C3AED]" />
        </div>

        <div>
          <div className="text-2xl font-bold text-[#16324F]">
            {formatCo2(travelCo2)}{' '}
            <span className="text-xs font-normal text-[#526579]">/ {travelLimit} kg</span>
          </div>
          <p className="text-xs text-[#526579] mt-0.5 font-medium">
            This month • {formatCo2(travelRemaining)} kg remaining
          </p>
        </div>

        {/* Compact Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#526579]">
            <span>{travelAllowance?.isExceeded ? 'Exceeded' : 'Fair mobility'}</span>
            <span className="text-[#16324F]">{travelPercent}% used</span>
          </div>
          <div className="w-full h-2.5 bg-[#E9EFE0] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                travelAllowance?.isExceeded ? 'bg-[#E11D48]' : 'bg-[#7C3AED]'
              }`}
              style={{ width: `${travelBarFill}%` }}
            />
          </div>
        </div>
      </div>

      {/* CARD 4: Compliance Status (Subtle Tint, Never Harsh Red Block) */}
      <div
        className={`gov-card p-5 rounded-2xl flex flex-col justify-between space-y-3.5 shadow-xs ${
          isExceeded
            ? 'bg-[#FFF5F5] border border-[#FECDD3]'
            : 'bg-white border border-[#E1E8D5]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#526579] uppercase tracking-wider flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isExceeded ? 'bg-[#E11D48]' : 'bg-[#0F6E56]'
              }`}
            />
            <span>Compliance Status</span>
          </span>
          {isExceeded ? (
            <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" />
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xl font-bold ${
                isExceeded ? 'text-[#9F1239]' : 'text-[#16324F]'
              }`}
            >
              {isExceeded ? 'Limit Exceeded' : 'Compliant'}
            </span>
          </div>
          <div className="text-sm font-semibold text-[#16324F] mt-0.5">
            Fee: <span className={feeAmount > 0 ? 'text-[#9F1239] font-bold' : 'text-[#0F6E56] font-bold'}>₹{feeAmount}</span>
          </div>
        </div>

        <div className="pt-1">
          <p className="text-[11px] text-[#526579] leading-snug font-medium">
            {isExceeded
              ? isFirstViolation
                ? 'First violation — reminder issued (₹0).'
                : 'Subsequent violation — ₹10 fee applied.'
              : 'Within statutory threshold. No action required.'}
          </p>
        </div>
      </div>
    </section>
  );
}

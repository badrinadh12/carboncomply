'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { MonthlyTravelAllowance } from '@/lib/types';
import { Plane, Info } from 'lucide-react';

interface TravelAllowanceCardProps {
  allowance: MonthlyTravelAllowance;
}

export default function TravelAllowanceCard({ allowance }: TravelAllowanceCardProps) {
  const {
    monthLabel,
    travelCo2,
    allowanceLimit,
    remaining,
    percentageUsed,
    isExceeded,
  } = allowance;

  const visualPercent = Math.min(100, Math.max(0, percentageUsed));

  return (
    <div className="gov-card p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Travel Allowance</h3>
            <p className="text-xs text-slate-500">{monthLabel} Flight Quota</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isExceeded
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-purple-50 text-purple-700 border-purple-200/70'
          }`}
        >
          {isExceeded ? 'Allowance Exceeded' : 'Fair Mobility'}
        </span>
      </div>

      <div>
        <div className="text-2xl font-bold text-slate-900">
          {formatCo2(travelCo2)}{' '}
          <span className="text-xs font-normal text-slate-500">/ {allowanceLimit} kg</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {percentageUsed}% used • {isExceeded ? (
            <span className="text-rose-700 font-semibold">{formatCo2(travelCo2 - allowanceLimit)} kg over limit</span>
          ) : (
            <span>{formatCo2(remaining)} kg remaining</span>
          )}
        </p>
      </div>

      {/* Elegant Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isExceeded ? 'bg-rose-500' : 'bg-purple-500'
            }`}
            style={{ width: `${visualPercent}%` }}
          />
        </div>
      </div>

      {/* Gentle educational context */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Travel emissions are included in your total footprint but tracked separately under the monthly travel allowance.
        </p>
      </div>
    </div>
  );
}

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
    <div className="gov-card p-6 bg-white border border-[#E1E8D5] rounded-2xl flex flex-col justify-between space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E8D5]/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center border border-purple-200/60">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#16324F]">Monthly Travel Allowance</h3>
            <p className="text-xs text-[#526579]">{monthLabel} Flight Quota</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isExceeded
              ? 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]'
              : 'bg-purple-50 text-[#7C3AED] border-purple-200'
          }`}
        >
          {isExceeded ? '! Allowance Exceeded' : '✓ Fair Mobility'}
        </span>
      </div>

      <div>
        <div className="text-2xl font-bold text-[#16324F]">
          {formatCo2(travelCo2)}{' '}
          <span className="text-xs font-normal text-[#526579]">/ {allowanceLimit} kg</span>
        </div>
        <p className="text-xs text-[#526579] mt-0.5 font-medium">
          {percentageUsed}% used • {isExceeded ? (
            <span className="text-[#9F1239] font-semibold">{formatCo2(travelCo2 - allowanceLimit)} kg over limit</span>
          ) : (
            <span>{formatCo2(remaining)} kg remaining</span>
          )}
        </p>
      </div>

      {/* Progress Bar with 8-10px height and sage track */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-[#E9EFE0] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isExceeded ? 'bg-[#E11D48]' : 'bg-[#7C3AED]'
            }`}
            style={{ width: `${visualPercent}%` }}
          />
        </div>
      </div>

      {/* Educational context note */}
      <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#E1E8D5] text-[11px] text-[#526579] flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Travel emissions are included in your total footprint but tracked separately under the monthly travel allowance.
        </p>
      </div>
    </div>
  );
}

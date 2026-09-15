'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { MonthlyTravelAllowance } from '@/lib/types';
import { Plane, AlertTriangle, CheckCircle, Info } from 'lucide-react';

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
    <div className="gov-card p-6 border border-slate-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-800 flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Fair Travel Allowance (Monthly)</h3>
            <p className="text-xs text-slate-500">Commercial Flight Travel Quarantine ({monthLabel})</p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border self-start sm:self-center ${
            isExceeded
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-violet-100 text-violet-800 border-violet-200'
          }`}
        >
          {isExceeded ? 'Monthly Travel Allowance Exceeded' : 'Fair Allowance Active'}
        </span>
      </div>

      {/* Numerical overview */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Flight CO₂ This Month</span>
          <span className="text-xl font-bold text-slate-900">{formatCo2(travelCo2)} kg</span>
          <span className="text-[10px] text-slate-500 block">Logged air travel</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Monthly Allowance</span>
          <span className="text-xl font-bold text-violet-700">{formatCo2(allowanceLimit)} kg</span>
          <span className="text-[10px] text-slate-500 block">200 kg statutory allowance</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[11px] font-medium text-slate-500 block">Allowance Headroom</span>
          <span className={`text-xl font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
            {isExceeded ? '0.00' : formatCo2(remaining)} kg
          </span>
          <span className="text-[10px] text-slate-500 block">
            {isExceeded ? 'Exceeded' : 'Available for flights'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-1.5">
          <span>Usage: {percentageUsed}% of 200 kg</span>
          <span>{formatCo2(travelCo2)} / {formatCo2(allowanceLimit)} kg</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isExceeded ? 'bg-rose-500' : 'bg-violet-600'
            }`}
            style={{ width: `${visualPercent}%` }}
          />
        </div>
      </div>

      {/* Policy Explanation Note */}
      <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Fairness Policy:</strong> Flight emissions are <strong>not exempt</strong> and remain fully calculated as part of your total weekly footprint. The separate monthly 200 kg travel allowance ensures essential long-distance travel is tracked fairly without penalizing necessary mobility.
          </p>
        </div>
      </div>
    </div>
  );
}

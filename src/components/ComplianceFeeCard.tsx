'use client';

import React from 'react';
import { formatCo2 } from '@/lib/calculations';
import { ShieldCheck, AlertCircle, Info, CheckCircle2, IndianRupee } from 'lucide-react';
import { ComplianceStatus } from '@/lib/types';

interface ComplianceFeeCardProps {
  totalCo2: number;
  governmentThreshold: number; // 100.00 kg
  status: ComplianceStatus;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  isExceeded: boolean;
  isFirstViolation: boolean;
  feeAmount: number; // 0 or 10
  feeStatusLabel: string;
}

export default function ComplianceFeeCard({
  totalCo2,
  governmentThreshold,
  status,
  statusColor,
  isExceeded,
  isFirstViolation,
  feeAmount,
  feeStatusLabel,
}: ComplianceFeeCardProps) {
  return (
    <div className="gov-card p-6 border border-slate-200 bg-white">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Government Compliance Assessment</h3>
            <p className="text-xs text-slate-500">Statutory Monday–Sunday Carbon Compliance Audit</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Weekly Cycle
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {/* Left Column: Compliance Standing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Government Threshold:</span>
            <span className="font-bold text-slate-900">{formatCo2(governmentThreshold)} kg CO₂</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Current Weekly Footprint:</span>
            <span className="font-bold text-slate-900">{formatCo2(totalCo2)} kg CO₂</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Official Compliance Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                isExceeded
                  ? 'bg-rose-100 text-rose-800'
                  : status === 'APPROACHING LIMIT' || status === 'NEAR LIMIT'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5">
            <span className="text-slate-500">Logging Activity Access:</span>
            <span className="font-semibold text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Always Unblocked</span>
            </span>
          </div>
        </div>

        {/* Right Column: Fee Box */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Carbon Compliance Fee
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  feeAmount > 0
                    ? 'bg-rose-600 text-white'
                    : isExceeded
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                ₹{feeAmount}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 flex items-center">
                <span>₹{feeAmount}</span>
                <span className="text-xs font-normal text-slate-500 ml-2">
                  {feeAmount === 0
                    ? isExceeded
                      ? '(First violation reminder)'
                      : '(No compliance fee)'
                    : '(Subsequent violation)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{feeStatusLabel}</p>
            </div>
          </div>

          {/* Rationale & Educational Context */}
          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-start space-x-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p>
                {isExceeded && isFirstViolation && (
                  <span className="text-amber-800 font-medium">
                    First threshold violation: Educational reminder issued at ₹0 fee to create awareness.
                  </span>
                )}
                {isExceeded && !isFirstViolation && (
                  <span className="text-rose-800 font-medium">
                    Subsequent threshold violation: Predictable ₹10 compliance fee applied.
                  </span>
                )}
                {!isExceeded && (
                  <span>
                    Your footprint is within the 100 kg threshold. First exceedance receives a reminder; subsequent ones incur ₹10.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prototype Disclaimer */}
      <div className="mt-4 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          <strong className="font-semibold text-slate-700">Prototype Notice:</strong> The ₹10 amount is represented as a simulated Carbon Compliance Fee. No actual payment collection is implemented.
        </span>
        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-slate-500 border border-slate-200 shrink-0 ml-2">
          Track 2 Prototype
        </span>
      </div>
    </div>
  );
}

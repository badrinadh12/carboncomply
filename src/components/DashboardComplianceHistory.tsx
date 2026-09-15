'use client';

import React from 'react';
import { WeeklyComplianceSummary } from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

interface DashboardComplianceHistoryProps {
  weeks: WeeklyComplianceSummary[];
}

export default function DashboardComplianceHistory({ weeks }: DashboardComplianceHistoryProps) {
  return (
    <div className="gov-card p-6 bg-white border border-[#E1E8D5] rounded-2xl shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#E1E8D5]/60">
        <div>
          <h3 className="text-sm font-bold text-[#16324F]">Compliance History</h3>
          <p className="text-xs text-[#526579]">Statutory Monday–Sunday archived cycles</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold text-[#0F6E56] hover:text-[#0A5C45] flex items-center space-x-1"
        >
          <span>Audit Trail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-[#526579]">
          <thead className="bg-[#F8FAF5] text-[#526579] font-semibold border-y border-[#E1E8D5]">
            <tr>
              <th className="py-2.5 px-3">Compliance Week</th>
              <th className="py-2.5 px-3 text-right">Total Footprint</th>
              <th className="py-2.5 px-3 text-right">Threshold</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8D5]/60">
            {weeks.slice(0, 5).map((week) => (
              <tr
                key={week.weekStart}
                className={`hover:bg-[#F8FAF5] transition ${
                  week.isCurrentWeek ? 'bg-[#EBF4E0]/30' : ''
                }`}
              >
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#16324F] flex items-center space-x-1.5">
                    <span>{week.weekLabel}</span>
                    {week.isCurrentWeek && (
                      <span className="text-[9px] font-bold bg-[#EBF4E0] text-[#0F6E56] border border-[#D3DEC3] px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-bold text-[#16324F]">
                  {formatCo2(week.totalCo2)} kg
                </td>
                <td className="py-3 px-3 text-right text-[#526579]">
                  {formatCo2(week.governmentThreshold)} kg
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      week.isExceeded
                        ? week.isFirstViolation
                          ? 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]'
                          : 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]'
                        : 'bg-[#EBF4E0] text-[#0F6E56] border-[#C9D6B8]'
                    }`}
                  >
                    {!week.isExceeded ? (
                      <>
                        <Check className="w-2.5 h-2.5 mr-1 text-[#0F6E56]" />
                        <span>Compliant</span>
                      </>
                    ) : week.isFirstViolation ? (
                      <span>First Violation</span>
                    ) : (
                      <span>Limit Exceeded</span>
                    )}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold">
                  {week.feeAmount > 0 ? (
                    <span className="text-[#9F1239] font-bold">₹{week.feeAmount}</span>
                  ) : (
                    <span className="text-[#718096]">₹0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

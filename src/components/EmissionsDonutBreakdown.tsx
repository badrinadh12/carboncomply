'use client';

import React from 'react';
import { CategoryBreakdownItem } from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import { Car, Plane, Zap, Utensils, PieChart } from 'lucide-react';

interface EmissionsDonutBreakdownProps {
  categories: CategoryBreakdownItem[];
  totalCo2: number;
}

export default function EmissionsDonutBreakdown({
  categories,
  totalCo2,
}: EmissionsDonutBreakdownProps) {
  // SVG Donut calculation constants
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Filter categories with co2 > 0 for donut segments
  const activeCategories = categories.filter((c) => c.co2_kg > 0);

  // Cumulative stroke offsets
  let accumulatedPercent = 0;
  const segments = activeCategories.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport':
        return Car;
      case 'travel':
        return Plane;
      case 'electricity':
        return Zap;
      case 'food':
        return Utensils;
      default:
        return PieChart;
    }
  };

  return (
    <div className="gov-card p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Emissions Breakdown</h3>
          <p className="text-xs text-slate-500">Distribution across verified citizen categories</p>
        </div>
        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
          Reconciled
        </span>
      </div>

      <div className="py-5 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* SVG Donut Chart with Center Text */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            {/* Background track circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Category Arcs */}
            {totalCo2 > 0 ? (
              segments.map((seg) => (
                <circle
                  key={seg.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              ))
            ) : (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}
          </svg>

          {/* Center Stat */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900 leading-tight">
              {formatCo2(totalCo2)}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              kg CO₂
            </span>
          </div>
        </div>

        {/* Legend / Category Breakdown List */}
        <div className="w-full space-y-2.5">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.category);
            return (
              <div
                key={cat.category}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{cat.label.split(' (')[0]}</span>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <span className="font-bold text-slate-900">{formatCo2(cat.co2_kg)} kg</span>
                  <span className="text-slate-400 font-medium w-9 text-right">
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Non-double-counted sum</span>
        <span className="font-semibold text-slate-600">Total: {formatCo2(totalCo2)} kg (100%)</span>
      </div>
    </div>
  );
}

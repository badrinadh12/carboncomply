'use client';

import React from 'react';
import { CategoryBreakdownItem } from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import { PieChart, Car, Plane, Zap, Utensils } from 'lucide-react';

interface CategoryBreakdownProps {
  categories: CategoryBreakdownItem[];
  totalCo2: number;
}

export default function CategoryBreakdown({ categories, totalCo2 }: CategoryBreakdownProps) {
  const getIcon = (cat: string) => {
    switch (cat) {
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
    <div className="gov-card p-6 border border-slate-200 bg-white">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Emissions by Category</h3>
            <p className="text-xs text-slate-500">
              Strict Non-Double-Counted Distribution (Total: {formatCo2(totalCo2)} kg CO₂)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          This Week
        </span>
      </div>

      {/* Multi-segment stacked horizontal distribution bar */}
      <div className="mt-5">
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
          {totalCo2 > 0 ? (
            categories.map((cat) => {
              if (cat.co2_kg <= 0) return null;
              return (
                <div
                  key={cat.category}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                  title={`${cat.label}: ${formatCo2(cat.co2_kg)} kg (${cat.percentage}%)`}
                  className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                />
              );
            })
          ) : (
            <div className="w-full h-full bg-slate-200" />
          )}
        </div>
      </div>

      {/* Structured Category Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-y border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Items Logged</th>
              <th className="py-2.5 px-3 text-right">CO₂ (kg)</th>
              <th className="py-2.5 px-3 text-right">Share (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const Icon = getIcon(cat.category);
              return (
                <tr key={cat.category} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 font-medium">
                    {cat.itemCount} entries
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {formatCo2(cat.co2_kg)} kg
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-700">
                    {cat.percentage.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
            <tr>
              <td className="py-2.5 px-3">Total Reconciled Footprint</td>
              <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                {categories.reduce((s, c) => s + c.itemCount, 0)} entries
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-800">
                {formatCo2(totalCo2)} kg
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-800">
                {totalCo2 > 0 ? '100.0%' : '0.0%'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { ActivityType } from '@/lib/types';
import { ACTIVITY_DEFINITIONS } from '@/lib/calculations';
import { Filter, RotateCcw, Calendar, Check } from 'lucide-react';

interface HistoryFilterBarProps {
  selectedType: string;
  startDate: string;
  endDate: string;
  onTypeChange: (type: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export default function HistoryFilterBar({
  selectedType,
  startDate,
  endDate,
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
  onClearFilters,
  isFiltered,
}: HistoryFilterBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Audit Filters (Applied to activity_date)</span>
        </div>
        {isFiltered && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Active Filter Applied
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Activity Type Dropdown */}
        <div>
          <label
            htmlFor="filter-activity-type"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Activity Type
          </label>
          <select
            id="filter-activity-type"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Activities</option>
            {(Object.keys(ACTIVITY_DEFINITIONS) as ActivityType[]).map((type) => (
              <option key={type} value={type}>
                {ACTIVITY_DEFINITIONS[type].label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label
            htmlFor="filter-date-from"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Date From (YYYY-MM-DD)
          </label>
          <div className="relative">
            <input
              id="filter-date-from"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label
            htmlFor="filter-date-to"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Date To (YYYY-MM-DD)
          </label>
          <div className="relative">
            <input
              id="filter-date-to"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-1">
        <button
          type="button"
          onClick={onClearFilters}
          id="clear-filters-btn"
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Clear Filters</span>
        </button>
        <button
          type="submit"
          id="apply-filters-btn"
          className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Filters</span>
        </button>
      </div>
    </form>
  );
}

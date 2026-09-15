'use client';

import React from 'react';
import { Activity } from '@/lib/types';
import { formatCo2 } from '@/lib/calculations';
import { formatDisplayDate, getTodayDateString } from '@/lib/dateUtils';
import Link from 'next/link';
import {
  Car,
  Plane,
  Zap,
  Utensils,
  Bus,
  ArrowRight,
  PlusCircle,
  Clock,
} from 'lucide-react';

interface RecentActivitiesCardProps {
  activities: Activity[];
  onOpenLogModal: () => void;
}

export default function RecentActivitiesCard({
  activities,
  onOpenLogModal,
}: RecentActivitiesCardProps) {
  const todayStr = getTodayDateString();

  const getActivityVisuals = (type: string) => {
    switch (type) {
      case 'car':
        return {
          icon: Car,
          bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
          label: 'Car Trip',
        };
      case 'bus':
        return {
          icon: Bus,
          bg: 'bg-sky-50 text-sky-700 border-sky-200/60',
          label: 'Bus Transit',
        };
      case 'flight':
        return {
          icon: Plane,
          bg: 'bg-purple-50 text-purple-700 border-purple-200/60',
          label: 'Flight Travel',
        };
      case 'electricity':
        return {
          icon: Zap,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          label: 'Electricity',
        };
      case 'veg_meal':
        return {
          icon: Utensils,
          bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
          label: 'Veg Meal',
        };
      case 'non_veg_meal':
        return {
          icon: Utensils,
          bg: 'bg-amber-50 text-amber-800 border-amber-200/60',
          label: 'Non-Veg Meal',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Activity',
        };
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    return formatDisplayDate(dateStr);
  };

  return (
    <div className="gov-card p-6 bg-white border border-[#E1E8D5] rounded-2xl flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[#E1E8D5]/60">
        <div>
          <h3 className="text-sm font-bold text-[#16324F]">Recent Activities</h3>
          <p className="text-xs text-[#526579]">Verified citizen logged entries</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold text-[#0F6E56] hover:text-[#0A5C45] flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-xs font-semibold text-[#16324F]">No activities logged yet.</p>
          <p className="text-[11px] text-[#526579] max-w-xs mx-auto">
            Start tracking your footprint by logging your first activity.
          </p>
          <button
            onClick={onOpenLogModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#0F6E56] hover:bg-[#0A5C45] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Log Activity</span>
          </button>
        </div>
      ) : (
        <div className="py-2 divide-y divide-[#E1E8D5]/60">
          {activities.slice(0, 4).map((act) => {
            const visual = getActivityVisuals(act.activity_type);
            const Icon = visual.icon;
            return (
              <div
                key={act.id}
                className="py-3 flex items-center justify-between hover:bg-[#F8FAF5] px-2 rounded-xl transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${visual.bg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#16324F]">{visual.label}</div>
                    <div className="text-[11px] text-[#526579] font-medium">
                      {act.quantity.toLocaleString()} {act.unit} • {formatFriendlyDate(act.activity_date)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#16324F]">{formatCo2(act.co2_kg)} kg</div>
                  <div className="text-[10px] text-[#718096] font-medium">CO₂</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-3 border-t border-[#E1E8D5]/60 flex items-center justify-between text-[11px] text-[#718096]">
        <span>Persistent backend database</span>
        <button
          onClick={onOpenLogModal}
          className="text-[#0F6E56] hover:text-[#0A5C45] font-bold cursor-pointer"
        >
          + Add another
        </button>
      </div>
    </div>
  );
}

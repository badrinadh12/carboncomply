'use client';

import React from 'react';
import { DeterministicInsight } from '@/lib/types';
import { Sparkles, Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

interface PersonalInsightsProps {
  insights: DeterministicInsight[];
}

export default function PersonalInsights({ insights }: PersonalInsightsProps) {
  if (!insights || insights.length === 0) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return AlertOctagon;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="gov-card p-6 border border-slate-200 bg-white">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Personal Climate Insights</h3>
            <p className="text-xs text-slate-500">Deterministic Analytics Generated from Verified Citizen Logs</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Rule-Based
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {insights.map((insight) => {
          const Icon = getInsightIcon(insight.type);
          const style = getCardStyle(insight.type);
          return (
            <div
              key={insight.id}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 transition ${style}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold">{insight.title}</h4>
                <p className="text-[11px] leading-relaxed opacity-90">{insight.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

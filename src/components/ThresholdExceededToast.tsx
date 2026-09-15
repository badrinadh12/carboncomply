'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCo2 } from '@/lib/calculations';
import { AlertTriangle, Bell, X, ArrowRight } from 'lucide-react';

export interface ThresholdExceededToastProps {
  isOpen: boolean;
  totalCo2: number;
  governmentThreshold?: number; // 100 kg
  onClose: () => void;
}

export default function ThresholdExceededToast({
  isOpen,
  totalCo2,
  governmentThreshold = 100,
  onClose,
}: ThresholdExceededToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Auto-dismiss after 9 seconds if not closed manually
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 9000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !visible) return null;

  const diffOver = Math.max(0, Math.round((totalCo2 - governmentThreshold + Number.EPSILON) * 100) / 100);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 max-w-md w-full sm:w-96 transition-all duration-300 ease-out transform pointer-events-auto ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200/80 p-4 shadow-lg shadow-rose-900/5 space-y-3">
        {/* Toast Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/60 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Government Threshold Exceeded
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">Statutory Weekly Limit Alert</p>
            </div>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toast Body */}
        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1">
          <div className="text-sm font-bold text-slate-900">
            {formatCo2(totalCo2)} kg CO₂ <span className="text-xs font-normal text-slate-500">this week</span>
          </div>
          <p className="text-xs text-rose-800 leading-snug">
            Your weekly footprint is <strong className="font-semibold">{formatCo2(diffOver)} kg</strong> above the 100 kg government threshold.
          </p>
        </div>

        {/* Toast Action Footer */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[11px] text-slate-400">Educational compliance notice</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              Dismiss
            </button>
            <Link
              href="/dashboard"
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

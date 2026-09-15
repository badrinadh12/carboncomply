'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { formatCo2 } from '@/lib/calculations';

interface AbsurdInputDialogProps {
  isOpen: boolean;
  activityLabel: string;
  quantity: number;
  unit: string;
  co2_kg: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AbsurdInputDialog({
  isOpen,
  activityLabel,
  quantity,
  unit,
  co2_kg,
  onConfirm,
  onCancel,
}: AbsurdInputDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="absurd-dialog-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Clean Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 id="absurd-dialog-title" className="text-sm font-bold text-slate-900">
                Unusually High Value Detected
              </h3>
              <p className="text-[11px] text-slate-500">Statutory Input Verification (Decision Point 2)</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-medium">
            “This value is unusually high. Please confirm that the quantity is correct.”
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with citizen data verification standards, CARBONCOMPLY flags quantities
            that significantly exceed normal everyday thresholds. If this is an actual reading,
            you may explicitly confirm and record it without automatic modification.
          </p>

          {/* Activity summary card */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Activity:</span>
              <span className="font-bold text-slate-800">{activityLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entered Quantity:</span>
              <span className="font-bold text-amber-800 font-mono">
                {quantity.toLocaleString()} {unit}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Calculated Footprint:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatCo2(co2_kg)} kg CO₂
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onCancel}
            id="absurd-cancel-btn"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancel / Correct
          </button>
          <button
            type="button"
            onClick={onConfirm}
            id="absurd-confirm-btn"
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm & Save Exact Value</span>
          </button>
        </div>
      </div>
    </div>
  );
}

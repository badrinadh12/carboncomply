'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="absurd-dialog-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Header banner */}
        <div className="bg-amber-500 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-600/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="absurd-dialog-title" className="text-base font-bold">
                Unusually High Quantity Detected
              </h3>
              <p className="text-xs text-amber-100">Statutory Input Verification (Decision Point 2)</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-amber-100 hover:text-white p-1 rounded-md transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
            “This value is unusually high. Please confirm that the quantity is correct.”
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with citizen data verification standards, CARBONCOMPLY flags quantities
            that significantly exceed normal everyday thresholds. If this is an actual reading (e.g.
            an extensive journey or commercial aggregate), you may explicitly confirm and record it
            without automatic modification.
          </p>

          {/* Activity summary card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Activity:</span>
              <span className="font-bold text-slate-900">{activityLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entered Quantity:</span>
              <span className="font-bold text-amber-700 text-sm">
                {quantity.toLocaleString()} {unit}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Calculated Footprint:</span>
              <span className="font-bold text-rose-600 text-base">
                {formatCo2(co2_kg)} kg CO₂
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            Note: As per Decision Point 2 (DP2), this entry will be saved exactly as entered upon
            confirmation, or discarded safely if cancelled.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            id="absurd-cancel-btn"
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
          >
            Cancel / Correct Value
          </button>
          <button
            type="button"
            onClick={onConfirm}
            id="absurd-confirm-btn"
            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Save Exact Value</span>
          </button>
        </div>
      </div>
    </div>
  );
}

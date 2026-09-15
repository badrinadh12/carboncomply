'use client';

import React, { useState, useEffect } from 'react';
import {
  ActivityType,
  ActivityDefinition,
} from '@/lib/types';
import {
  ACTIVITY_DEFINITIONS,
  calculateCo2,
  formatCo2,
  isAbsurdValue,
} from '@/lib/calculations';
import { getTodayDateString, formatDisplayDate } from '@/lib/dateUtils';
import AbsurdInputDialog from './AbsurdInputDialog';
import {
  PlusCircle,
  X,
  Car,
  Plane,
  Zap,
  Utensils,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LogActivityModal({ isOpen, onClose, onSuccess }: LogActivityModalProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('car');
  const [quantity, setQuantity] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Absurd input confirmation modal state (DP2)
  const [showAbsurdDialog, setShowAbsurdDialog] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setActivityDate(getTodayDateString());
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowAbsurdDialog(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDef: ActivityDefinition = ACTIVITY_DEFINITIONS[selectedType];
  const numQuantity = parseFloat(quantity) || 0;
  const estimatedCo2 = calculateCo2(numQuantity, currentDef.emissionFactor);

  const handleTypeChange = (type: ActivityType) => {
    setSelectedType(type);
    setErrorMessage(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!quantity || isNaN(numQuantity) || numQuantity <= 0) {
      setErrorMessage('Please enter a valid positive numeric quantity greater than 0.');
      return;
    }

    if (!activityDate) {
      setErrorMessage('Please select a valid activity date.');
      return;
    }

    // Check for absurd input (DP2)
    if (isAbsurdValue(selectedType, numQuantity)) {
      setShowAbsurdDialog(true);
      return;
    }

    executeSave();
  };

  const executeSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: selectedType,
          quantity: numQuantity,
          activity_date: activityDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save activity record.');
      }

      setSuccessMessage(`Activity saved: ${formatCo2(estimatedCo2)} kg CO₂ recorded.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
      setShowAbsurdDialog(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-modal-title"
      >
        <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="log-modal-title" className="text-base font-bold text-slate-900">
                  Log Citizen Carbon Activity
                </h3>
                <p className="text-xs text-slate-500">Official Government Emission Recording Form</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Activity Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Activity Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(ACTIVITY_DEFINITIONS) as ActivityType[]).map((type) => {
                  const def = ACTIVITY_DEFINITIONS[type];
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold">{def.label}</span>
                        {type === 'flight' && (
                          <span className="text-[9px] bg-violet-100 text-violet-800 font-bold px-1 rounded">
                            Travel
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {def.emissionFactor} kg/{def.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Input with Automatic Unit Display */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="activity-quantity-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  2. Enter Quantity
                </label>
                <span className="text-xs font-medium text-slate-500">
                  Unit: <strong className="text-slate-800">{currentDef.unit}</strong>
                </span>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="activity-quantity-input"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder={`e.g. 20 ${currentDef.unit}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                  {currentDef.unit}
                </div>
              </div>
            </div>

            {/* Date Input (strictly persistent activity_date) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="activity-date-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  3. Activity Date (Strictly Persistent)
                </label>
                <span className="text-xs text-slate-500">
                  {formatDisplayDate(activityDate)}
                </span>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="activity-date-input"
                  type="date"
                  required
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                * Weekly calculations strictly use this activity date (Monday–Sunday cycle).
              </p>
            </div>

            {/* Auto-Calculation Live Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Statutory Emission Factor:</span>
                <span className="font-semibold text-slate-800">
                  {currentDef.emissionFactor.toFixed(2)} kg CO₂ / {currentDef.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Category Attribution:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {currentDef.categoryLabel}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Estimated CO₂ Footprint:</span>
                <span className="text-xl font-extrabold text-emerald-800">
                  {formatCo2(estimatedCo2)} <span className="text-xs font-semibold">kg CO₂</span>
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                id="save-activity-btn"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 rounded-lg shadow-xs transition flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Activity...' : 'Save Activity'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Absurd Input Confirmation Modal (DP2) */}
      <AbsurdInputDialog
        isOpen={showAbsurdDialog}
        activityLabel={currentDef.label}
        quantity={numQuantity}
        unit={currentDef.unit}
        co2_kg={estimatedCo2}
        onConfirm={executeSave}
        onCancel={() => setShowAbsurdDialog(false)}
      />
    </>
  );
}

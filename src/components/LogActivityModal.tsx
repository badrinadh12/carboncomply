'use client';

import React, { useState, useEffect } from 'react';
import { ActivityType, ActivityDefinition } from '@/lib/types';
import { ACTIVITY_DEFINITIONS, calculateCo2, formatCo2, isAbsurdValue } from '@/lib/calculations';
import { getTodayDateString, formatDisplayDate } from '@/lib/dateUtils';
import { getAppEffectiveDate } from '@/lib/demoDate';
import AbsurdInputDialog from './AbsurdInputDialog';
import {
  PlusCircle,
  X,
  Car,
  Plane,
  Zap,
  Utensils,
  Bus,
  AlertCircle,
  CheckCircle2,
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
  const [showAbsurdDialog, setShowAbsurdDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setActivityDate(getAppEffectiveDate());
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
      setErrorMessage('Please enter a valid positive quantity greater than 0.');
      return;
    }

    if (!activityDate) {
      setErrorMessage('Please select a valid activity date.');
      return;
    }

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
        throw new Error(data.error || 'Failed to record activity.');
      }

      setSuccessMessage(`Recorded ${formatCo2(estimatedCo2)} kg CO₂.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving.');
    } finally {
      setIsSubmitting(false);
      setShowAbsurdDialog(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'car':
        return Car;
      case 'bus':
        return Bus;
      case 'flight':
        return Plane;
      case 'electricity':
        return Zap;
      case 'veg_meal':
        return Utensils;
      case 'non_veg_meal':
        return Utensils;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-6">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Log Carbon Activity</h3>
                <p className="text-[11px] text-slate-500">Record to current compliance week</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start space-x-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Activity Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ACTIVITY_DEFINITIONS) as ActivityType[]).map((type) => {
                  const def = ACTIVITY_DEFINITIONS[type];
                  const Icon = getActivityIcon(type);
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200/80 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        />
                        {type === 'flight' && (
                          <span className="text-[8px] bg-purple-100 text-purple-700 font-semibold px-1 rounded">
                            Travel
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold">{def.label}</span>
                      <span className="text-[10px] text-slate-400">
                        {def.emissionFactor} kg/{def.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="modal-quantity"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Quantity
                </label>
                <span className="text-xs text-slate-500">
                  Unit: <strong className="text-slate-800">{currentDef.unit}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  id="modal-quantity"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder={`e.g. 20 ${currentDef.unit}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                  {currentDef.unit}
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="modal-date"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Activity Date
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {formatDisplayDate(activityDate)}
                </span>
              </div>
              <input
                id="modal-date"
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>

            {/* Preview Box */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Emission Factor:</span>
                <span className="font-semibold text-slate-700">
                  {currentDef.emissionFactor.toFixed(2)} kg CO₂ / {currentDef.unit}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Estimated CO₂:</span>
                <span className="text-xl font-extrabold text-emerald-800">
                  {formatCo2(estimatedCo2)}{' '}
                  <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                id="save-activity-btn"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Activity'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

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

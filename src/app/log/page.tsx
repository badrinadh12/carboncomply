'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { ActivityType, ActivityDefinition } from '@/lib/types';
import { ACTIVITY_DEFINITIONS, calculateCo2, formatCo2, isAbsurdValue } from '@/lib/calculations';
import { getTodayDateString, formatDisplayDate } from '@/lib/dateUtils';
import AbsurdInputDialog from '@/components/AbsurdInputDialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Car,
  Plane,
  Zap,
  Utensils,
  Bus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function LogActivityPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ActivityType>('car');
  const [quantity, setQuantity] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAbsurdDialog, setShowAbsurdDialog] = useState(false);

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

      setSuccessMessage(
        `Recorded ${formatCo2(estimatedCo2)} kg CO₂ for ${formatDisplayDate(activityDate)}.`
      );
      setQuantity('');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Log Carbon Activity</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select activity, enter quantity, and record toward your Monday–Sunday compliance cycle.
          </p>
        </div>

        {/* Clean Centered Form Card */}
        <div className="gov-card p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Activity Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Activity Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(ACTIVITY_DEFINITIONS) as ActivityType[]).map((type) => {
                  const def = ACTIVITY_DEFINITIONS[type];
                  const Icon = getActivityIcon(type);
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeChange(type)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500 shadow-2xs'
                          : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        />
                        {type === 'flight' && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 font-semibold px-1 rounded">
                            Travel
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold">{def.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {def.emissionFactor.toFixed(2)} kg/{def.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quantity & Unit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="quantity-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Quantity
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  Unit: <strong className="text-slate-800">{currentDef.unit}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  id="quantity-input"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder={`e.g. 20 ${currentDef.unit}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                  {currentDef.unit}
                </div>
              </div>
            </div>

            {/* 3. Activity Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="date-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Date
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {formatDisplayDate(activityDate)}
                </span>
              </div>
              <input
                id="date-input"
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>

            {/* Live Calculation Box */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Emission Factor:</span>
                <span className="font-semibold text-slate-800">
                  {currentDef.emissionFactor.toFixed(2)} kg CO₂ / {currentDef.unit}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Category:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {currentDef.categoryLabel}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Estimated CO₂:</span>
                <span className="text-2xl font-extrabold text-emerald-800">
                  {formatCo2(estimatedCo2)}{' '}
                  <span className="text-xs font-normal text-slate-500">kg CO₂</span>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                id="save-activity-btn"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Activity'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <AbsurdInputDialog
        isOpen={showAbsurdDialog}
        activityLabel={currentDef.label}
        quantity={numQuantity}
        unit={currentDef.unit}
        co2_kg={estimatedCo2}
        onConfirm={executeSave}
        onCancel={() => setShowAbsurdDialog(false)}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { ActivityType, ActivityDefinition } from '@/lib/types';
import { ACTIVITY_DEFINITIONS, calculateCo2, formatCo2, isAbsurdValue } from '@/lib/calculations';
import { getTodayDateString, formatDisplayDate } from '@/lib/dateUtils';
import { getAppEffectiveDate } from '@/lib/demoDate';
import { evaluateAndTriggerThresholdAlert } from '@/lib/notificationTracker';
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
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
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

  React.useEffect(() => {
    setActivityDate(getAppEffectiveDate());
  }, []);

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

      // Check if threshold was newly crossed
      try {
        const compRes = await fetch('/api/compliance');
        const compData = await compRes.json();
        if (compData.success && compData.currentWeek) {
          evaluateAndTriggerThresholdAlert(
            compData.currentWeek.totalCo2,
            compData.currentWeek.weekStart,
            () => {},
            true
          );
        }
      } catch (e) {}

      setSuccessMessage(
        `Recorded ${formatCo2(estimatedCo2)} kg CO₂ for ${formatDisplayDate(activityDate)}.`
      );
      setQuantity('');
      setTimeout(() => {
        router.push('/dashboard');
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
    <div className="min-h-screen flex flex-col bg-sage-canvas">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#526579] hover:text-[#16324F] transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
            Log Carbon Activity
          </h1>
          <p className="text-xs text-[#526579] mt-0.5">
            Select activity, enter quantity, and record toward your Monday–Sunday compliance cycle.
          </p>
        </div>

        {/* Clean Centered White Card */}
        <div className="gov-card p-6 sm:p-8 bg-white border border-[#E1E8D5] rounded-2xl shadow-xs">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-[#FFF5F5] border border-[#FECDD3] rounded-xl flex items-start space-x-2.5 text-xs text-[#9F1239]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-start space-x-2.5 text-xs text-[#14532D]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Activity Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#16324F] mb-2.5">
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
                          ? 'border-[#0F6E56] bg-[#EBF4E0] text-[#16324F] font-semibold ring-1 ring-[#0F6E56] shadow-2xs'
                          : 'border-[#E1E8D5] hover:border-[#C9D6B8] hover:bg-[#F8FAF5] text-[#16324F]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? 'text-[#0F6E56]' : 'text-[#718096]'
                          }`}
                        />
                        {type === 'flight' && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 font-semibold px-1 rounded">
                            Travel
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold">{def.label}</span>
                      <span className="text-[10px] text-[#526579] mt-0.5">
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
                  className="block text-xs font-bold uppercase tracking-wider text-[#16324F]"
                >
                  Quantity
                </label>
                <span className="text-xs text-[#526579] font-medium">
                  Unit: <strong className="text-[#16324F]">{currentDef.unit}</strong>
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
                  className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#16324F] focus:ring-2 focus:ring-[#0F6E56] focus:outline-hidden font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold text-[#718096]">
                  {currentDef.unit}
                </div>
              </div>
            </div>

            {/* 3. Activity Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="date-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#16324F]"
                >
                  Date
                </label>
                <span className="text-xs text-[#526579] font-medium">
                  {formatDisplayDate(activityDate)}
                </span>
              </div>
              <input
                id="date-input"
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#16324F] focus:ring-2 focus:ring-[#0F6E56] focus:outline-hidden font-medium"
              />
            </div>

            {/* Live Calculation Box */}
            <div className="p-4 rounded-xl bg-[#F8FAF5] border border-[#E1E8D5] space-y-2 text-xs">
              <div className="flex justify-between text-[#526579]">
                <span>Emission Factor:</span>
                <span className="font-semibold text-[#16324F]">
                  {currentDef.emissionFactor.toFixed(2)} kg CO₂ / {currentDef.unit}
                </span>
              </div>
              <div className="flex justify-between text-[#526579]">
                <span>Category:</span>
                <span className="font-semibold text-[#16324F] capitalize">
                  {currentDef.categoryLabel}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E1E8D5] flex justify-between items-center">
                <span className="font-bold text-[#16324F]">Estimated CO₂:</span>
                <span className="text-2xl font-extrabold text-[#0F6E56]">
                  {formatCo2(estimatedCo2)}{' '}
                  <span className="text-xs font-normal text-[#526579]">kg CO₂</span>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold text-[#526579] hover:bg-[#F8FAF5] rounded-xl transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                id="save-activity-btn"
                className="px-6 py-2.5 bg-[#0F6E56] hover:bg-[#0A5C45] disabled:bg-[#CBD5E1] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-2 cursor-pointer"
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

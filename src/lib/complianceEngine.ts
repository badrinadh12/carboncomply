import {
  Activity,
  ComplianceStatus,
  WeeklyComplianceSummary,
  CategoryBreakdownItem,
  MonthlyTravelAllowance,
  ComplianceWeek,
  DeterministicInsight,
} from './types';
import {
  GOVERNMENT_WEEKLY_THRESHOLD,
  DEFAULT_PERSONAL_TARGET,
  MONTHLY_TRAVEL_ALLOWANCE,
  CARBON_COMPLIANCE_FEE,
  ACTIVITY_DEFINITIONS,
  formatCo2,
} from './calculations';
import {
  getWeekRangeForDate,
  getTodayDateString,
  getMonthInfo,
} from './dateUtils';

/**
 * Evaluates the compliance warning level based on the government threshold.
 * Note: exactly 100.00 kg is reached but NOT exceeded.
 */
export function evaluateComplianceStatus(totalCo2: number, threshold: number = GOVERNMENT_WEEKLY_THRESHOLD): {
  status: ComplianceStatus;
  statusColor: 'green' | 'yellow' | 'orange' | 'red';
  isExceeded: boolean;
} {
  const roundedCo2 = Math.round((totalCo2 + Number.EPSILON) * 100) / 100;
  const percentage = (roundedCo2 / threshold) * 100;

  if (roundedCo2 > threshold) {
    return {
      status: 'LIMIT EXCEEDED',
      statusColor: 'red',
      isExceeded: true,
    };
  }

  if (percentage >= 90) {
    return {
      status: 'NEAR LIMIT',
      statusColor: 'orange',
      isExceeded: false,
    };
  }

  if (percentage >= 70) {
    return {
      status: 'APPROACHING LIMIT',
      statusColor: 'yellow',
      isExceeded: false,
    };
  }

  return {
    status: 'ON TRACK',
    statusColor: 'green',
    isExceeded: false,
  };
}

/**
 * Computes non-double-counted category breakdown for a set of activities.
 * Categories: Transport, Travel, Electricity, Food.
 */
export function computeCategoryBreakdown(activities: Activity[]): CategoryBreakdownItem[] {
  let transportCo2 = 0;
  let travelCo2 = 0;
  let electricityCo2 = 0;
  let foodCo2 = 0;

  let transportCount = 0;
  let travelCount = 0;
  let electricityCount = 0;
  let foodCount = 0;

  for (const act of activities) {
    const def = ACTIVITY_DEFINITIONS[act.activity_type];
    const category = def ? def.category : 'transport';
    const co2 = Number(act.co2_kg) || 0;

    switch (category) {
      case 'transport':
        transportCo2 += co2;
        transportCount++;
        break;
      case 'travel':
        travelCo2 += co2;
        travelCount++;
        break;
      case 'electricity':
        electricityCo2 += co2;
        electricityCount++;
        break;
      case 'food':
        foodCo2 += co2;
        foodCount++;
        break;
    }
  }

  const total = transportCo2 + travelCo2 + electricityCo2 + foodCo2;

  const getPercent = (catTotal: number) => {
    if (total <= 0) return 0;
    return Math.round((catTotal / total) * 1000) / 10; // 1 decimal place
  };

  return [
    {
      category: 'transport',
      label: 'Transport (Car, Bus)',
      co2_kg: Math.round((transportCo2 + Number.EPSILON) * 100) / 100,
      percentage: getPercent(transportCo2),
      color: '#0284c7', // Sky Blue
      itemCount: transportCount,
    },
    {
      category: 'travel',
      label: 'Travel (Flight)',
      co2_kg: Math.round((travelCo2 + Number.EPSILON) * 100) / 100,
      percentage: getPercent(travelCo2),
      color: '#8b5cf6', // Violet
      itemCount: travelCount,
    },
    {
      category: 'electricity',
      label: 'Electricity (Power Grid)',
      co2_kg: Math.round((electricityCo2 + Number.EPSILON) * 100) / 100,
      percentage: getPercent(electricityCo2),
      color: '#eab308', // Amber
      itemCount: electricityCount,
    },
    {
      category: 'food',
      label: 'Food (Meals)',
      co2_kg: Math.round((foodCo2 + Number.EPSILON) * 100) / 100,
      percentage: getPercent(foodCo2),
      color: '#10b981', // Emerald
      itemCount: foodCount,
    },
  ];
}

/**
 * Computes monthly travel allowance status for a specific month.
 * Allowance: 200 kg CO2/month for flights.
 */
export function computeMonthlyTravelAllowance(activities: Activity[], monthKey?: string): MonthlyTravelAllowance {
  const currentMonthKey = monthKey || getMonthInfo(getTodayDateString()).monthKey;
  const monthInfo = getMonthInfo(`${currentMonthKey}-01`);

  let travelCo2 = 0;
  for (const act of activities) {
    if (act.activity_type === 'flight' && act.activity_date.startsWith(currentMonthKey)) {
      travelCo2 += Number(act.co2_kg) || 0;
    }
  }

  const rounded = Math.round((travelCo2 + Number.EPSILON) * 100) / 100;
  const remaining = Math.max(0, Math.round((MONTHLY_TRAVEL_ALLOWANCE - rounded + Number.EPSILON) * 100) / 100);
  const percentageUsed = Math.round((rounded / MONTHLY_TRAVEL_ALLOWANCE) * 1000) / 10;
  const isExceeded = rounded > MONTHLY_TRAVEL_ALLOWANCE;

  return {
    month: currentMonthKey,
    monthLabel: monthInfo.monthLabel,
    travelCo2: rounded,
    allowanceLimit: MONTHLY_TRAVEL_ALLOWANCE,
    remaining,
    percentageUsed,
    isExceeded,
  };
}

/**
 * Computes compliance summary for all historical weeks and the current week.
 * Analyzes chronological violations to determine:
 * - First-ever violation: Reminder issued, ₹0 fee
 * - Every subsequent violation: ₹10 Carbon Compliance Fee
 */
export function computeAllWeeklySummaries(
  activities: Activity[],
  personalTarget: number = DEFAULT_PERSONAL_TARGET,
  referenceDateStr?: string
): {
  currentWeekSummary: WeeklyComplianceSummary;
  historicalWeeks: WeeklyComplianceSummary[];
  allWeeks: WeeklyComplianceSummary[];
} {
  const today = referenceDateStr || getTodayDateString();
  const currentWeekRange = getWeekRangeForDate(today);

  // Group all activities by Monday week_start
  const weekMap = new Map<string, { weekStart: string; weekEnd: string; activities: Activity[] }>();

  // Ensure current week exists in map even if 0 activities
  weekMap.set(currentWeekRange.weekStart, {
    weekStart: currentWeekRange.weekStart,
    weekEnd: currentWeekRange.weekEnd,
    activities: [],
  });

  for (const act of activities) {
    const range = getWeekRangeForDate(act.activity_date);
    if (!weekMap.has(range.weekStart)) {
      weekMap.set(range.weekStart, {
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
        activities: [],
      });
    }
    weekMap.get(range.weekStart)!.activities.push(act);
  }

  // Sort weeks chronologically ascending (earliest Monday first) to properly evaluate DP1 first-violation
  const sortedWeekStarts = Array.from(weekMap.keys()).sort();

  let firstViolationWeekStart: string | null = null;
  const summariesByWeekStart = new Map<string, WeeklyComplianceSummary>();

  for (const wStart of sortedWeekStarts) {
    const { weekEnd, activities: weekActs } = weekMap.get(wStart)!;
    const weekRange = getWeekRangeForDate(wStart);

    let totalCo2 = 0;
    let everydayCo2 = 0;
    let travelCo2 = 0;

    for (const a of weekActs) {
      const co2 = Number(a.co2_kg) || 0;
      totalCo2 += co2;
      if (a.activity_type === 'flight') {
        travelCo2 += co2;
      } else {
        everydayCo2 += co2;
      }
    }

    totalCo2 = Math.round((totalCo2 + Number.EPSILON) * 100) / 100;
    everydayCo2 = Math.round((everydayCo2 + Number.EPSILON) * 100) / 100;
    travelCo2 = Math.round((travelCo2 + Number.EPSILON) * 100) / 100;

    const { status, statusColor, isExceeded } = evaluateComplianceStatus(totalCo2, GOVERNMENT_WEEKLY_THRESHOLD);

    let isFirstViolation = false;
    let feeAmount = 0;
    let feeStatusLabel = 'Compliant (₹0)';

    if (isExceeded) {
      if (!firstViolationWeekStart) {
        // This is the chronological first ever violation!
        firstViolationWeekStart = wStart;
        isFirstViolation = true;
        feeAmount = 0;
        feeStatusLabel = 'First violation — reminder issued (₹0)';
      } else if (firstViolationWeekStart === wStart) {
        // Same week
        isFirstViolation = true;
        feeAmount = 0;
        feeStatusLabel = 'First violation — reminder issued (₹0)';
      } else {
        // Subsequent violation
        isFirstViolation = false;
        feeAmount = CARBON_COMPLIANCE_FEE; // ₹10
        feeStatusLabel = 'Subsequent violation — Carbon Compliance Fee (₹10)';
      }
    }

    const percentageUsed = Math.round((totalCo2 / GOVERNMENT_WEEKLY_THRESHOLD) * 1000) / 10;
    const remainingCo2 = Math.max(0, Math.round((GOVERNMENT_WEEKLY_THRESHOLD - totalCo2 + Number.EPSILON) * 100) / 100);
    const isCurrentWeek = wStart === currentWeekRange.weekStart;

    const summary: WeeklyComplianceSummary = {
      weekStart: wStart,
      weekEnd,
      weekLabel: weekRange.label,
      isCurrentWeek,
      totalCo2,
      everydayCo2,
      travelCo2,
      governmentThreshold: GOVERNMENT_WEEKLY_THRESHOLD,
      personalTarget,
      percentageUsed,
      remainingCo2,
      status,
      statusColor,
      isExceeded,
      isFirstViolation,
      feeAmount,
      feeStatusLabel,
      activitiesCount: weekActs.length,
    };

    summariesByWeekStart.set(wStart, summary);
  }

  // Get current week summary
  const currentWeekSummary = summariesByWeekStart.get(currentWeekRange.weekStart)!;

  // Build descending chronological list of historical weeks (excluding or including current)
  const allWeeksDescending = Array.from(summariesByWeekStart.values()).sort(
    (a, b) => b.weekStart.localeCompare(a.weekStart)
  );

  const historicalWeeks = allWeeksDescending.filter((w) => !w.isCurrentWeek);

  return {
    currentWeekSummary,
    historicalWeeks,
    allWeeks: allWeeksDescending,
  };
}

/**
 * Generates deterministic citizen insights from their real data.
 */
export function generateDeterministicInsights(
  currentWeek: WeeklyComplianceSummary,
  categories: CategoryBreakdownItem[],
  travel: MonthlyTravelAllowance
): DeterministicInsight[] {
  const insights: DeterministicInsight[] = [];

  // 1. Largest emission category this week
  const sortedCategories = [...categories].sort((a, b) => b.co2_kg - a.co2_kg);
  if (sortedCategories[0] && sortedCategories[0].co2_kg > 0) {
    insights.push({
      id: 'largest-category',
      type: 'info',
      title: `${sortedCategories[0].label.split(' ')[0]} is your largest emission category`,
      message: `${sortedCategories[0].label} accounts for ${formatCo2(sortedCategories[0].co2_kg)} kg CO₂ (${sortedCategories[0].percentage}%) of your emissions this week.`,
    });
  }

  // 2. Headroom or threshold alert
  if (currentWeek.isExceeded) {
    insights.push({
      id: 'threshold-exceeded',
      type: 'alert',
      title: 'Government weekly threshold exceeded',
      message: currentWeek.isFirstViolation
        ? `You have reached ${formatCo2(currentWeek.totalCo2)} kg CO₂ this week. As this is your first recorded threshold exceedance, a compliance reminder has been issued at ₹0 fee.`
        : `Your weekly footprint is ${formatCo2(currentWeek.totalCo2)} kg CO₂, which exceeds the 100 kg threshold. A ₹10 Carbon Compliance Fee has been applied.`,
    });
  } else if (currentWeek.percentageUsed >= 70) {
    insights.push({
      id: 'headroom-warning',
      type: 'warning',
      title: 'Approaching government threshold',
      message: `You have ${formatCo2(currentWeek.remainingCo2)} kg CO₂ remaining before reaching the 100 kg government compliance threshold this week.`,
    });
  } else {
    insights.push({
      id: 'headroom-good',
      type: 'success',
      title: 'Excellent compliance standing',
      message: `You have used ${currentWeek.percentageUsed}% of your 100 kg weekly allowance with ${formatCo2(currentWeek.remainingCo2)} kg CO₂ remaining.`,
    });
  }

  // 3. Travel allowance insight
  if (travel.travelCo2 > 0) {
    insights.push({
      id: 'travel-insight',
      type: travel.isExceeded ? 'alert' : 'info',
      title: travel.isExceeded ? 'Monthly travel allowance exceeded' : 'Travel allowance tracking',
      message: travel.isExceeded
        ? `You have logged ${formatCo2(travel.travelCo2)} kg in flight emissions this month, exceeding the 200 kg fair travel allowance.`
        : `Your flight emissions account for ${formatCo2(travel.travelCo2)} kg of your ${travel.allowanceLimit} kg monthly travel allowance (${travel.percentageUsed}% used).`,
    });
  }

  // 4. Personal target comparison
  if (currentWeek.personalTarget !== currentWeek.governmentThreshold) {
    const diff = currentWeek.totalCo2 - currentWeek.personalTarget;
    if (diff > 0 && !currentWeek.isExceeded) {
      insights.push({
        id: 'personal-target-exceeded',
        type: 'warning',
        title: 'Personal target exceeded while government compliant',
        message: `You exceeded your personal goal of ${formatCo2(currentWeek.personalTarget)} kg CO₂ by ${formatCo2(diff)} kg, but remain fully compliant under the 100 kg government threshold.`,
      });
    }
  }

  return insights;
}

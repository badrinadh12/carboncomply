import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  computeAllWeeklySummaries,
  computeCategoryBreakdown,
  computeMonthlyTravelAllowance,
  generateDeterministicInsights,
} from '@/lib/complianceEngine';
import { getTodayDateString } from '@/lib/dateUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceDate = searchParams.get('date') || getTodayDateString();

    const [activities, settings] = await Promise.all([
      db.getActivities(),
      db.getSettings(),
    ]);

    const { currentWeekSummary, historicalWeeks, allWeeks } = computeAllWeeklySummaries(
      activities,
      settings.personal_weekly_target,
      referenceDate
    );

    // Current week's activities for category breakdown
    const currentWeekActivities = activities.filter(
      (a) => a.activity_date >= currentWeekSummary.weekStart && a.activity_date <= currentWeekSummary.weekEnd
    );

    const categories = computeCategoryBreakdown(currentWeekActivities);
    const travelAllowance = computeMonthlyTravelAllowance(activities);
    const insights = generateDeterministicInsights(currentWeekSummary, categories, travelAllowance);

    // Aggregate statistics for Government Overview
    const totalAllCo2 = activities.reduce((sum, a) => sum + (Number(a.co2_kg) || 0), 0);
    const totalFlightCo2 = activities
      .filter((a) => a.activity_type === 'flight')
      .reduce((sum, a) => sum + (Number(a.co2_kg) || 0), 0);
    const totalViolations = allWeeks.filter((w) => w.isExceeded).length;
    const totalFees = allWeeks.reduce((sum, w) => sum + w.feeAmount, 0);

    return NextResponse.json({
      success: true,
      currentWeek: currentWeekSummary,
      historicalWeeks,
      allWeeks,
      categories,
      travelAllowance,
      insights,
      userSettings: settings,
      aggregateStats: {
        totalRecordedActivities: activities.length,
        totalAllCo2: Math.round((totalAllCo2 + Number.EPSILON) * 100) / 100,
        totalFlightCo2: Math.round((totalFlightCo2 + Number.EPSILON) * 100) / 100,
        totalWeeksRecorded: allWeeks.length,
        totalViolations,
        totalFeesAccrued: totalFees,
      },
    });
  } catch (error: any) {
    console.error('Error calculating compliance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute compliance metrics.' },
      { status: 500 }
    );
  }
}

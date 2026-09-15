import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateCo2, ACTIVITY_DEFINITIONS } from '@/lib/calculations';
import { getTodayDateString, getWeekRangeForDate, parseDateString, formatDateString } from '@/lib/dateUtils';
import { Activity } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'seed';

    if (action === 'reset') {
      await db.resetData();
      return NextResponse.json({
        success: true,
        message: 'All citizen activities and records successfully reset.',
      });
    }

    // Prepare demo activities
    const todayStr = getTodayDateString();
    const todayDate = parseDateString(todayStr);

    // Current Monday-Sunday range
    const curRange = getWeekRangeForDate(todayStr);
    const curMonday = parseDateString(curRange.weekStart);

    // Date 1: Monday of current week
    const dateCurMon = curRange.weekStart;

    // Date 2: Tuesday of current week (or Monday + 1)
    const dCurTue = new Date(curMonday);
    dCurTue.setUTCDate(curMonday.getUTCDate() + 1);
    const dateCurTue = formatDateString(dCurTue);

    // Past Week 1: 2 weeks ago (Monday) -> Exceeded Week 1 (First violation: ₹0 reminder)
    const dPast1 = new Date(curMonday);
    dPast1.setUTCDate(curMonday.getUTCDate() - 14);
    const datePast1Mon = formatDateString(dPast1);
    const dPast1Tue = new Date(dPast1);
    dPast1Tue.setUTCDate(dPast1.getUTCDate() + 1);
    const datePast1Tue = formatDateString(dPast1Tue);

    // Past Week 2: 1 week ago (Monday) -> Compliant Week (₹0)
    const dPast2 = new Date(curMonday);
    dPast2.setUTCDate(curMonday.getUTCDate() - 7);
    const datePast2Mon = formatDateString(dPast2);

    const demoActivities: Omit<Activity, 'id' | 'created_at'>[] = [
      // 2 Weeks ago: Exceeding 100 kg (First Violation -> ₹0 Reminder)
      {
        activity_type: 'flight',
        quantity: 360, // 360 * 0.25 = 90.00 kg
        unit: 'km',
        emission_factor: 0.25,
        co2_kg: calculateCo2(360, 0.25),
        activity_date: datePast1Mon,
      },
      {
        activity_type: 'electricity',
        quantity: 40, // 40 * 0.80 = 32.00 kg (Total: 122.00 kg > 100 kg)
        unit: 'kWh',
        emission_factor: 0.80,
        co2_kg: calculateCo2(40, 0.80),
        activity_date: datePast1Tue,
      },

      // 1 Week ago: Compliant (64.00 kg < 100 kg)
      {
        activity_type: 'car',
        quantity: 120, // 120 * 0.20 = 24.00 kg
        unit: 'km',
        emission_factor: 0.20,
        co2_kg: calculateCo2(120, 0.20),
        activity_date: datePast2Mon,
      },
      {
        activity_type: 'electricity',
        quantity: 50, // 50 * 0.80 = 40.00 kg (Total: 64.00 kg)
        unit: 'kWh',
        emission_factor: 0.80,
        co2_kg: calculateCo2(50, 0.80),
        activity_date: datePast2Mon,
      },

      // Current Week Activities:
      {
        activity_type: 'car',
        quantity: 50, // 50 * 0.20 = 10.00 kg
        unit: 'km',
        emission_factor: 0.20,
        co2_kg: calculateCo2(50, 0.20),
        activity_date: dateCurMon,
      },
      {
        activity_type: 'electricity',
        quantity: 45, // 45 * 0.80 = 36.00 kg
        unit: 'kWh',
        emission_factor: 0.80,
        co2_kg: calculateCo2(45, 0.80),
        activity_date: dateCurTue,
      },
      {
        activity_type: 'flight',
        quantity: 80, // 80 * 0.25 = 20.00 kg (Travel)
        unit: 'km',
        emission_factor: 0.25,
        co2_kg: calculateCo2(80, 0.25),
        activity_date: todayStr,
      },
      {
        activity_type: 'non_veg_meal',
        quantity: 2, // 2 * 2.0 = 4.00 kg
        unit: 'meals',
        emission_factor: 2.00,
        co2_kg: calculateCo2(2, 2.00),
        activity_date: todayStr,
      },
      {
        activity_type: 'veg_meal',
        quantity: 4, // 4 * 0.5 = 2.00 kg
        unit: 'meals',
        emission_factor: 0.50,
        co2_kg: calculateCo2(4, 0.50),
        activity_date: todayStr,
      },
    ];

    await db.resetData();
    const seeded = await db.seedDemoData(demoActivities);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seeded.length} realistic activities demonstrating compliance weeks, ₹0 first violation, travel allowance, and current footprint.`,
      activities: seeded,
    });
  } catch (error: any) {
    console.error('Error in demo-seed route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed demo data.' },
      { status: 500 }
    );
  }
}

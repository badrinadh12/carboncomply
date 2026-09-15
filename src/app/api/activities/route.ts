import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ActivityType } from '@/lib/types';
import { ACTIVITY_DEFINITIONS, calculateCo2 } from '@/lib/calculations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const activities = await db.getActivities({
      type,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve logged activities. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activity_type, quantity, activity_date } = body;

    // Validation
    if (!activity_type || !ACTIVITY_DEFINITIONS[activity_type as ActivityType]) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity type specified.' },
        { status: 400 }
      );
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive number greater than 0.' },
        { status: 400 }
      );
    }

    if (!activity_date || !/^\d{4}-\d{2}-\d{2}$/.test(activity_date)) {
      return NextResponse.json(
        { success: false, error: 'A valid activity date (YYYY-MM-DD) is required.' },
        { status: 400 }
      );
    }

    const def = ACTIVITY_DEFINITIONS[activity_type as ActivityType];
    const co2_kg = calculateCo2(numQuantity, def.emissionFactor);

    const created = await db.createActivity({
      activity_type: activity_type as ActivityType,
      quantity: numQuantity,
      unit: def.unit,
      emission_factor: def.emissionFactor,
      co2_kg,
      activity_date, // Strictly persistent YYYY-MM-DD
    });

    return NextResponse.json({
      success: true,
      activity: created,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to save activity record to the database.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.getSettings();
    return NextResponse.json({
      success: true,
      settings,
      governmentThreshold: 100.00, // Explicitly fixed and immutable
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve settings.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personal_weekly_target } = body;

    const targetNum = Number(personal_weekly_target);
    if (isNaN(targetNum) || targetNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Personal target must be a positive number greater than 0.' },
        { status: 400 }
      );
    }

    const updated = await db.updateSettings(targetNum);
    return NextResponse.json({
      success: true,
      settings: updated,
      governmentThreshold: 100.00,
      message: 'Personal target successfully updated. (Government threshold remains locked at 100 kg).',
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update personal target.' },
      { status: 500 }
    );
  }
}

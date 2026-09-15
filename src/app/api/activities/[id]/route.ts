import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Activity ID is required.' }, { status: 400 });
    }

    const deleted = await db.deleteActivity(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Activity not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Activity deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity from database.' },
      { status: 500 }
    );
  }
}

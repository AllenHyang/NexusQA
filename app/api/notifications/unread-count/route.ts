import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/unread-count
// Get unread notification count for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 });
  }
}

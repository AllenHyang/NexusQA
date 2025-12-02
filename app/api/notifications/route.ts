import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications
// Get notifications for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: { userId: string; isRead?: boolean } = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [rawNotifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    // Fetch project IDs for notifications with requirementId
    const requirementIds = rawNotifications
      .filter(n => n.requirementId)
      .map(n => n.requirementId as string);

    let requirementProjectMap: Record<string, string> = {};
    if (requirementIds.length > 0) {
      const requirements = await prisma.internalRequirement.findMany({
        where: { id: { in: requirementIds } },
        select: { id: true, projectId: true },
      });
      requirementProjectMap = requirements.reduce((acc, r) => {
        acc[r.id] = r.projectId;
        return acc;
      }, {} as Record<string, string>);
    }

    // Add projectId to notifications
    const notifications = rawNotifications.map(n => ({
      ...n,
      projectId: n.requirementId ? requirementProjectMap[n.requirementId] : null,
    }));

    return NextResponse.json({
      notifications,
      total,
      hasMore: offset + notifications.length < total,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

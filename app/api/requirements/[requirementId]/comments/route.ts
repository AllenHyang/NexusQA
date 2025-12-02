import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements/[requirementId]/comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  try {
    const { requirementId } = await params;
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic'); // BASIC_INFO or USER_STORY

    const comments = await prisma.requirementComment.findMany({
      where: {
        requirementId,
        ...(topic && { topic })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch Requirement Comments Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// Helper to escape special regex characters in a string
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper to find mentioned users by checking if @username exists in text
async function findMentionedUsers(text: string): Promise<{ id: string; name: string }[]> {
  // Get all users
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true }
  });

  // Check which users are mentioned in the text
  const mentionedUsers: { id: string; name: string }[] = [];
  for (const user of allUsers) {
    // Escape special regex characters in the username and check if @username exists
    const escapedName = escapeRegExp(user.name);
    const mentionPattern = new RegExp(`@${escapedName}(?:\\s|$|[^a-zA-Z0-9])`, 'i');
    if (mentionPattern.test(text)) {
      mentionedUsers.push(user);
    }
  }

  return mentionedUsers;
}

// POST /api/requirements/[requirementId]/comments
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  try {
    const { requirementId } = await params;
    const body = await request.json();
    const { content, userId, topic = "BASIC_INFO" } = body;

    if (!content || !userId) {
      return NextResponse.json({ error: "Content and User ID are required" }, { status: 400 });
    }

    // Verify requirement exists
    const requirement = await prisma.internalRequirement.findUnique({
      where: { id: requirementId }
    });

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    // Get sender info for notification content
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    const comment = await prisma.requirementComment.create({
      data: {
        content,
        requirementId,
        userId,
        topic
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Parse @mentions and create notifications using DB lookup
    const mentionedUsers = await findMentionedUsers(content);

    // Create notifications for each mentioned user (excluding sender)
    const notificationsData = mentionedUsers
      .filter((u) => u.id !== userId)
      .map((u) => ({
        type: 'MENTION',
        content: `${sender?.name || '用户'} 在评论中提到了你: "${content.length > 50 ? content.slice(0, 50) + '...' : content}"`,
        entityType: 'REQUIREMENT_COMMENT',
        entityId: comment.id,
        requirementId,
        userId: u.id,
        senderId: userId,
      }));

    // Create notifications one by one (SQLite doesn't support createMany properly)
    for (const notifData of notificationsData) {
      await prisma.notification.create({
        data: notifData
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Add Requirement Comment Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ requirementId: string; commentId: string }> };

// PUT /api/requirements/[requirementId]/comments/[commentId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const { requirementId, commentId } = await params;
    const body = await request.json();
    const { content, userId } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify comment exists and belongs to this requirement
    const existingComment = await prisma.requirementComment.findFirst({
      where: {
        id: commentId,
        requirementId
      }
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only allow the comment author to edit
    if (userId && existingComment.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to edit this comment" }, { status: 403 });
    }

    const updatedComment = await prisma.requirementComment.update({
      where: { id: commentId },
      data: { content },
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Update Requirement Comment Error:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// DELETE /api/requirements/[requirementId]/comments/[commentId]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { requirementId, commentId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Verify comment exists and belongs to this requirement
    const existingComment = await prisma.requirementComment.findFirst({
      where: {
        id: commentId,
        requirementId
      }
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only allow the comment author to delete
    if (userId && existingComment.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 });
    }

    await prisma.requirementComment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Requirement Comment Error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

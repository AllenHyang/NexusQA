import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements/[requirementId]/review - Get review history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  const { requirementId } = await params;

  try {
    const reviews = await prisma.requirementReview.findMany({
      where: { requirementId },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true, avatar: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/requirements/[requirementId]/review - Submit/Approve/Reject review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  const { requirementId } = await params;

  try {
    const body = await request.json();
    const { action, comment, reviewerId } = body;

    if (!action || !reviewerId) {
      return NextResponse.json(
        { error: "action and reviewerId are required" },
        { status: 400 }
      );
    }

    // Get current requirement
    const requirement = await prisma.internalRequirement.findUnique({
      where: { id: requirementId }
    });

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    // Determine new status based on action
    let newStatus: string;
    const fromStatus = requirement.status;

    switch (action) {
      case 'SUBMIT':
        // Author submits for review
        if (requirement.status !== 'DRAFT') {
          return NextResponse.json(
            { error: "只有草稿状态的需求可以提交评审" },
            { status: 400 }
          );
        }
        newStatus = 'PENDING_REVIEW';
        break;

      case 'APPROVE':
        // Reviewer approves
        if (requirement.status !== 'PENDING_REVIEW') {
          return NextResponse.json(
            { error: "只有待评审状态的需求可以批准" },
            { status: 400 }
          );
        }
        newStatus = 'APPROVED';
        break;

      case 'REJECT':
        // Reviewer rejects - back to draft
        if (requirement.status !== 'PENDING_REVIEW') {
          return NextResponse.json(
            { error: "只有待评审状态的需求可以拒绝" },
            { status: 400 }
          );
        }
        if (!comment || !comment.trim()) {
          return NextResponse.json(
            { error: "拒绝时必须填写评审意见" },
            { status: 400 }
          );
        }
        newStatus = 'DRAFT';
        break;

      case 'REQUEST_CHANGES':
        // Reviewer requests changes - back to draft
        if (requirement.status !== 'PENDING_REVIEW') {
          return NextResponse.json(
            { error: "只有待评审状态的需求可以要求修改" },
            { status: 400 }
          );
        }
        if (!comment || !comment.trim()) {
          return NextResponse.json(
            { error: "要求修改时必须填写评审意见" },
            { status: 400 }
          );
        }
        newStatus = 'DRAFT';
        break;

      case 'START':
        // Start implementation
        if (requirement.status !== 'APPROVED') {
          return NextResponse.json(
            { error: "只有已批准的需求可以开始实现" },
            { status: 400 }
          );
        }
        newStatus = 'IN_PROGRESS';
        break;

      case 'COMPLETE':
        // Mark as completed
        if (requirement.status !== 'IN_PROGRESS') {
          return NextResponse.json(
            { error: "只有进行中的需求可以标记完成" },
            { status: 400 }
          );
        }
        newStatus = 'COMPLETED';
        break;

      case 'REOPEN':
        // Reopen for changes
        if (!['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(requirement.status)) {
          return NextResponse.json(
            { error: "无法重新打开此状态的需求" },
            { status: 400 }
          );
        }
        newStatus = 'DRAFT';
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Create review record and update requirement in transaction
    const [review, updatedRequirement] = await prisma.$transaction([
      prisma.requirementReview.create({
        data: {
          action,
          comment: comment || null,
          fromStatus,
          toStatus: newStatus,
          requirementId,
          reviewerId
        },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true, avatar: true, role: true }
          }
        }
      }),
      prisma.internalRequirement.update({
        where: { id: requirementId },
        data: {
          status: newStatus,
          reviewerId: action === 'APPROVE' || action === 'REJECT' || action === 'REQUEST_CHANGES'
            ? reviewerId
            : requirement.reviewerId,
          reviewedAt: action === 'APPROVE' || action === 'REJECT' || action === 'REQUEST_CHANGES'
            ? new Date()
            : requirement.reviewedAt,
          reviewNotes: action === 'APPROVE' || action === 'REJECT' || action === 'REQUEST_CHANGES'
            ? comment
            : requirement.reviewNotes
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          testCases: {
            select: { id: true, title: true, status: true, priority: true }
          },
          reviews: {
            include: {
              reviewer: {
                select: { id: true, name: true, email: true, avatar: true, role: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
    ]);

    return NextResponse.json({
      review,
      requirement: updatedRequirement
    });
  } catch (error) {
    console.error("Failed to process review:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}

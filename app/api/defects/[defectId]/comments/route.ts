import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ defectId: string }> }
) {
  try {
    const { defectId } = await params;
    
    const comments = await prisma.defectComment.findMany({
      where: { defectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ defectId: string }> }
) {
  try {
    const { defectId } = await params;
    const body = await request.json();
    const { content, userId } = body;

    if (!content || !userId) {
        return NextResponse.json({ error: "Content and User ID are required" }, { status: 400 });
    }

    const comment = await prisma.defectComment.create({
      data: {
        content,
        defectId,
        userId
      },
      include: {
        user: {
            select: {
                id: true,
                name: true,
                avatar: true
            }
        }
      }
    });
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Add Comment Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

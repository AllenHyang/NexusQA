import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const plans = await prisma.testPlan.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { runs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(plans);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: "Plan name is required" }, { status: 400 });
    }

    const newPlan = await prisma.testPlan.create({
      data: {
        name: body.name,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: "PLANNED",
        projectId: projectId
      }
    });
    return NextResponse.json(newPlan, { status: 201 });
  } catch (e) {
    console.error("Error creating test plan:", e);
    return NextResponse.json({ error: "Failed to create test plan" }, { status: 500 });
  }
}

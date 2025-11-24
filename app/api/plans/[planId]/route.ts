import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const plan = await prisma.testPlan.findUnique({
      where: { id: planId },
      include: {
        runs: {
          include: {
            testCase: true
          }
        },
        _count: {
            select: { runs: true }
        }
      }
    });
    
    if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(plan);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ planId: string }> }) {
    try {
        const { planId } = await params;
        const body = await request.json();

        const updatedPlan = await prisma.testPlan.update({
            where: { id: planId },
            data: {
                name: body.name,
                description: body.description,
                status: body.status,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
            }
        });
        return NextResponse.json(updatedPlan);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ planId: string }> }) {
    try {
        const { planId } = await params;
        await prisma.testPlan.delete({
            where: { id: planId }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
    }
}

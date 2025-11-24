import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ runId: string }> }) {
    try {
        const { runId } = await params;
        const body = await request.json();
        
        // body: { status, notes, executedBy }

        const updatedRun = await prisma.testRun.update({
            where: { id: runId },
            data: {
                status: body.status,
                notes: body.notes,
                executedBy: body.executedBy,
                executedAt: new Date() // Auto update timestamp
            }
        });

        return NextResponse.json(updatedRun);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update run" }, { status: 500 });
    }
}

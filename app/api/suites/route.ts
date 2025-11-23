import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    try {
        const where = projectId ? { projectId } : {};
        const suites = await prisma.testSuite.findMany({ where });
        return NextResponse.json(suites);
    } catch (error: unknown) {
        console.error("Suite API GET Error:", String(error));
        return NextResponse.json({ error: "Failed to fetch suites" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newSuite = await prisma.testSuite.create({
            data: {
                name: body.name,
                projectId: body.projectId,
                parentId: body.parentId
            }
        });
        return NextResponse.json(newSuite);
    } catch (error: unknown) {
        console.error("Suite API POST Error:", String(error));
        return NextResponse.json({ error: "Failed to create suite" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const updatedSuite = await prisma.testSuite.update({
            where: { id: body.id },
            data: { name: body.name }
        });
        return NextResponse.json(updatedSuite);
    } catch (error: unknown) {
        console.error("Suite API PUT Error:", String(error));
        return NextResponse.json({ error: "Failed to update suite" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    try {
        await prisma.testSuite.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Suite API DELETE Error:", String(error));
        return NextResponse.json({ error: "Failed to delete suite" }, { status: 500 });
    }
}
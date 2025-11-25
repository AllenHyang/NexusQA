import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    const defects = await prisma.defect.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(defects);
  } catch {
    return NextResponse.json({ error: "Failed to fetch defects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.id) {
        // Update
        const updated = await prisma.defect.update({
            where: { id: body.id },
            data: {
                title: body.title,
                description: body.description,
                status: body.status,
                severity: body.severity,
                assigneeId: body.assigneeId,
                externalIssueId: body.externalIssueId,
                externalUrl: body.externalUrl
            }
        });
        return NextResponse.json(updated);
    } else {
        // Create
        const created = await prisma.defect.create({
            data: {
                title: body.title,
                description: body.description,
                status: body.status || "OPEN",
                severity: body.severity || "MEDIUM",
                projectId: body.projectId,
                authorId: body.authorId,
                assigneeId: body.assigneeId,
                externalIssueId: body.externalIssueId,
                externalUrl: body.externalUrl
            }
        });
        return NextResponse.json(created);
    }
  } catch (error: unknown) {
    console.error("Defect Save Error:", error);
    return NextResponse.json({ error: "Failed to save defect" }, { status: 500 });
  }
}

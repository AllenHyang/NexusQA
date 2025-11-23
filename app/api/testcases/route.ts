import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  try {
      const where = projectId ? { projectId } : {};
      const testCases = await prisma.testCase.findMany({
          where,
          orderBy: { createdAt: 'desc' }
      });
      
      // Parse JSON fields for frontend
      const parsedCases = testCases.map(tc => ({
          ...tc,
          steps: JSON.parse(tc.steps as string),
          history: JSON.parse(tc.history as string)
      }));
      
      return NextResponse.json(parsedCases);
  } catch (e) {
      return NextResponse.json({ error: "Failed to fetch test cases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
      const body = await request.json();
      
      const payload = {
          title: body.title,
          description: body.description,
          status: body.status || "UNTESTED",
          priority: body.priority || "P2",
          projectId: body.projectId,
          suiteId: body.suiteId,
          visualReference: body.visualReference,
          // Ensure JSON string
          steps: JSON.stringify(body.steps || []),
          history: JSON.stringify(body.history || [])
      };

      if (body.id) {
          // Update
          const updated = await prisma.testCase.update({
              where: { id: body.id },
              data: payload
          });
          return NextResponse.json({
              ...updated,
              steps: JSON.parse(updated.steps as string),
              history: JSON.parse(updated.history as string)
          });
      } else {
          // Create
          const created = await prisma.testCase.create({
              data: payload
          });
          return NextResponse.json({
              ...created,
              steps: JSON.parse(created.steps as string),
              history: JSON.parse(created.history as string)
          }, { status: 201 });
      }
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Failed to save test case" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    // Bulk Update Handler
    try {
        const body = await request.json();
        const { ids, updates } = body;
        
        // Prisma updateMany
        await prisma.testCase.updateMany({
            where: { id: { in: ids } },
            data: updates
        });
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to bulk update" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids'); // Comma separated

    try {
        if (id) {
            await prisma.testCase.delete({ where: { id } });
        } else if (ids) {
            const idList = ids.split(',');
            await prisma.testCase.deleteMany({ where: { id: { in: idList } } });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete test case" }, { status: 500 });
    }
}
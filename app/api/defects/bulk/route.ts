import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsString = searchParams.get('ids');

  if (!idsString) {
    return NextResponse.json({ error: "IDs are required" }, { status: 400 });
  }

  const ids = idsString.split(',');

  try {
    await prisma.defect.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete defects" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs array is required" }, { status: 400 });
    }

    if (!updates) {
        return NextResponse.json({ error: "Updates object is required" }, { status: 400 });
    }

    await prisma.defect.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: updates
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk Update Error:", error);
    return NextResponse.json({ error: "Failed to update defects" }, { status: 500 });
  }
}

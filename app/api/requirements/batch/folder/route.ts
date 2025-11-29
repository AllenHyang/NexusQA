import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/requirements/batch/folder
// Batch move requirements to a folder
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { requirementIds, folderId } = body;

    if (!requirementIds || !Array.isArray(requirementIds) || requirementIds.length === 0) {
      return NextResponse.json({ error: "requirementIds array is required" }, { status: 400 });
    }

    // Verify folder exists if folderId is provided
    if (folderId) {
      const folder = await prisma.requirementFolder.findUnique({
        where: { id: folderId }
      });
      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    // Get current max order in target folder
    const maxOrder = await prisma.internalRequirement.aggregate({
      where: { folderId: folderId || null },
      _max: { order: true }
    });

    let currentOrder = (maxOrder._max.order || 0) + 1;

    // Update all requirements
    await prisma.$transaction(
      requirementIds.map((id: string) =>
        prisma.internalRequirement.update({
          where: { id },
          data: {
            folderId: folderId || null,
            order: currentOrder++
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      movedCount: requirementIds.length,
      folderId: folderId || null
    });
  } catch (error) {
    console.error("Failed to batch move requirements:", error);
    return NextResponse.json({ error: "Failed to batch move requirements" }, { status: 500 });
  }
}

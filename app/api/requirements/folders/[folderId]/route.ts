import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements/folders/[folderId]
// Get a single folder with its requirements
export async function GET(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;

    const folder = await prisma.requirementFolder.findUnique({
      where: { id: folderId },
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          include: {
            _count: { select: { requirements: true, children: true } }
          }
        },
        requirements: {
          orderBy: [{ order: 'asc' }, { title: 'asc' }],
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        _count: {
          select: { requirements: true, children: true }
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Failed to fetch folder:", error);
    return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
  }
}

// PUT /api/requirements/folders/[folderId]
// Update a folder
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const body = await request.json();
    const { name, description, type, parentId, order } = body;

    // Check for circular reference if parentId is being changed
    if (parentId !== undefined) {
      // Cannot set parent to self
      if (parentId === folderId) {
        return NextResponse.json({ error: "Cannot set folder as its own parent" }, { status: 400 });
      }

      // Check if new parent is a descendant of this folder (would create cycle)
      if (parentId) {
        const isDescendant = await checkIsDescendant(folderId, parentId);
        if (isDescendant) {
          return NextResponse.json({ error: "Cannot move folder to its own descendant" }, { status: 400 });
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (order !== undefined) updateData.order = order;

    const updated = await prisma.requirementFolder.update({
      where: { id: folderId },
      data: updateData,
      include: {
        _count: { select: { requirements: true, children: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

// DELETE /api/requirements/folders/[folderId]
// Delete a folder (moves requirements and children to parent or root)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const { searchParams } = new URL(request.url);
    const cascade = searchParams.get('cascade') === 'true';

    const folder = await prisma.requirementFolder.findUnique({
      where: { id: folderId },
      include: {
        children: true,
        requirements: true
      }
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (cascade) {
      // Cascade delete: delete folder and all descendants
      await deleteRecursive(folderId);
    } else {
      // Move children to parent folder, but requirements to uncategorized (null)
      await prisma.$transaction([
        // Move child folders to parent
        prisma.requirementFolder.updateMany({
          where: { parentId: folderId },
          data: { parentId: folder.parentId }
        }),
        // Move requirements to uncategorized (folderId = null)
        prisma.internalRequirement.updateMany({
          where: { folderId },
          data: { folderId: null }
        }),
        // Delete the folder
        prisma.requirementFolder.delete({
          where: { id: folderId }
        })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

// PATCH /api/requirements/folders/[folderId]
// Partial update (e.g., reorder, move)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const body = await request.json();

    // Handle move operation
    if (body.action === 'move') {
      const { parentId, order } = body;

      // Check for circular reference
      if (parentId === folderId) {
        return NextResponse.json({ error: "Cannot set folder as its own parent" }, { status: 400 });
      }

      if (parentId) {
        const isDescendant = await checkIsDescendant(folderId, parentId);
        if (isDescendant) {
          return NextResponse.json({ error: "Cannot move folder to its own descendant" }, { status: 400 });
        }
      }

      const updated = await prisma.requirementFolder.update({
        where: { id: folderId },
        data: {
          parentId: parentId || null,
          order: order ?? 0
        },
        include: {
          _count: { select: { requirements: true, children: true } }
        }
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid PATCH action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to patch folder:", error);
    return NextResponse.json({ error: "Failed to patch folder" }, { status: 500 });
  }
}

// Helper: Check if targetId is a descendant of folderId
async function checkIsDescendant(folderId: string, targetId: string): Promise<boolean> {
  const target = await prisma.requirementFolder.findUnique({
    where: { id: targetId },
    select: { parentId: true }
  });

  if (!target) return false;
  if (!target.parentId) return false;
  if (target.parentId === folderId) return true;

  return checkIsDescendant(folderId, target.parentId);
}

// Helper: Recursively delete folder and all descendants
async function deleteRecursive(folderId: string): Promise<void> {
  const children = await prisma.requirementFolder.findMany({
    where: { parentId: folderId },
    select: { id: true }
  });

  // Recursively delete children
  for (const child of children) {
    await deleteRecursive(child.id);
  }

  // Delete requirements in this folder (optional: or set folderId to null)
  await prisma.internalRequirement.deleteMany({
    where: { folderId }
  });

  // Delete the folder
  await prisma.requirementFolder.delete({
    where: { id: folderId }
  });
}

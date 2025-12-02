import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to parse tags from string/array
function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// PUT /api/requirements/tags - Rename a tag across all requirements
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { projectId, oldTag, newTag } = body;

    if (!projectId || !oldTag || !newTag) {
      return NextResponse.json(
        { error: "projectId, oldTag, and newTag are required" },
        { status: 400 }
      );
    }

    if (oldTag === newTag) {
      return NextResponse.json({ message: "Tags are the same", updated: 0 });
    }

    // Find all requirements with the old tag
    const requirements = await prisma.internalRequirement.findMany({
      where: { projectId },
      select: { id: true, tags: true },
    });

    // Filter requirements that have the old tag and update
    let updatedCount = 0;
    for (const req of requirements) {
      const tags = parseTags(req.tags);
      const oldTagIndex = tags.indexOf(oldTag);

      if (oldTagIndex !== -1) {
        // Check if new tag already exists
        const newTagIndex = tags.indexOf(newTag);
        if (newTagIndex !== -1) {
          // New tag exists, just remove old tag
          tags.splice(oldTagIndex, 1);
        } else {
          // Replace old tag with new tag
          tags[oldTagIndex] = newTag;
        }

        await prisma.internalRequirement.update({
          where: { id: req.id },
          data: { tags: JSON.stringify(tags) },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: `Tag renamed successfully`,
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Failed to rename tag:", error);
    return NextResponse.json(
      { error: "Failed to rename tag" },
      { status: 500 }
    );
  }
}

// DELETE /api/requirements/tags - Delete a tag from all requirements
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const tag = searchParams.get('tag');

    if (!projectId || !tag) {
      return NextResponse.json(
        { error: "projectId and tag are required" },
        { status: 400 }
      );
    }

    // Find all requirements with this tag
    const requirements = await prisma.internalRequirement.findMany({
      where: { projectId },
      select: { id: true, tags: true },
    });

    // Filter requirements that have this tag and remove it
    let updatedCount = 0;
    for (const req of requirements) {
      const tags = parseTags(req.tags);
      const tagIndex = tags.indexOf(tag);

      if (tagIndex !== -1) {
        tags.splice(tagIndex, 1);
        await prisma.internalRequirement.update({
          where: { id: req.id },
          data: { tags: JSON.stringify(tags) },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: `Tag deleted successfully`,
      updated: updatedCount,
    });
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}

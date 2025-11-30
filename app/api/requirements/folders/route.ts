import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requirements/folders?projectId=xxx
// Returns folder tree structure for a project
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Get all folders for the project with their requirements count
    const folders = await prisma.requirementFolder.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { requirements: true, children: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Build tree structure
    const folderMap = new Map();
    const rootFolders: typeof folders = [];

    // First pass: create map
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Second pass: build tree
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id);
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId).children.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    // Get count of requirements without folder (uncategorized)
    const uncategorizedCount = await prisma.internalRequirement.count({
      where: { projectId, folderId: null }
    });

    // Get total count of all requirements in the project
    const totalRequirementsCount = await prisma.internalRequirement.count({
      where: { projectId }
    });

    return NextResponse.json({
      folders: rootFolders,
      rootRequirementsCount: totalRequirementsCount, // "全部需求" should show total count
      uncategorizedCount // Count of requirements without folder
    });
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

// POST /api/requirements/folders
// Create a new folder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, type, parentId, projectId } = body;

    if (!name || !projectId) {
      return NextResponse.json({ error: "name and projectId are required" }, { status: 400 });
    }

    // Get max order for siblings
    const maxOrder = await prisma.requirementFolder.aggregate({
      where: { projectId, parentId: parentId || null },
      _max: { order: true }
    });

    const folder = await prisma.requirementFolder.create({
      data: {
        name,
        description: description || null,
        type: type || 'FOLDER',
        parentId: parentId || null,
        projectId,
        order: (maxOrder._max.order || 0) + 1
      },
      include: {
        _count: {
          select: { requirements: true, children: true }
        }
      }
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Failed to create folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

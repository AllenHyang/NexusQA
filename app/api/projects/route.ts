import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        coverImage: body.coverImage,
        repositoryUrl: body.repositoryUrl,
      }
    });
    return NextResponse.json(newProject, { status: 201 });
  } catch (e) {
    console.error("Error creating project:", e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ error: "Project ID and name are required" }, { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        coverImage: body.coverImage,
        repositoryUrl: body.repositoryUrl,
      }
    });
    return NextResponse.json(updatedProject);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to read projects
const readProjects = () => {
  if (!fs.existsSync(PROJECTS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
  return JSON.parse(data);
};

// Helper to write projects
const writeProjects = (projects: any[]) => {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
};

export async function GET() {
  const projects = readProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const projects = readProjects();
  const newProject = {
    ...body,
    id: `p-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  projects.unshift(newProject); // Add to top
  writeProjects(projects);
  return NextResponse.json(newProject, { status: 201 });
}

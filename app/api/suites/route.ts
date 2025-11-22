import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUITES_FILE = path.join(DATA_DIR, 'suites.json');

const readSuites = () => {
  if (!fs.existsSync(SUITES_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUITES_FILE, 'utf-8'));
};

const writeSuites = (suites: any[]) => {
  fs.writeFileSync(SUITES_FILE, JSON.stringify(suites, null, 2));
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    let suites = readSuites();
    if (projectId) suites = suites.filter((s: any) => s.projectId === projectId);
    return NextResponse.json(suites);
}

export async function POST(request: Request) {
    const body = await request.json();
    const suites = readSuites();
    const newSuite = { ...body, id: `suite-${Date.now()}`, createdAt: new Date().toISOString() };
    suites.push(newSuite);
    writeSuites(suites);
    return NextResponse.json(newSuite);
}

export async function PUT(request: Request) {
    const body = await request.json();
    const suites = readSuites();
    const index = suites.findIndex((s: any) => s.id === body.id);
    if (index !== -1) {
        suites[index] = { ...suites[index], ...body };
        writeSuites(suites);
        return NextResponse.json(suites[index]);
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    let suites = readSuites();
    suites = suites.filter((s: any) => s.id !== id);
    writeSuites(suites);
    return NextResponse.json({ success: true });
}

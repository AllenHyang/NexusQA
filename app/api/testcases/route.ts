import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TESTCASES_FILE = path.join(DATA_DIR, 'testcases.json');

// Helper to read test cases
const readTestCases = () => {
  if (!fs.existsSync(TESTCASES_FILE)) {
    return [];
  }
  const data = fs.readFileSync(TESTCASES_FILE, 'utf-8');
  return JSON.parse(data);
};

// Helper to write test cases
const writeTestCases = (testCases: any[]) => {
  fs.writeFileSync(TESTCASES_FILE, JSON.stringify(testCases, null, 2));
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  let testCases = readTestCases();
  
  if (projectId) {
    testCases = testCases.filter((tc: any) => tc.projectId === projectId);
  }
  
  return NextResponse.json(testCases);
}

export async function POST(request: Request) {
  const body = await request.json();
  const testCases = readTestCases();
  
  // Check if update or create
  if (body.id) {
      const index = testCases.findIndex((tc: any) => tc.id === body.id);
      if (index !== -1) {
          testCases[index] = { ...testCases[index], ...body };
          writeTestCases(testCases);
          return NextResponse.json(testCases[index]);
      }
  }

  const newTestCase = {
    ...body,
    id: `tc-${Date.now()}`,
    history: []
  };
  testCases.unshift(newTestCase);
  writeTestCases(testCases);
  return NextResponse.json(newTestCase, { status: 201 });
}

export async function PUT(request: Request) {
    // Bulk Update Handler
    const body = await request.json();
    const { ids, updates } = body;
    
    let testCases = readTestCases();
    testCases = testCases.map((tc: any) => {
        if (ids.includes(tc.id)) {
            return { ...tc, ...updates };
        }
        return tc;
    });
    
    writeTestCases(testCases);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids'); // Comma separated

    let testCases = readTestCases();
    
    if (id) {
        testCases = testCases.filter((tc: any) => tc.id !== id);
    } else if (ids) {
        const idList = ids.split(',');
        testCases = testCases.filter((tc: any) => !idList.includes(tc.id));
    }
    
    writeTestCases(testCases);
    return NextResponse.json({ success: true });
}

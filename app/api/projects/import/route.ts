import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Recursive type for Suite Import
interface SuiteImportData {
  name: string;
  description?: string;
  children?: SuiteImportData[];
  testCases?: TestCaseImportData[];
}

interface TestCaseImportData {
  title: string;
  description?: string;
  preconditions?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  userStory?: string;
  requirementId?: string;
  steps?: { action: string; expected: string }[];
}

interface ProjectImportData {
  name: string;
  description?: string;
  repositoryUrl?: string;
  startDate?: string;
  dueDate?: string;
  suites?: SuiteImportData[];
  testCases?: TestCaseImportData[];
}

// Helper to map Test Cases for Prisma
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTestCase = (tc: TestCaseImportData) => ({
  title: tc.title,
  description: tc.description || '',
  preconditions: tc.preconditions || '',
  priority: tc.priority || 'P2',
  status: tc.status || 'UNTESTED',
  tags: JSON.stringify(tc.tags || []),
  userStory: tc.userStory,
  requirementId: tc.requirementId,
  steps: {
    create: tc.steps?.map((s, idx) => ({
      action: s.action,
      expected: s.expected,
      order: idx
    })) || []
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = body as ProjectImportData;

    // Basic Validation
    if (!data.name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Transactional Create
    const project = await prisma.$transaction(async (tx) => {
      // 1. Create Project
      const p = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          repositoryUrl: data.repositoryUrl,
        }
      });

      // 2. Recursive Helper for Suites
      const createSuitesRecursive = async (suites: SuiteImportData[], parentId: string | null) => {
        for (const suite of suites) {
          const createdSuite = await tx.testSuite.create({
            data: {
              name: suite.name,
              // description: suite.description, // TestSuite does not have description in schema
              projectId: p.id,
              parentId: parentId,
              testCases: {
                create: suite.testCases?.map(tc => ({
                  ...mapTestCase(tc),
                  projectId: p.id
                })) || []
              }
            }
          });

          if (suite.children && suite.children.length > 0) {
            await createSuitesRecursive(suite.children, createdSuite.id);
          }
        }
      };

      // 3. Create Root Suites
      if (data.suites && data.suites.length > 0) {
        await createSuitesRecursive(data.suites, null);
      }

      // 4. Create Root Test Cases
      if (data.testCases && data.testCases.length > 0) {
        for (const tc of data.testCases) {
          await tx.testCase.create({
            data: {
              ...mapTestCase(tc),
              projectId: p.id
            }
          });
        }
      }

      return p;
    });

    return NextResponse.json({ project }, { status: 201 });

  } catch (error) {
    console.error('Failed to import project:', error);
    return NextResponse.json(
      { error: 'Failed to process import request' },
      { status: 500 }
    );
  }
}

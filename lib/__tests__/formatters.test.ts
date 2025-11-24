import { formatBugReportMarkdown } from '../formatters';
import { TestCase as PrismaTestCase, TestStep as PrismaTestStep } from "@prisma/client";
import { ExecutionRecord } from '../../types';

describe('formatBugReportMarkdown', () => {
  it('should correctly format a bug report in Markdown', () => {
    const mockTestCase: PrismaTestCase & { steps: PrismaTestStep[] } = {
      id: 'test-case-1',
      title: 'User Login Failure',
      description: 'User cannot log in with valid credentials.',
      preconditions: 'User has valid credentials.',
      userStory: 'As a user, I want to log in, so I can access the application.',
      requirementId: 'REQ-001',
      acceptanceCriteria: 'User sees dashboard',
      tags: JSON.stringify(['login', 'regression']),
      status: 'UNTESTED',
      priority: 'P1',
      visualReference: null,
      authorId: 'user-1',
      assignedToId: null,
      projectId: 'project-1',
      suiteId: null,
      reviewStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [
        { id: 'step-1', action: 'Navigate to login page', expected: 'Login page is displayed', order: 0, testCaseId: 'test-case-1' },
        { id: 'step-2', action: 'Enter valid username and password', expected: 'Username and password fields are populated', order: 1, testCaseId: 'test-case-1' },
        { id: 'step-3', action: 'Click login button', expected: 'User is logged in successfully', order: 2, testCaseId: 'test-case-1' },
      ],
    };

    const mockExecutionRecord: ExecutionRecord = {
      id: 'exec-rec-1',
      date: new Date().toISOString(),
      status: 'FAILED',
      executedBy: 'QA Tester',
      notes: 'Login button did nothing. No error message shown.',
      bugId: undefined,
      environment: 'Staging - Chrome',
      evidence: undefined,
    };

    const expectedMarkdown = `### Defect Report: User Login Failure
**Status:** FAILED
**Environment:** Staging - Chrome

**Preconditions:**
User has valid credentials.

**Steps to Reproduce:**
1. Navigate to login page -> Login page is displayed
2. Enter valid username and password -> Username and password fields are populated
3. Click login button -> User is logged in successfully

**Actual Result/Notes:**
Login button did nothing. No error message shown.
`;

    const result = formatBugReportMarkdown(mockTestCase, mockExecutionRecord);
    expect(result).toBe(expectedMarkdown);
  });

  it('should handle missing preconditions and notes gracefully', () => {
    const mockTestCase: PrismaTestCase & { steps: PrismaTestStep[] } = {
      id: 'test-case-2',
      title: 'Empty Preconditions and Steps',
      description: 'Description',
      preconditions: null,
      userStory: null,
      requirementId: null,
      acceptanceCriteria: null,
      tags: JSON.stringify([]),
      status: 'UNTESTED',
      priority: 'P2',
      visualReference: null,
      authorId: 'user-2',
      assignedToId: null,
      projectId: 'project-2',
      suiteId: null,
      reviewStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [],
    };

    const mockExecutionRecord: ExecutionRecord = {
      id: 'exec-rec-2',
      date: new Date().toISOString(),
      status: 'BLOCKED',
      executedBy: 'Another QA',
      notes: undefined,
      bugId: undefined,
      environment: undefined,
      evidence: undefined,
    };

    const expectedMarkdown = `### Defect Report: Empty Preconditions and Steps
**Status:** BLOCKED
**Environment:** N/A

**Preconditions:**
None

**Steps to Reproduce:**


**Actual Result/Notes:**
No notes provided.
`;

    const result = formatBugReportMarkdown(mockTestCase, mockExecutionRecord);
    expect(result).toBe(expectedMarkdown);
  });
});

export type Role = "ADMIN" | "QA_LEAD" | "TESTER";

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface TestStep {
  id: string;
  action: string;
  expected: string;
  order: number; // Added order
  feedback?: 'up' | 'down'; // Added for AI generation feedback
}

export type TestStatus = "DRAFT" | "PASSED" | "FAILED" | "BLOCKED" | "UNTESTED" | "SKIPPED";
export type ReviewStatus = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ExecutionRecord {
  id: string;
  date: string;
  status: TestStatus;
  executedBy: string; // User Name
  notes?: string;
  bugId?: string;
  environment?: string; // e.g., "Staging - Chrome", "Prod - iOS"
  evidence?: string; // URL to screenshot or log
}

export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  parentId?: string | null; // For nested folders
  description?: string;
  createdAt: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  suiteId?: string; // Link to a TestSuite (Folder). If undefined, it's in the root.
  
  title: string;
  description: string;
  
  // Use Case Driven Development Fields
  userStory?: string; // "As a [user], I want to [action], so that [benefit]"
  requirementId?: string; // Link to Jira Ticket / PRD (e.g., PROJ-123)
  
  tags?: string[]; // e.g., "Smoke", "Regression", "API"

  preconditions: string;
  steps: TestStep[];
  status: TestStatus;
  priority: Priority;
  authorId: string;
  assignedToId?: string;
  visualReference?: string; // Base64 image
  imageFeedback?: 'up' | 'down'; // Added for AI image generation feedback
  history?: ExecutionRecord[]; // Audit trail
  createdAt?: string;
  updatedAt?: string;
  acceptanceCriteria?: string;
  reviewStatus?: ReviewStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string; // Base64 image
  createdAt: string;
  
  // New fields for Project Management
  repositoryUrl?: string; // e.g. GitHub/GitLab link
  startDate?: string;
  dueDate?: string;
}

export interface TestPlan {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  runs?: TestRun[];
  _count?: {
      runs: number;
  };
  createdAt: string;
}

export interface TestRun {
  id: string;
  testPlanId: string;
  testCaseId: string;
  status: TestStatus;
  executedBy?: string;
  notes?: string;
  executedAt?: string;
  snapshot?: string; // JSON string of Test Case state
  testCase?: TestCase; // for UI convenience
}
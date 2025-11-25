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
  order: number; 
  feedback?: 'up' | 'down'; 
}

export type TestStatus = "DRAFT" | "PASSED" | "FAILED" | "BLOCKED" | "UNTESTED" | "SKIPPED";
export type ReviewStatus = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DefectStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Defect {
  id: string;
  title: string;
  description?: string;
  status: DefectStatus | string;
  severity: Priority | string;
  
  projectId: string;
  authorId: string;
  assigneeId?: string;
  
  externalIssueId?: string;
  externalUrl?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface Requirement {
  id: string;
  externalId: string;
  tracker: string;
  url: string;
  description?: string;
}

export interface ExecutionRecord {
  id: string;
  date: string;
  status: TestStatus;
  executedBy: string; 
  notes?: string;
  bugId?: string; 
  defects?: Defect[];
  environment?: string; 
  evidence?: string; 
}

export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  parentId?: string | null; 
  description?: string;
  createdAt: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  suiteId?: string; 
  
  title: string;
  description: string;
  
  userStory?: string; 
  requirementId?: string; 
  requirements?: Requirement[];
  
  tags?: string[]; 

  preconditions: string;
  steps: TestStep[];
  status: TestStatus;
  priority: Priority;
  authorId: string;
  assignedToId?: string;
  visualReference?: string; 
  imageFeedback?: 'up' | 'down'; 
  history?: ExecutionRecord[]; 
  createdAt?: string;
  updatedAt?: string;
  acceptanceCriteria?: string;
  reviewStatus?: ReviewStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  coverImage?: string; 
  createdAt: string;
  
  repositoryUrl?: string; 
  startDate?: string;
  dueDate?: string;
  
  defects?: Defect[];
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
  snapshot?: string; 
  testCase?: TestCase; 
}

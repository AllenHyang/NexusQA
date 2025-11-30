export type Role = "ADMIN" | "QA_LEAD" | "TESTER" | "PM" | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  email?: string; // Added email field
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

export interface DefectComment {
  id: string;
  content: string;
  defectId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

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
  
  comments?: DefectComment[];

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
  suiteId: string | null; // Changed to string | null
  
  title: string;
  description: string | null;
  
  userStory: string | null; 
  requirementId: string | null; 
  requirements?: Requirement[];
  
  tags?: string[]; 

  preconditions: string;
  steps: TestStep[];
  status: TestStatus;
  priority: Priority;
  authorId: string;
  assignedToId: string | null;
  visualReference?: string; 
  imageFeedback?: 'up' | 'down'; 
  history?: ExecutionRecord[]; 
  createdAt?: string | Date; // Allow Date objects
  updatedAt?: string | Date; // Allow Date objects
  acceptanceCriteria: string | null;
  reviewStatus: ReviewStatus | null;
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

// Internal Requirement Types
export type RequirementStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
export type AcceptanceStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface AcceptanceCriteria {
  id: string;
  description: string;
  testCaseIds: string[];
  status: "PENDING" | "COVERED" | "PASSED" | "FAILED";
}

export interface BusinessRule {
  id: string;
  code: string; // e.g., "BR-001"
  description: string;
}

export interface DesignReference {
  id: string;
  type: "image" | "link" | "figma";
  url: string;
  title: string;
}

export interface RelatedRequirement {
  id: string;
  type: "depends_on" | "blocks" | "related_to";
}

export interface UserStory {
  id: string;
  role: string;      // 作为[角色]
  goal: string;      // 我希望[目标]
  benefit: string;   // 以便[价值]
}

export interface InternalRequirement {
  id: string;
  title: string;
  description?: string | null;

  // Folder Hierarchy (F-RQ-011, F-RQ-012)
  folderId?: string | null;
  folder?: RequirementFolder | null;
  order?: number;

  // User Stories (JSON array, BDD format)
  userStories: string; // JSON array of UserStory

  // Target Users/Personas (JSON array of role codes)
  targetUsers: string; // JSON array: ["PM", "TESTER", "DEVELOPER"]

  // Preconditions
  preconditions?: string | null;

  // Business Rules (JSON array)
  businessRules: string; // JSON array of BusinessRule

  // Design References (JSON array)
  designReferences: string; // JSON array of DesignReference

  // Version/Sprint Planning
  targetVersion?: string | null;
  estimatedEffort?: string | null;

  // Owner
  ownerId?: string | null;
  owner?: {
    id: string;
    name: string;
    avatar?: string | null;
  };

  // Related Requirements (JSON array)
  relatedRequirements: string; // JSON array of RelatedRequirement

  // Status Management
  status: RequirementStatus;
  acceptanceStatus: AcceptanceStatus;

  priority: string;
  tags: string; // JSON array string
  acceptanceCriteria: string; // JSON array string of AcceptanceCriteria

  // Acceptance Records
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  acceptanceNotes?: string | null;

  // Review Records
  reviewerId?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;

  // Relations
  projectId: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
  };

  testCases?: TestCase[];
  reviews?: RequirementReview[];

  stats?: {
    totalCases: number;
    passedCases: number;
    failedCases: number;
    untestedCases?: number;
    coverageRate: number;
    passRate: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

// Requirement Folder Types (F-RQ-011, F-RQ-012)
export type FolderType = "EPIC" | "FEATURE" | "FOLDER";

export interface RequirementFolder {
  id: string;
  name: string;
  description?: string | null;
  type: FolderType;
  parentId?: string | null;
  parent?: RequirementFolder | null;
  children?: RequirementFolder[];
  order: number;
  projectId: string;
  requirements?: InternalRequirement[];
  createdAt?: string;
  updatedAt?: string;
}

// Requirement Review Types
export type ReviewAction = "SUBMIT" | "APPROVE" | "REJECT" | "REQUEST_CHANGES" | "START" | "COMPLETE" | "REOPEN";

export interface RequirementReview {
  id: string;
  action: ReviewAction;
  comment?: string | null;
  fromStatus?: string | null;
  toStatus: string;
  requirementId: string;
  reviewerId: string;
  reviewer?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    role?: string;
  };
  createdAt: string;
}

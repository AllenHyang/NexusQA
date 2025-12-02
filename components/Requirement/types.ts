import {
  InternalRequirement,
  RequirementStatus,
  AcceptanceCriteria,
  BusinessRule,
  DesignReference,
  RelatedRequirement,
  UserStory,
  User,
  RequirementReview,
  TestCase
} from "@/types";

// Tab types
export type TabType = "BASIC" | "USER_STORY" | "DESIGN" | "ACCEPTANCE_CRITERIA" | "TEST_CASES" | "REVIEW" | "ACCEPTANCE";

// Form state interface
export interface RequirementFormState {
  title: string;
  description: string;
  status: RequirementStatus;
  priority: string;
  tags: string[];
  userStories: UserStory[];
  targetUsers: string[];
  preconditions: string;
  targetVersion: string;
  estimatedEffort: string;
  ownerId: string;
  reviewerId: string;
  businessRules: BusinessRule[];
  designReferences: DesignReference[];
  relatedRequirements: RelatedRequirement[];
  acceptanceCriteria: AcceptanceCriteria[];
}

// Form actions
export interface RequirementFormActions {
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setStatus: (value: RequirementStatus) => void;
  setPriority: (value: string) => void;
  setTags: (value: string[]) => void;
  setUserStories: (value: UserStory[]) => void;
  setTargetUsers: (value: string[]) => void;
  setPreconditions: (value: string) => void;
  setTargetVersion: (value: string) => void;
  setEstimatedEffort: (value: string) => void;
  setOwnerId: (value: string) => void;
  setReviewerId: (value: string) => void;
  setBusinessRules: (value: BusinessRule[]) => void;
  setDesignReferences: (value: DesignReference[]) => void;
  setRelatedRequirements: (value: RelatedRequirement[]) => void;
  setAcceptanceCriteria: (value: AcceptanceCriteria[]) => void;
}

// Tab props shared interface
export interface TabProps {
  isEditMode: boolean;
  requirement?: InternalRequirement;
  formState: RequirementFormState;
  formActions: RequirementFormActions;
  currentUser: User;
  projectId: string;
}

// Test stats interface
export interface TestStats {
  total: number;
  executed: number;
  passed: number;
  failed: number;
  blocked: number;
  executionProgress: number;
  passRate: number;
}

// AC Coverage interface
export interface ACCoverage {
  ac: AcceptanceCriteria;
  linkedTestCases: TestCase[];
  coverageStatus: 'covered' | 'partial' | 'uncovered';
  passed: number;
  failed: number;
  total: number;
}

// AI Generation state
export interface AIGenerationState {
  generating: string | null;
  error: string | null;
}

// Review state
export interface ReviewState {
  history: RequirementReview[];
  comment: string;
  loading: boolean;
  error: string | null;
}

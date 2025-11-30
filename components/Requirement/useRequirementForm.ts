"use client";

import { useState, useEffect, useCallback } from "react";
import {
  InternalRequirement,
  RequirementStatus,
  AcceptanceCriteria,
  BusinessRule,
  DesignReference,
  RelatedRequirement,
  UserStory,
} from "@/types";
import { RequirementFormState, RequirementFormActions } from "./types";

interface UseRequirementFormOptions {
  requirement?: InternalRequirement;
  isOpen: boolean;
}

interface UseRequirementFormReturn {
  formState: RequirementFormState;
  formActions: RequirementFormActions;
  resetForm: () => void;
  isValid: boolean;
  validationErrors: string[];
}

const initialState: RequirementFormState = {
  title: "",
  description: "",
  status: "DRAFT",
  priority: "P2",
  tags: [],
  userStories: [],
  targetUsers: [],
  preconditions: "",
  targetVersion: "",
  estimatedEffort: "",
  ownerId: "",
  businessRules: [],
  designReferences: [],
  relatedRequirements: [],
  acceptanceCriteria: [],
};

export function useRequirementForm({
  requirement,
  isOpen,
}: UseRequirementFormOptions): UseRequirementFormReturn {
  const [formState, setFormState] = useState<RequirementFormState>(initialState);

  // Reset form when modal opens/closes or requirement changes
  useEffect(() => {
    if (!isOpen) return;

    if (requirement) {
      // Parse JSON fields safely
      const parseJSON = <T>(value: string | undefined | null, fallback: T): T => {
        if (!value) return fallback;
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      };

      setFormState({
        title: requirement.title,
        description: requirement.description || "",
        status: requirement.status,
        priority: requirement.priority,
        tags: parseJSON(requirement.tags, []),
        userStories: parseJSON(requirement.userStories, []),
        targetUsers: parseJSON(requirement.targetUsers, []),
        preconditions: requirement.preconditions || "",
        targetVersion: requirement.targetVersion || "",
        estimatedEffort: requirement.estimatedEffort || "",
        ownerId: requirement.ownerId || "",
        businessRules: parseJSON(requirement.businessRules, []),
        designReferences: parseJSON(requirement.designReferences, []),
        relatedRequirements: parseJSON(requirement.relatedRequirements, []),
        acceptanceCriteria: parseJSON(requirement.acceptanceCriteria, []),
      });
    } else {
      setFormState(initialState);
    }
  }, [requirement, isOpen]);

  // Form actions
  const formActions: RequirementFormActions = {
    setTitle: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, title: value }));
    }, []),
    setDescription: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, description: value }));
    }, []),
    setStatus: useCallback((value: RequirementStatus) => {
      setFormState((prev) => ({ ...prev, status: value }));
    }, []),
    setPriority: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, priority: value }));
    }, []),
    setTags: useCallback((value: string[]) => {
      setFormState((prev) => ({ ...prev, tags: value }));
    }, []),
    setUserStories: useCallback((value: UserStory[]) => {
      setFormState((prev) => ({ ...prev, userStories: value }));
    }, []),
    setTargetUsers: useCallback((value: string[]) => {
      setFormState((prev) => ({ ...prev, targetUsers: value }));
    }, []),
    setPreconditions: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, preconditions: value }));
    }, []),
    setTargetVersion: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, targetVersion: value }));
    }, []),
    setEstimatedEffort: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, estimatedEffort: value }));
    }, []),
    setOwnerId: useCallback((value: string) => {
      setFormState((prev) => ({ ...prev, ownerId: value }));
    }, []),
    setBusinessRules: useCallback((value: BusinessRule[]) => {
      setFormState((prev) => ({ ...prev, businessRules: value }));
    }, []),
    setDesignReferences: useCallback((value: DesignReference[]) => {
      setFormState((prev) => ({ ...prev, designReferences: value }));
    }, []),
    setRelatedRequirements: useCallback((value: RelatedRequirement[]) => {
      setFormState((prev) => ({ ...prev, relatedRequirements: value }));
    }, []),
    setAcceptanceCriteria: useCallback((value: AcceptanceCriteria[]) => {
      setFormState((prev) => ({ ...prev, acceptanceCriteria: value }));
    }, []),
  };

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, []);

  // Validation
  const validationErrors: string[] = [];
  if (!formState.title.trim()) {
    validationErrors.push("标题为必填项");
  }

  const isValid = validationErrors.length === 0;

  return {
    formState,
    formActions,
    resetForm,
    isValid,
    validationErrors,
  };
}

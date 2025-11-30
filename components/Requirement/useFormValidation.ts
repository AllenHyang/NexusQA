"use client";

import { useMemo } from "react";
import { RequirementFormState } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
}

export function useFormValidation(
  formState: RequirementFormState,
  touched: Record<string, boolean> = {}
): ValidationResult {
  const errors = useMemo(() => {
    const validationErrors: ValidationError[] = [];

    // Title validation - required
    if (!formState.title.trim()) {
      validationErrors.push({
        field: "title",
        message: "需求标题为必填项",
      });
    } else if (formState.title.length > 200) {
      validationErrors.push({
        field: "title",
        message: "标题不能超过200个字符",
      });
    }

    // Description validation - optional but with length limit
    if (formState.description && formState.description.length > 5000) {
      validationErrors.push({
        field: "description",
        message: "描述不能超过5000个字符",
      });
    }

    // User stories validation
    formState.userStories.forEach((story, index) => {
      if (story.role || story.goal || story.benefit) {
        // If any field is filled, all should be filled
        if (!story.role.trim()) {
          validationErrors.push({
            field: `userStory.${index}.role`,
            message: `用户故事 ${index + 1}: 请填写用户角色`,
          });
        }
        if (!story.goal.trim()) {
          validationErrors.push({
            field: `userStory.${index}.goal`,
            message: `用户故事 ${index + 1}: 请填写目标`,
          });
        }
        if (!story.benefit.trim()) {
          validationErrors.push({
            field: `userStory.${index}.benefit`,
            message: `用户故事 ${index + 1}: 请填写价值`,
          });
        }
      }
    });

    // Acceptance criteria validation
    formState.acceptanceCriteria.forEach((ac, index) => {
      if (!ac.description.trim()) {
        validationErrors.push({
          field: `acceptanceCriteria.${index}`,
          message: `验收标准 ${index + 1}: 请填写描述`,
        });
      }
    });

    // Business rules validation
    formState.businessRules.forEach((rule, index) => {
      if (!rule.description.trim()) {
        validationErrors.push({
          field: `businessRule.${index}`,
          message: `业务规则 ${rule.code}: 请填写描述`,
        });
      }
    });

    // Design references validation
    formState.designReferences.forEach((ref, index) => {
      if (!ref.url.trim()) {
        validationErrors.push({
          field: `designReference.${index}`,
          message: `设计参考 ${index + 1}: 请填写URL`,
        });
      } else if (!isValidUrl(ref.url)) {
        validationErrors.push({
          field: `designReference.${index}`,
          message: `设计参考 ${index + 1}: URL格式不正确`,
        });
      }
    });

    return validationErrors;
  }, [formState]);

  const getFieldError = (field: string): string | undefined => {
    // Only show error if field has been touched
    if (!touched[field]) return undefined;
    const error = errors.find((e) => e.field === field);
    return error?.message;
  };

  const hasFieldError = (field: string): boolean => {
    if (!touched[field]) return false;
    return errors.some((e) => e.field === field);
  };

  return {
    isValid: errors.length === 0,
    errors,
    getFieldError,
    hasFieldError,
  };
}

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

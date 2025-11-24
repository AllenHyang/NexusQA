import { TestCase as PrismaTestCase, TestStep as PrismaTestStep } from "@prisma/client";
import { ExecutionRecord } from "../types";

interface FormatterTestCase extends PrismaTestCase {
  steps: PrismaTestStep[];
}

export const formatBugReportMarkdown = (
  testCase: FormatterTestCase,
  executionRecord: ExecutionRecord
): string => {
  const title = testCase.title;
  const status = executionRecord.status;
  const env = executionRecord.environment || "N/A";
  const preconditions = testCase.preconditions || "None";
  const stepsToReproduce = testCase.steps
    .map((step, index) => `${index + 1}. ${step.action} -> ${step.expected}`)
    .join("\n");
  const actualResultNotes = executionRecord.notes || "No notes provided.";

  return `### Defect Report: ${title}
**Status:** ${status}
**Environment:** ${env}

**Preconditions:**
${preconditions}

**Steps to Reproduce:**
${stepsToReproduce}

**Actual Result/Notes:**
${actualResultNotes}
`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeParseTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed;
        } catch { return []; }
    }
    return [];
};

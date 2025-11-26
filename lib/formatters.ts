import { TestCase, ExecutionRecord } from "../types";
import { TestStep as PrismaTestStep } from "@prisma/client";

interface FormatterTestCase extends TestCase {
  steps: PrismaTestStep[];
}

export const safeParseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags as string[];
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return [];
    }
  }
  return [];
};

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
  const parsedTags = safeParseTags((testCase as unknown as { tags?: unknown }).tags);
  const envAndTagsBlock = parsedTags.length > 0
    ? `**Environment:** ${env}\n**Tags:** ${parsedTags.join(", ")}\n\n`
    : `**Environment:** ${env}\n\n`;

  return `### Defect Report: ${title}
**Status:** ${status}
${envAndTagsBlock}**Preconditions:**
${preconditions}

**Steps to Reproduce:**
${stepsToReproduce}

**Actual Result/Notes:**
${actualResultNotes}
`;
};

import { StateCreator } from 'zustand';
import { TestCase, TestSuite, TestStatus, TestStep } from '@/types'; // Added TestStep
import { generateImage } from '@/app/actions';

export interface TestCaseSlice {
  testCases: TestCase[];
  suites: TestSuite[];
  
  saveTestCase: (testCase: Partial<TestCase>) => Promise<void>;
  deleteTestCase: (id: string) => Promise<void>;
  bulkDeleteTestCases: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: TestStatus) => Promise<void>;
  bulkMoveTestCases: (ids: string[], targetSuiteId: string | null) => Promise<void>;
  
  createSuite: (projectId: string, parentId: string | null, name: string) => Promise<void>;
  renameSuite: (id: string, name: string) => Promise<void>;
  deleteSuite: (id: string) => Promise<void>;

  generateStepsForCase: (title: string, description: string, setEditCase: (c: Partial<TestCase>) => void, onAIError: (message: string) => void) => Promise<void>; // Updated signature
  generateFieldForCase: (title: string, fieldType: string, context: string, setField: (val: string) => void, onAIError: (message: string) => void) => Promise<void>;
  generateMockupForCase: (prompt: string, onAIError: (message: string) => void) => Promise<string | null>; // Updated signature
}

export const createTestCaseSlice: StateCreator<TestCaseSlice> = (set) => ({
  testCases: [],
  suites: [],

  saveTestCase: async (testCase) => {
      const dataToSave: Partial<TestCase> = { ...testCase };
      // Tags are handled automatically by JSON.stringify of the body

      const res = await fetch('/api/testcases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
      });
      
      if (res.ok) {
          const savedCase = await res.json();
          set(state => {
              if (testCase.id) {
                  return { testCases: state.testCases.map(tc => tc.id === savedCase.id ? savedCase : tc) };
              } else {
                  return { testCases: [savedCase, ...state.testCases] };
              }
          });
      }
  },

  deleteTestCase: async (id) => {
      await fetch(`/api/testcases?id=${id}`, { method: 'DELETE' });
      set(state => ({ testCases: state.testCases.filter(tc => tc.id !== id) }));
  },

  bulkDeleteTestCases: async (ids) => {
      await fetch(`/api/testcases?ids=${ids.join(',')}`, { method: 'DELETE' });
      set(state => ({ testCases: state.testCases.filter(tc => !ids.includes(tc.id)) }));
  },

  bulkUpdateStatus: async (ids, status) => {
      const updates = { status };
      await fetch('/api/testcases', { 
          method: 'PUT', 
          body: JSON.stringify({ ids, updates }) 
      });
      set(state => ({
          testCases: state.testCases.map(tc => ids.includes(tc.id) ? { ...tc, status } : tc)
      }));
  },

  bulkMoveTestCases: async (ids, targetSuiteId) => {
      await fetch('/api/testcases', {
          method: 'PUT',
          body: JSON.stringify({ ids, updates: { suiteId: targetSuiteId || undefined } })
      });
      set(state => ({
          testCases: state.testCases.map(tc => ids.includes(tc.id) ? { ...tc, suiteId: targetSuiteId || undefined } : tc)
      }));
  },

  createSuite: async (projectId, parentId, name) => {
      const res = await fetch('/api/suites', {
          method: 'POST',
          body: JSON.stringify({ projectId, parentId, name })
      });
      if (res.ok) {
          const newSuite = await res.json();
          set(state => ({ suites: [...state.suites, newSuite] }));
      }
  },

  renameSuite: async (id, name) => {
      await fetch('/api/suites', { method: 'PUT', body: JSON.stringify({ id, name }) });
      set(state => ({
          suites: state.suites.map(s => s.id === id ? { ...s, name } : s)
      }));
  },

  deleteSuite: async (id) => {
      await fetch(`/api/suites?id=${id}`, { method: 'DELETE' });
      set(state => ({ suites: state.suites.filter(s => s.id !== id) }));
  },

  generateStepsForCase: async (title, description, setEditCase, onAIError) => { 
      const currentSteps: TestStep[] = [];
      let stepCounter = 0;

      try {
          const response = await fetch('/api/ai/generate-steps', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, description }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate steps');
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("Response body is null");

          const decoder = new TextDecoder();
          let accumulatedText = "";

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              accumulatedText += decoder.decode(value, { stream: true });
              const lines = accumulatedText.split('\n');
              accumulatedText = lines.pop() || ""; // Keep incomplete line

              for (const line of lines) {
                  if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                      try {
                          const parsedStep = JSON.parse(line.trim());
                          if (parsedStep.action && parsedStep.expected) {
                              const newStep: TestStep = {
                                  id: `step-${Date.now()}-${stepCounter++}`,
                                  action: parsedStep.action,
                                  expected: parsedStep.expected,
                              };
                              currentSteps.push(newStep);
                              setEditCase({ steps: [...currentSteps] });
                          }
                      } catch (e) {
                          // Ignore parse errors for now
                      }
                  }
              }
          }

      } catch (error) {
          console.error("Error streaming steps:", error);
          onAIError(error instanceof Error ? error.message : "An unexpected error occurred during step generation.");
          // Optionally keep partial steps or clear them:
          // setEditCase({ steps: [] }); 
      }
  },

  generateFieldForCase: async (title, fieldType, context, setField, onAIError) => {
      try {
          const response = await fetch('/api/ai/generate-field', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, fieldType, context }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to generate text');
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("Response body is null");

          const decoder = new TextDecoder();
          let accumulatedText = "";

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              accumulatedText += chunk;
              setField(accumulatedText);
          }
      } catch (error) {
          console.error("Error streaming field:", error);
          onAIError(error instanceof Error ? error.message : "An unexpected error occurred.");
      }
  },

  generateMockupForCase: async (prompt, onAIError) => {
      const result = await generateImage(prompt, "reference");
      if (result.error) {
          onAIError(result.error);
          return null;
      }
      return result.data || null;
  }
});

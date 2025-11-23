import { StateCreator } from 'zustand';
import { TestCase, TestSuite, TestStatus, TestStep } from '@/types'; // Added TestStep
import { generateTestSteps, generateImage } from '@/app/actions';

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

  generateStepsForCase: (title: string, description: string, setEditCase: (c: Partial<TestCase>) => void) => Promise<void>; // Updated signature
  generateMockupForCase: (prompt: string) => Promise<string | null>;
}

export const createTestCaseSlice: StateCreator<TestCaseSlice> = (set) => ({
  testCases: [],
  suites: [],

  saveTestCase: async (testCase) => {
      const res = await fetch('/api/testcases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase)
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

  generateStepsForCase: async (title, description, setEditCase) => { // Updated implementation
      const currentSteps: TestStep[] = [];
      try {
          for await (const step of generateTestSteps(title, description)) {
              currentSteps.push(step);
              setEditCase({ steps: [...currentSteps] }); // Update state with each new step
          }
      } catch (error) {
          console.error("Error streaming steps:", error);
          setEditCase({ steps: [] }); // Clear steps on error or partial steps
      }
  },

  generateMockupForCase: async (prompt) => {
      return await generateImage(prompt, "reference");
  }
});

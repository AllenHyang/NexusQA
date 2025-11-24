import { StateCreator } from 'zustand';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TestPlan, TestRun } from '@/types';

export interface TestPlanSlice {
  plans: TestPlan[];
  currentPlan: TestPlan | null;
  fetchPlans: (projectId: string) => Promise<void>;
  fetchPlan: (planId: string) => Promise<void>;
  createPlan: (projectId: string, data: Partial<TestPlan>) => Promise<void>;
  addCasesToPlan: (planId: string, caseIds: string[]) => Promise<void>;
  removeCaseFromPlan: (planId: string, caseId: string) => Promise<void>;
  updateRunStatus: (runId: string, status: string, notes?: string) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTestPlanSlice: StateCreator<TestPlanSlice, [], [], TestPlanSlice> = (set, get) => ({
  plans: [],
  currentPlan: null,

  fetchPlans: async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/plans`);
      const data = await res.json();
      set({ plans: data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchPlan: async (planId: string) => {
    try {
        const res = await fetch(`/api/plans/${planId}`);
        const data = await res.json();
        set({ currentPlan: data });
    } catch (e) {
        console.error(e);
    }
  },
  
  createPlan: async (projectId, data) => {
      const res = await fetch(`/api/projects/${projectId}/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      if (res.ok) {
          await get().fetchPlans(projectId);
      }
  },
  
  addCasesToPlan: async (planId, caseIds) => {
      const res = await fetch(`/api/plans/${planId}/cases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseIds })
      });
      if (res.ok) {
          // Refresh current plan to show new runs
          await get().fetchPlan(planId);
      }
  },

  removeCaseFromPlan: async (planId, caseId) => {
      const res = await fetch(`/api/plans/${planId}/cases?caseId=${caseId}`, {
          method: 'DELETE',
      });
      if (res.ok) {
          const currentPlan = get().currentPlan;
          if (currentPlan && currentPlan.runs) {
             const newRuns = currentPlan.runs.filter(r => r.testCaseId !== caseId);
             set({ currentPlan: { ...currentPlan, runs: newRuns } });
          }
      }
  },

  updateRunStatus: async (runId, status, notes) => {
      const res = await fetch(`/api/runs/${runId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes })
      });
      
      if (res.ok) {
          const updatedRun = await res.json();
          const currentPlan = get().currentPlan;
          if (currentPlan && currentPlan.runs) {
              const newRuns = currentPlan.runs.map(r => r.id === runId ? { ...r, ...updatedRun } : r);
              set({ currentPlan: { ...currentPlan, runs: newRuns } });
          }
      }
  }
});

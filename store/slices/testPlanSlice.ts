import { StateCreator } from 'zustand';
import { TestPlan } from '@/types';

export interface TestPlanSlice {
  plans: TestPlan[];
  currentPlan: TestPlan | null;
  fetchPlans: (projectId: string) => Promise<void>;
  fetchPlan: (planId: string) => Promise<void>;
  createPlan: (projectId: string, data: Partial<TestPlan>) => Promise<void>;
  addCasesToPlan: (planId: string, caseIds: string[]) => Promise<void>;
  removeCaseFromPlan: (planId: string, caseId: string) => Promise<void>;
  updateRunStatus: (runId: string, status: string, notes?: string) => Promise<void>;
  duplicateTestPlan: (planId: string) => Promise<void>;
  deleteTestPlan: (planId: string) => Promise<boolean>;
}

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
  },

  duplicateTestPlan: async (planId) => {
    try {
        const res = await fetch(`/api/plans/${planId}/duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            const newPlan = await res.json();
            set(state => ({ plans: [newPlan, ...state.plans] }));
        } else {
            const errorData = await res.json();
            console.error("Failed to duplicate plan:", errorData.error);
        }
    } catch (error) {
        console.error("Error duplicating plan:", error);
    }
  },

  deleteTestPlan: async (planId) => {
    try {
        const res = await fetch(`/api/plans/${planId}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            set(state => ({ plans: state.plans.filter(p => p.id !== planId) }));
            return true;
        } else {
            const errorData = await res.json();
            console.error("Failed to delete plan:", errorData.error);
            return false;
        }
    } catch (error) {
        console.error("Error deleting plan:", error);
        return false;
    }
  },
});
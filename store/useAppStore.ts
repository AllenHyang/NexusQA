import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createTestCaseSlice, TestCaseSlice } from './slices/testCaseSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createTestPlanSlice, TestPlanSlice } from './slices/testPlanSlice';

type AppState = ProjectSlice & TestCaseSlice & UISlice & TestPlanSlice & {
  refreshData: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get, store) => ({
  ...createProjectSlice(set, get, store),
  ...createTestCaseSlice(set, get, store),
  ...createUISlice(set, get, store),
  ...createTestPlanSlice(set, get, store),

  refreshData: async () => {
    set({ loading: true });
    try {
      const [pRes, tcRes, sRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/testcases'),
        fetch('/api/suites')
      ]);
      
      const pData = await pRes.json();
      const tcData = await tcRes.json();
      const sData = await sRes.json();

      set({ projects: pData, testCases: tcData, suites: sData });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
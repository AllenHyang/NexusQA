import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createTestCaseSlice, TestCaseSlice } from './slices/testCaseSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createTestPlanSlice, TestPlanSlice } from './slices/testPlanSlice';
import { createDefectSlice, DefectSlice } from './slices/defectSlice';
import { createUserSlice, UserSlice } from './slices/userSlice'; // Import UserSlice

type AppState = ProjectSlice & TestCaseSlice & UISlice & TestPlanSlice & DefectSlice & UserSlice & { // Add UserSlice to AppState
  refreshData: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get, store) => ({
  ...createProjectSlice(set, get, store),
  ...createTestCaseSlice(set, get, store),
  ...createUISlice(set, get, store),
  ...createTestPlanSlice(set, get, store),
  ...createDefectSlice(set, get, store),
  ...createUserSlice(set, get, store), // Add createUserSlice

  refreshData: async () => {
    set({ loading: true });
    try {
      const [pRes, tcRes, sRes, uRes] = await Promise.all([ // Add uRes for users
        fetch('/api/projects'),
        fetch('/api/testcases'),
        fetch('/api/suites'),
        fetch('/api/users') // Fetch users
      ]);
      
      const pData = await pRes.json();
      const tcData = await tcRes.json();
      const sData = await sRes.json();
      const uData = await uRes.json(); // Get user data

      set({ projects: pData, testCases: tcData, suites: sData, users: uData }); // Add users to set
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

// Temporarily expose store for Playwright debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)._APP_STORE_ = useAppStore;
}

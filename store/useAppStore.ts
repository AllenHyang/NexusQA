import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createProjectSlice, ProjectSlice } from './slices/projectSlice';
import { createTestCaseSlice, TestCaseSlice } from './slices/testCaseSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createTestPlanSlice, TestPlanSlice } from './slices/testPlanSlice';
import { createDefectSlice, DefectSlice } from './slices/defectSlice';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createRequirementSlice, RequirementSlice } from './slices/requirementSlice';
import { createFolderSlice, FolderSlice } from './slices/folderSlice';

type AppState = ProjectSlice & TestCaseSlice & UISlice & TestPlanSlice & DefectSlice & UserSlice & RequirementSlice & FolderSlice & {
  refreshData: () => Promise<void>;
};

// Custom storage that handles SSR safely
const customStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    const value = sessionStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get, store) => ({
  ...createProjectSlice(set, get, store),
  ...createTestCaseSlice(set, get, store),
  ...createUISlice(set, get, store),
  ...createTestPlanSlice(set, get, store),
  ...createDefectSlice(set, get, store),
  ...createUserSlice(set, get, store),
  ...createRequirementSlice(set, get, store),
  ...createFolderSlice(set, get, store),

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
    }),
    {
      name: 'nexusqa-storage',
      storage: customStorage,
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
      skipHydration: false,
    }
  )
);

// Temporarily expose store for Playwright debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)._APP_STORE_ = useAppStore;
}

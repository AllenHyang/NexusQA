import { create } from 'zustand';
import { Project, TestCase, TestSuite, User, TestStatus } from '@/types';
import { generateTestSteps, generateImage } from '@/app/actions';

interface AppState {
  // User Session
  users: User[];
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;

  // Data Cache
  projects: Project[];
  testCases: TestCase[];
  suites: TestSuite[];
  loading: boolean;
  
  // UI State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  saveTestCase: (testCase: Partial<TestCase>) => Promise<void>;
  deleteTestCase: (id: string) => Promise<void>;
  bulkDeleteTestCases: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: TestStatus) => Promise<void>;
  bulkMoveTestCases: (ids: string[], targetSuiteId: string | null) => Promise<void>;
  
  createSuite: (projectId: string, parentId: string | null, name: string) => Promise<void>;
  renameSuite: (id: string, name: string) => Promise<void>;
  deleteSuite: (id: string) => Promise<void>;

  // AI Helper Actions
  generateStepsForCase: (title: string, description: string) => Promise<any[]>;
  generateMockupForCase: (prompt: string) => Promise<string | null>;
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Sarah Jenkins", role: "ADMIN", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "u2", name: "David Chen", role: "QA_LEAD", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { id: "u3", name: "Emily Rodriguez", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
  { id: "u4", name: "Michael Chang", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
];

export const useAppStore = create<AppState>((set, get) => ({
  // User
  users: MOCK_USERS,
  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  // Data
  projects: [],
  testCases: [],
  suites: [],
  loading: false,
  
  // UI
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Actions
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

  createProject: async (data) => {
    let cover = data.coverImage;
    if (!cover) {
       cover = await generateImage(data.description || data.name || "project", "project") || undefined;
    }
    const payload = { ...data, coverImage: cover };
    
    const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        const newProject = await res.json();
        set(state => ({ projects: [newProject, ...state.projects] }));
    }
  },

  updateProject: async (project) => {
      // Placeholder for real PUT
      set(state => ({
          projects: state.projects.map(p => p.id === project.id ? project : p)
      }));
  },

  deleteProject: async (id) => {
      // Placeholder for real DELETE
      set(state => ({
          projects: state.projects.filter(p => p.id !== id)
      }));
  },

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

  generateStepsForCase: async (title, description) => {
      return await generateTestSteps(title, description);
  },

  generateMockupForCase: async (prompt) => {
      return await generateImage(prompt, "reference");
  }
}));

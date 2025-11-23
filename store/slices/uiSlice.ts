import { StateCreator } from 'zustand';
import { User } from '@/types';

export interface UISlice {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  searchQuery: string;
  
  login: (user: User) => void;
  logout: () => void;
  setSearchQuery: (q: string) => void;
  setLoading: (loading: boolean) => void;
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Sarah Jenkins", role: "ADMIN", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "u2", name: "David Chen", role: "QA_LEAD", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { id: "u3", name: "Emily Rodriguez", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
  { id: "u4", name: "Michael Chang", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
];

export const createUISlice: StateCreator<UISlice> = (set) => ({
  users: MOCK_USERS,
  currentUser: null,
  loading: false,
  searchQuery: "",
  
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLoading: (loading) => set({ loading }),
});

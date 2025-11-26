import { StateCreator } from 'zustand';
import { User } from '@/types'; // Assuming you have a User type defined

export interface UserSlice {
  users: User[];
  loadUsers: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createUserSlice: StateCreator<UserSlice & any, [], [], UserSlice> = (set) => ({
  users: [],
  loadUsers: async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const users = await response.json();
      set({ users });
    } catch (error) {
      console.error("Failed to load users:", error);
      // Optionally set an error state here
    }
  },
});

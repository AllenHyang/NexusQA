import { StateCreator } from 'zustand';
import { User, Role } from '@/types';

export interface UserSlice {
  users: User[];
  loadUsers: () => Promise<void>;
  createUser: (data: { name: string; email: string; role?: Role; avatar?: string }) => Promise<User | null>;
  updateUser: (id: string, data: { name?: string; email?: string; role?: Role; avatar?: string }) => Promise<User | null>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string; details?: Record<string, number> }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createUserSlice: StateCreator<UserSlice & any, [], [], UserSlice> = (set, get) => ({
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
    }
  },

  createUser: async (data) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }
      const newUser = await response.json();
      set({ users: [...get().users, newUser] });
      return newUser;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
      const updatedUser = await response.json();
      set({
        users: get().users.map((u: User) => u.id === id ? updatedUser : u)
      });
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, error: result.error, details: result.details };
      }
      set({
        users: get().users.filter((u: User) => u.id !== id)
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete user:", error);
      return { success: false, error: 'Failed to delete user' };
    }
  },
});

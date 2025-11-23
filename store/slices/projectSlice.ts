import { StateCreator } from 'zustand';
import { Project } from '@/types';
import { generateImage } from '@/app/actions';

export interface ProjectSlice {
  projects: Project[];
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set) => ({
  projects: [],
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
      // Placeholder
      set(state => ({
          projects: state.projects.map(p => p.id === project.id ? project : p)
      }));
  },
  deleteProject: async (id) => {
      // Placeholder
      set(state => ({
          projects: state.projects.filter(p => p.id !== id)
      }));
  },
});

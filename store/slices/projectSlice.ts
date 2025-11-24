import { StateCreator } from 'zustand';
import { Project } from '@/types';
import { generateImage } from '@/app/actions';

export interface ProjectSlice {
  projects: Project[];
  createProject: (data: Partial<Project>, onAIError: (message: string) => void) => Promise<void>; // Updated signature
  updateProject: (project: Partial<Project>, onAIError: (message: string) => void) => Promise<void>; // Updated signature
  deleteProject: (id: string) => Promise<void>;
  generateProjectCover: (prompt: string, onAIError: (message: string) => void) => Promise<string | undefined>; // New prop
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  generateProjectCover: async (prompt, onAIError) => {
      const result = await generateImage(prompt, "project");
      if (result.error) {
          onAIError(result.error);
          return undefined;
      }
      return result.data || undefined;
  },
  createProject: async (data, onAIError) => {
    let cover = data.coverImage;
    if (cover === undefined) { // Check for undefined to regenerate
       cover = await get().generateProjectCover(data.description || data.name || "project", onAIError);
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
  updateProject: async (project, onAIError) => {
      let cover = project.coverImage;
      if (cover === null) { // If coverImage is explicitly set to null, regenerate
          cover = await get().generateProjectCover(project.description || project.name || "project", onAIError);
      }
      const payload = { ...project, coverImage: cover };

      const res = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      if (res.ok) {
          const updatedProject = await res.json();
          set(state => ({
              projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
          }));
      }
  },
  deleteProject: async (id) => {
      try {
          const res = await fetch(`/api/projects?id=${id}`, {
              method: 'DELETE',
          });
          if (res.ok) {
              set(state => ({
                  projects: state.projects.filter(p => p.id !== id)
              }));
          } else {
              console.error("Failed to delete project API");
          }
      } catch (error) {
          console.error("Failed to delete project:", error);
      }
  },
});

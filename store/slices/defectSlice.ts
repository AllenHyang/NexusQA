import { StateCreator } from 'zustand';
import { Defect } from '@/types';

export interface DefectSlice {
  defects: Defect[];
  loadDefects: (projectId: string) => Promise<void>;
  saveDefect: (defect: Partial<Defect>) => Promise<Defect | null>;
  bulkDeleteDefects: (ids: string[]) => Promise<void>;
  bulkUpdateDefects: (ids: string[], updates: Partial<Defect>) => Promise<void>;
  loadComments: (defectId: string) => Promise<void>;
  addComment: (defectId: string, content: string, userId: string) => Promise<void>;
}

export const createDefectSlice: StateCreator<DefectSlice> = (set) => ({
  defects: [],
  
  loadDefects: async (projectId) => {
    try {
        const res = await fetch(`/api/defects?projectId=${projectId}`);
        if (res.ok) {
            const defects = await res.json();
            set({ defects });
        }
    } catch (error) {
        console.error("Failed to load defects", error);
    }
  },

  saveDefect: async (defect) => {
    try {
        const res = await fetch('/api/defects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defect)
        });
        if (res.ok) {
            const saved = await res.json();
            set(state => {
                if (defect.id) {
                    return { defects: state.defects.map(d => d.id === saved.id ? saved : d) };
                } else {
                    return { defects: [saved, ...state.defects] };
                }
            });
            return saved;
        }
        // Log non-OK responses to aid debugging
        console.error('Failed to save defect: HTTP', res.status, await res.text());
    } catch (error) {
        console.error("Failed to save defect", error);
    }
    return null;
  },

  bulkDeleteDefects: async (ids) => {
    try {
        const res = await fetch(`/api/defects/bulk?ids=${ids.join(',')}`, { method: 'DELETE' });
        if (res.ok) {
            set(state => ({
                defects: state.defects.filter(d => !ids.includes(d.id))
            }));
        }
    } catch (error) {
        console.error("Failed to bulk delete defects", error);
    }
  },

  bulkUpdateDefects: async (ids, updates) => {
    try {
        const res = await fetch('/api/defects/bulk', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, updates })
        });
        if (res.ok) {
            set(state => ({
                defects: state.defects.map(d => ids.includes(d.id) ? { ...d, ...updates } : d)
            }));
        }
    } catch (error) {
        console.error("Failed to bulk update defects", error);
    }
  },

  loadComments: async (defectId) => {
      try {
          const res = await fetch(`/api/defects/${defectId}/comments`);
          if (res.ok) {
              const comments = await res.json();
              set(state => ({
                  defects: state.defects.map(d => d.id === defectId ? { ...d, comments } : d)
              }));
          }
      } catch (error) {
          console.error("Failed to load comments", error);
      }
  },

  addComment: async (defectId, content, userId) => {
      try {
          const res = await fetch(`/api/defects/${defectId}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content, userId })
          });
          if (res.ok) {
              const newComment = await res.json();
              set(state => ({
                  defects: state.defects.map(d => 
                      d.id === defectId ? { ...d, comments: [newComment, ...(d.comments || [])] } : d
                  )
              }));
          }
      } catch (error) {
          console.error("Failed to add comment", error);
      }
  }
});

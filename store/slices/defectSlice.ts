import { StateCreator } from 'zustand';
import { Defect } from '@/types';

export interface DefectSlice {
  defects: Defect[];
  loadDefects: (projectId: string) => Promise<void>;
  saveDefect: (defect: Partial<Defect>) => Promise<Defect | null>;
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
    } catch (error) {
        console.error("Failed to save defect", error);
    }
    return null;
  }
});

import { StateCreator } from 'zustand';
import { RequirementFolder, FolderType } from '@/types';

export interface FolderSlice {
  folders: RequirementFolder[];
  selectedFolder: RequirementFolder | null;
  foldersLoading: boolean;
  rootRequirementsCount: number;
  uncategorizedCount: number;

  loadFolders: (projectId: string) => Promise<void>;
  loadFolder: (folderId: string) => Promise<RequirementFolder | null>;
  createFolder: (folder: {
    name: string;
    description?: string;
    type?: FolderType;
    parentId?: string | null;
    projectId: string;
  }) => Promise<RequirementFolder | null>;
  updateFolder: (folderId: string, data: Partial<RequirementFolder>) => Promise<RequirementFolder | null>;
  deleteFolder: (folderId: string, cascade?: boolean) => Promise<boolean>;
  moveFolder: (folderId: string, parentId: string | null, order?: number) => Promise<boolean>;
  moveRequirementToFolder: (requirementId: string, folderId: string | null) => Promise<boolean>;
  batchMoveRequirementsToFolder: (requirementIds: string[], folderId: string | null) => Promise<boolean>;
  setSelectedFolder: (folder: RequirementFolder | null) => void;
}

export const createFolderSlice: StateCreator<FolderSlice> = (set) => ({
  folders: [],
  selectedFolder: null,
  foldersLoading: false,
  rootRequirementsCount: 0,
  uncategorizedCount: 0,

  loadFolders: async (projectId) => {
    set({ foldersLoading: true });
    try {
      const res = await fetch(`/api/requirements/folders?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        set({
          folders: data.folders,
          rootRequirementsCount: data.rootRequirementsCount,
          uncategorizedCount: data.uncategorizedCount || 0,
          foldersLoading: false
        });
      } else {
        set({ foldersLoading: false });
      }
    } catch (error) {
      console.error("Failed to load folders", error);
      set({ foldersLoading: false });
    }
  },

  loadFolder: async (folderId) => {
    try {
      const res = await fetch(`/api/requirements/folders/${folderId}`);
      if (res.ok) {
        const folder = await res.json();
        set({ selectedFolder: folder });
        return folder;
      }
    } catch (error) {
      console.error("Failed to load folder", error);
    }
    return null;
  },

  createFolder: async (folder) => {
    try {
      const res = await fetch('/api/requirements/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folder)
      });
      if (res.ok) {
        const created = await res.json();
        // Refresh folders to update tree
        const foldersRes = await fetch(`/api/requirements/folders?projectId=${folder.projectId}`);
        if (foldersRes.ok) {
          const data = await foldersRes.json();
          set({
            folders: data.folders,
            rootRequirementsCount: data.rootRequirementsCount,
            uncategorizedCount: data.uncategorizedCount || 0
          });
        }
        return created;
      }
    } catch (error) {
      console.error("Failed to create folder", error);
    }
    return null;
  },

  updateFolder: async (folderId, data) => {
    try {
      const res = await fetch(`/api/requirements/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          selectedFolder: state.selectedFolder?.id === folderId
            ? { ...state.selectedFolder, ...updated }
            : state.selectedFolder
        }));
        return updated;
      }
    } catch (error) {
      console.error("Failed to update folder", error);
    }
    return null;
  },

  deleteFolder: async (folderId, cascade = false) => {
    try {
      const url = cascade
        ? `/api/requirements/folders/${folderId}?cascade=true`
        : `/api/requirements/folders/${folderId}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        set(state => ({
          selectedFolder: state.selectedFolder?.id === folderId
            ? null
            : state.selectedFolder
        }));
        return true;
      }
    } catch (error) {
      console.error("Failed to delete folder", error);
    }
    return false;
  },

  moveFolder: async (folderId, parentId, order) => {
    try {
      const res = await fetch(`/api/requirements/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', parentId, order })
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to move folder", error);
    }
    return false;
  },

  moveRequirementToFolder: async (requirementId, folderId) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MOVE_TO_FOLDER', folderId })
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to move requirement to folder", error);
    }
    return false;
  },

  batchMoveRequirementsToFolder: async (requirementIds, folderId) => {
    try {
      const res = await fetch('/api/requirements/batch/folder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementIds, folderId })
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to batch move requirements", error);
    }
    return false;
  },

  setSelectedFolder: (folder) => {
    set({ selectedFolder: folder });
  }
});

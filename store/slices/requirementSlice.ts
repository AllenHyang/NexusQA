import { StateCreator } from 'zustand';
import { InternalRequirement, RequirementStatus, ReviewAction, RequirementReview } from '@/types';

export interface RequirementSlice {
  requirements: InternalRequirement[];
  selectedRequirement: InternalRequirement | null;
  requirementsLoading: boolean;

  loadRequirements: (projectId: string) => Promise<void>;
  loadRequirement: (requirementId: string) => Promise<InternalRequirement | null>;
  saveRequirement: (requirement: Partial<InternalRequirement>) => Promise<InternalRequirement | null>;
  deleteRequirement: (requirementId: string) => Promise<boolean>;
  bulkDeleteRequirements: (ids: string[]) => Promise<void>;

  updateRequirementStatus: (requirementId: string, status: RequirementStatus) => Promise<void>;
  updateRequirementOwner: (requirementId: string, ownerId: string | null) => Promise<void>;
  acceptRequirement: (requirementId: string, userId: string, notes?: string) => Promise<void>;
  rejectRequirement: (requirementId: string, userId: string, notes: string) => Promise<void>;

  // Review methods
  submitForReview: (requirementId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  approveReview: (requirementId: string, reviewerId: string, comment?: string) => Promise<{ success: boolean; error?: string }>;
  rejectReview: (requirementId: string, reviewerId: string, comment: string) => Promise<{ success: boolean; error?: string }>;
  requestChanges: (requirementId: string, reviewerId: string, comment: string) => Promise<{ success: boolean; error?: string }>;
  loadReviewHistory: (requirementId: string) => Promise<RequirementReview[]>;
  performReviewAction: (requirementId: string, action: ReviewAction, reviewerId: string, comment?: string) => Promise<{ success: boolean; error?: string }>;

  linkTestCases: (requirementId: string, testCaseIds: string[]) => Promise<void>;
  unlinkTestCase: (requirementId: string, testCaseId: string) => Promise<void>;

  setSelectedRequirement: (requirement: InternalRequirement | null) => void;
}

export const createRequirementSlice: StateCreator<RequirementSlice> = (set) => ({
  requirements: [],
  selectedRequirement: null,
  requirementsLoading: false,

  loadRequirements: async (projectId) => {
    set({ requirementsLoading: true });
    try {
      const res = await fetch(`/api/requirements?projectId=${projectId}`);
      if (res.ok) {
        const requirements = await res.json();
        set({ requirements, requirementsLoading: false });
      } else {
        set({ requirementsLoading: false });
      }
    } catch (error) {
      console.error("Failed to load requirements", error);
      set({ requirementsLoading: false });
    }
  },

  loadRequirement: async (requirementId) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`);
      if (res.ok) {
        const requirement = await res.json();
        set({ selectedRequirement: requirement });
        return requirement;
      }
    } catch (error) {
      console.error("Failed to load requirement", error);
    }
    return null;
  },

  saveRequirement: async (requirement) => {
    try {
      const res = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirement)
      });
      if (res.ok) {
        const saved = await res.json();
        set(state => {
          if (requirement.id) {
            // Update existing
            return {
              requirements: state.requirements.map(r =>
                r.id === saved.id ? { ...r, ...saved } : r
              ),
              selectedRequirement: state.selectedRequirement?.id === saved.id
                ? { ...state.selectedRequirement, ...saved }
                : state.selectedRequirement
            };
          } else {
            // Add new
            return {
              requirements: [saved, ...state.requirements]
            };
          }
        });
        return saved;
      }
      console.error('Failed to save requirement: HTTP', res.status);
    } catch (error) {
      console.error("Failed to save requirement", error);
    }
    return null;
  },

  deleteRequirement: async (requirementId) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, { method: 'DELETE' });
      if (res.ok) {
        set(state => ({
          requirements: state.requirements.filter(r => r.id !== requirementId),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? null
            : state.selectedRequirement
        }));
        return true;
      }
    } catch (error) {
      console.error("Failed to delete requirement", error);
    }
    return false;
  },

  bulkDeleteRequirements: async (ids) => {
    try {
      const res = await fetch(`/api/requirements?ids=${ids.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        set(state => ({
          requirements: state.requirements.filter(r => !ids.includes(r.id))
        }));
      }
    } catch (error) {
      console.error("Failed to bulk delete requirements", error);
    }
  },

  updateRequirementStatus: async (requirementId, status) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, status: updated.status } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, status: updated.status }
            : state.selectedRequirement
        }));
      }
    } catch (error) {
      console.error("Failed to update requirement status", error);
    }
  },

  updateRequirementOwner: async (requirementId, ownerId) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId })
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ownerId: updated.ownerId } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ownerId: updated.ownerId }
            : state.selectedRequirement
        }));
      }
    } catch (error) {
      console.error("Failed to update requirement owner", error);
    }
  },

  acceptRequirement: async (requirementId, userId, notes) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT', userId, notes })
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
      }
    } catch (error) {
      console.error("Failed to accept requirement", error);
    }
  },

  rejectRequirement: async (requirementId, userId, notes) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', userId, notes })
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
      }
    } catch (error) {
      console.error("Failed to reject requirement", error);
    }
  },

  linkTestCases: async (requirementId, testCaseIds) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseIds })
      });
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, testCases: updated.testCases } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, testCases: updated.testCases }
            : state.selectedRequirement
        }));
      }
    } catch (error) {
      console.error("Failed to link test cases", error);
    }
  },

  unlinkTestCase: async (requirementId, testCaseId) => {
    try {
      const res = await fetch(
        `/api/requirements/${requirementId}/testcases?testCaseId=${testCaseId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        const updated = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, testCases: updated.testCases } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, testCases: updated.testCases }
            : state.selectedRequirement
        }));
      }
    } catch (error) {
      console.error("Failed to unlink test case", error);
    }
  },

  // Review actions
  performReviewAction: async (requirementId, action, reviewerId, comment) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewerId, comment })
      });

      if (res.ok) {
        const { requirement: updated } = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || '操作失败' };
      }
    } catch (error) {
      console.error("Failed to perform review action", error);
      return { success: false, error: '网络错误' };
    }
  },

  submitForReview: async (requirementId, userId) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT', reviewerId: userId })
      });
      if (res.ok) {
        const { requirement: updated } = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || '操作失败' };
      }
    } catch (error) {
      console.error("Failed to submit for review", error);
      return { success: false, error: '网络错误' };
    }
  },

  approveReview: async (requirementId, reviewerId, comment) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', reviewerId, comment })
      });
      if (res.ok) {
        const { requirement: updated } = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || '操作失败' };
      }
    } catch (error) {
      console.error("Failed to approve review", error);
      return { success: false, error: '网络错误' };
    }
  },

  rejectReview: async (requirementId, reviewerId, comment) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reviewerId, comment })
      });
      if (res.ok) {
        const { requirement: updated } = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || '操作失败' };
      }
    } catch (error) {
      console.error("Failed to reject review", error);
      return { success: false, error: '网络错误' };
    }
  },

  requestChanges: async (requirementId, reviewerId, comment) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_CHANGES', reviewerId, comment })
      });
      if (res.ok) {
        const { requirement: updated } = await res.json();
        set(state => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updated } : r
          ),
          selectedRequirement: state.selectedRequirement?.id === requirementId
            ? { ...state.selectedRequirement, ...updated }
            : state.selectedRequirement
        }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || '操作失败' };
      }
    } catch (error) {
      console.error("Failed to request changes", error);
      return { success: false, error: '网络错误' };
    }
  },

  loadReviewHistory: async (requirementId) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}/review`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error("Failed to load review history", error);
    }
    return [];
  },

  setSelectedRequirement: (requirement) => {
    set({ selectedRequirement: requirement });
  }
});

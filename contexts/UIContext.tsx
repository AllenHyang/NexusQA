"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, TestStatus, ExecutionRecord } from '@/types';
import { TestCase as PrismaTestCase, TestStep as PrismaTestStep } from '@prisma/client';

interface UIContextType {
  // Project Modal
  showNewProjectModal: boolean;
  editingProject: Project | null;
  openNewProjectModal: () => void;
  openEditProjectModal: (project: Project) => void;
  closeNewProjectModal: () => void;

  // Test Case Modal
  showCaseModal: boolean;
  editCase: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>;
  openTestCaseModal: (testCase?: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>) => void;
  closeTestCaseModal: () => void;
  setEditCase: (testCase: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>) => void;

  // History Modal
  historyViewCase: (PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) | null;
  openHistoryModal: (testCase: PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) => void;
  closeHistoryModal: () => void;

  // Loading State (Global AI or Operations)
  loadingAI: boolean;
  setLoadingAI: (loading: boolean) => void;

  // Execution Form State (Shared for now, could be in TestCaseModal)
  executionNote: string;
  setExecutionNote: (note: string) => void;
  executionBugId: string;
  setExecutionBugId: (id: string) => void;
  executionEnv: string;
  setExecutionEnv: (env: string) => void;
  executionEvidence: string;
  setExecutionEvidence: (evidence: string) => void;
  
  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  // Project Modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Test Case Modal
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [editCase, setEditCase] = useState<Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>>({});

  // History Modal
  const [historyViewCase, setHistoryViewCase] = useState< (PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) | null>(null);

  // Loading
  const [loadingAI, setLoadingAI] = useState(false);

  // Execution Form
  const [executionNote, setExecutionNote] = useState("");
  const [executionBugId, setExecutionBugId] = useState("");
  const [executionEnv, setExecutionEnv] = useState("QA");
  const [executionEvidence, setExecutionEvidence] = useState("");
  
  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // -- Handlers --

  const openNewProjectModal = () => {
    setEditingProject(null);
    setShowNewProjectModal(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setShowNewProjectModal(true);
  };

  const closeNewProjectModal = () => {
    setShowNewProjectModal(false);
    setEditingProject(null);
  };

  const openTestCaseModal = (testCase: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }> = {}) => {
    setEditCase(testCase);
    // Reset execution form when opening standard modal? 
    // Maybe not, but for now let's keep simple.
    setExecutionNote("");
    setExecutionBugId("");
    setExecutionEnv("QA");
    setExecutionEvidence("");
    setShowCaseModal(true);
  };

  const closeTestCaseModal = () => {
    setShowCaseModal(false);
    setEditCase({});
  };

  const openHistoryModal = (testCase: PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) => {
    setHistoryViewCase(testCase);
  };

  const closeHistoryModal = () => {
    setHistoryViewCase(null);
  };

  return (
    <UIContext.Provider value={{
      showNewProjectModal, editingProject, openNewProjectModal, openEditProjectModal, closeNewProjectModal,
      showCaseModal, editCase, openTestCaseModal, closeTestCaseModal, setEditCase,
      historyViewCase, openHistoryModal, closeHistoryModal,
      loadingAI, setLoadingAI,
      executionNote, setExecutionNote,
      executionBugId, setExecutionBugId,
      executionEnv, setExecutionEnv,
      executionEvidence, setExecutionEvidence,
      searchQuery, setSearchQuery
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

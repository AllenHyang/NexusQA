"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project } from "@/types";
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
  modalMode: 'EDIT' | 'RUN'; // Added mode
  editCase: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>;
  openTestCaseModal: (testCase?: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>, mode?: 'EDIT' | 'RUN') => void; // Updated signature
  closeTestCaseModal: () => void;
  setEditCase: React.Dispatch<React.SetStateAction<Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>>>;

  // History Modal
  historyViewCase: (PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) | null;
  openHistoryModal: (testCase: PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) => void;
  closeHistoryModal: () => void;

  // Import Cases Modal
  showImportCasesModal: boolean;
  importTargetProjectId: string | null;
  openImportCasesModal: (projectId: string) => void;
  closeImportCasesModal: () => void;

  // Import Project Modal
  showImportProjectModal: boolean;
  openImportProjectModal: () => void;
  closeImportProjectModal: () => void;

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
  const [modalMode, setModalMode] = useState<'EDIT' | 'RUN'>('EDIT');
  const [editCase, setEditCase] = useState<Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>>({});

  // History Modal
  const [historyViewCase, setHistoryViewCase] = useState< (PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) | null>(null);

  // Import Cases Modal
  const [showImportCasesModal, setShowImportCasesModal] = useState(false);
  const [importTargetProjectId, setImportTargetProjectId] = useState<string | null>(null);

  // Import Project Modal
  const [showImportProjectModal, setShowImportProjectModal] = useState(false);

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

  const openTestCaseModal = (testCase: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }> = {}, mode: 'EDIT' | 'RUN' = 'EDIT') => {
    setEditCase(testCase);
    setModalMode(mode);
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
    setModalMode('EDIT'); // Reset to default
  };

  const openHistoryModal = (testCase: PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }) => {
    setHistoryViewCase(testCase);
  };

  const closeHistoryModal = () => {
    setHistoryViewCase(null);
  };

  const openImportCasesModal = (projectId: string) => {
    setImportTargetProjectId(projectId);
    setShowImportCasesModal(true);
  };

  const closeImportCasesModal = () => {
    setShowImportCasesModal(false);
    setImportTargetProjectId(null);
  };

  const openImportProjectModal = () => {
    setShowImportProjectModal(true);
  };

  const closeImportProjectModal = () => {
    setShowImportProjectModal(false);
  };

  return (
    <UIContext.Provider value={{
      showNewProjectModal, editingProject, openNewProjectModal, openEditProjectModal, closeNewProjectModal,
      showCaseModal, modalMode, editCase, openTestCaseModal, closeTestCaseModal, setEditCase,
      historyViewCase, openHistoryModal, closeHistoryModal,
      showImportCasesModal, importTargetProjectId, openImportCasesModal, closeImportCasesModal,
      showImportProjectModal, openImportProjectModal, closeImportProjectModal,
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

"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Defect } from "@/types";
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
  modalMode: 'EDIT' | 'RUN';
  editCase: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>;
  openTestCaseModal: (testCase?: Partial<PrismaTestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }>, mode?: 'EDIT' | 'RUN') => void;
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

  // Loading State
  loadingAI: boolean;
  setLoadingAI: (loading: boolean) => void;

  // Execution Form State
  executionNote: string;
  setExecutionNote: (note: string) => void;
  executionEnv: string;
  setExecutionEnv: (env: string) => void;
  executionEvidence: string;
  setExecutionEvidence: (evidence: string) => void;
  
  // Execution Defect Selection (New)
  executionSelectedDefectId: string | null;
  setExecutionSelectedDefectId: (id: string | null) => void;
  executionNewDefectData: Partial<Defect> | null;
  setExecutionNewDefectData: (data: Partial<Defect> | null) => void;
  
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
  const [executionEnv, setExecutionEnv] = useState("QA");
  const [executionEvidence, setExecutionEvidence] = useState("");
  
  // Defect Selection
  const [executionSelectedDefectId, setExecutionSelectedDefectId] = useState<string | null>(null);
  const [executionNewDefectData, setExecutionNewDefectData] = useState<Partial<Defect> | null>(null);
  
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
    setExecutionNote("");
    setExecutionEnv("QA");
    setExecutionEvidence("");
    // Reset defect fields
    setExecutionSelectedDefectId(null);
    setExecutionNewDefectData(null);
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
      executionEnv, setExecutionEnv,
      executionEvidence, setExecutionEvidence,
      executionSelectedDefectId, setExecutionSelectedDefectId,
      executionNewDefectData, setExecutionNewDefectData,
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
"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useUI } from "@/contexts/UIContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginView } from "@/views/LoginView";
import { NewProjectModal } from "@/components/NewProjectModal";
import { TestCaseModal } from "@/components/TestCaseModal";
import { HistoryModal } from "@/components/HistoryModal";
import { ExecutionRecord, Project, TestCase, TestStatus } from "@/types";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  
  // Store
  const { 
    currentUser, users, login, logout,
    projects, suites, refreshData,
    createProject, updateProject, deleteProject,
    saveTestCase, 
    generateStepsForCase, generateMockupForCase
  } = useAppStore();

  useEffect(() => {
    refreshData();
  }, []);

  // UI Context
  const {
    showNewProjectModal, editingProject, closeNewProjectModal,
    showCaseModal, editCase, closeTestCaseModal, setEditCase,
    historyViewCase, closeHistoryModal,
    loadingAI, setLoadingAI,
    executionNote, setExecutionNote,
    executionBugId, setExecutionBugId,
    executionEnv, setExecutionEnv,
    executionEvidence, setExecutionEvidence,
  } = useUI();

  // --- Handlers ---

  const handleCreateProjectWrapper = async (data: Partial<Project>) => {
    setLoadingAI(true);
    if (editingProject) {
      await updateProject({ ...editingProject, ...data } as Project); 
    } else {
      await createProject(data);
    }
    setLoadingAI(false);
    closeNewProjectModal();
  };

  const handleSaveTestCaseWrapper = async () => {
    if (!editCase.title || !editCase.projectId) return;
    await saveTestCase(editCase);
    closeTestCaseModal();
  };

  const handleGenerateSteps = async () => {
    setLoadingAI(true);
    const steps = await generateStepsForCase(editCase.title || "", editCase.description || "");
    setEditCase({ ...editCase, steps });
    setLoadingAI(false);
  };
  
  const handleGenerateMockup = async () => {
    setLoadingAI(true);
    const img = await generateMockupForCase(editCase.title + " " + editCase.userStory);
    if (img) setEditCase({ ...editCase, visualReference: img });
    setLoadingAI(false);
  };

  const handleExecute = async (status: TestStatus) => {
    if (!editCase.id) return;
    
    const newRecord: ExecutionRecord = {
        id: `ex-${Date.now()}`,
        date: new Date().toISOString(),
        status,
        executedBy: currentUser!.name,
        notes: executionNote,
        bugId: status === "FAILED" ? executionBugId : undefined,
        environment: executionEnv,
        evidence: executionEvidence
    };

    const updatedCase = {
        ...editCase,
        status,
        history: [...(editCase.history || []), newRecord]
    } as TestCase;

    await saveTestCase(updatedCase);
    
    // Reset form
    setExecutionNote("");
    setExecutionBugId("");
    setExecutionEnv("QA");
    setExecutionEvidence("");
    
    closeTestCaseModal();
  };

  // --- Render ---

  if (!currentUser) {
    return <LoginView users={users} onLogin={login} />;
  }

  return (
    <>
      <MainLayout 
        currentUser={currentUser} 
        projects={projects} 
        onLogout={logout} 
        t={t}
      >
        {children}
      </MainLayout>

      {/* Global Modals */}
      {showNewProjectModal && (
          <NewProjectModal 
            onClose={closeNewProjectModal}
            onSubmit={handleCreateProjectWrapper}
            loadingAI={loadingAI}
            initialData={editingProject}
          />
      )}

      {showCaseModal && (
          <TestCaseModal 
            editCase={editCase}
            setEditCase={setEditCase}
            onClose={closeTestCaseModal}
            onSave={handleSaveTestCaseWrapper}
            loadingAI={loadingAI}
            onGenerateSteps={handleGenerateSteps}
            onGenerateImage={handleGenerateMockup}
            currentUser={currentUser}
            executionNote={executionNote}
            setExecutionNote={setExecutionNote}
            executionBugId={executionBugId}
            setExecutionBugId={setExecutionBugId}
            executionEnv={executionEnv}
            setExecutionEnv={setExecutionEnv}
            executionEvidence={executionEvidence}
            setExecutionEvidence={setExecutionEvidence}
            onExecute={handleExecute}
            suites={suites}
          />
      )}
      
      {historyViewCase && (
          <HistoryModal 
            testCase={historyViewCase}
            onClose={closeHistoryModal}
            defectTrackerUrl="" // TODO: Add global settings context for this
          />
      )}
    </>
  );
}

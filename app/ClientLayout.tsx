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
import { XCircle } from "lucide-react"; // Added XCircle for toast component

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000); // Toast disappears after 5 seconds
  };
  
  // Store
  const { 
    currentUser, users, login, logout,
    projects, suites, refreshData,
    createProject, updateProject,
    saveTestCase, 
    generateStepsForCase, generateMockupForCase
  } = useAppStore();

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      refreshData();
      initialized.current = true;
    }
  }, [refreshData]);

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
      await updateProject({ ...editingProject, ...data } as Project, showToast); 
    } else {
      await createProject(data, showToast);
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
    setEditCase({ steps: [] }); // Clear steps before starting generation
    try {
      await generateStepsForCase(editCase.title || "", editCase.description || "", setEditCase, showToast);
    } catch (error) {
      console.error("Error in handleGenerateSteps:", error);
      showToast("An unexpected error occurred during step generation.", 'error');
    } finally {
      setLoadingAI(false);
    }
  };
  
  const handleGenerateMockup = async () => {
    setLoadingAI(true);
    const result = await generateMockupForCase(editCase.title + " " + editCase.userStory, showToast);
    if (result) setEditCase({ ...editCase, visualReference: result });
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

  const handleStepFeedback = (stepId: string, feedback: 'up' | 'down') => {
    if (!editCase || !editCase.steps) return;

    const updatedSteps = editCase.steps.map(step => 
      step.id === stepId ? { ...step, feedback: step.feedback === feedback ? undefined : feedback } : step
    );
    setEditCase({ ...editCase, steps: updatedSteps });
  };

  const handleVisualFeedback = (feedback: 'up' | 'down') => {
    if (!editCase) return;

    const updatedFeedback = editCase.imageFeedback === feedback ? undefined : feedback;
    setEditCase({ ...editCase, imageFeedback: updatedFeedback });
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
            onStepFeedback={handleStepFeedback}
            onVisualFeedback={handleVisualFeedback}
          />
      )}
      
      {historyViewCase && (
          <HistoryModal 
            testCase={historyViewCase}
            onClose={closeHistoryModal}
            defectTrackerUrl="" // TODO: Add global settings context for this
          />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[99] space-y-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`relative p-4 pr-10 rounded-xl shadow-lg text-white max-w-sm transform transition-all duration-300 ease-out animate-in slide-in-from-right-8 fade-in ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            {toast.message}
            <button 
              onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

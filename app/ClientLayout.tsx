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
import { ImportCasesModal } from "@/components/ImportCasesModal";
import { ExecutionRecord, Project, TestCase, TestStatus, Priority, TestStep } from "@/types";
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
    showImportCasesModal, importTargetProjectId, closeImportCasesModal,
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

    const frontendTestCase: Partial<TestCase> = {
      id: editCase.id,
      projectId: editCase.projectId,
      suiteId: editCase.suiteId,
      title: editCase.title,
      description: editCase.description,
      userStory: editCase.userStory,
      requirementId: editCase.requirementId,
      preconditions: editCase.preconditions,
      status: editCase.status as TestStatus,
      priority: editCase.priority as Priority,
      authorId: editCase.authorId,
      assignedToId: editCase.assignedToId,
      visualReference: editCase.visualReference,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((editCase as any).imageFeedback !== undefined && { imageFeedback: (editCase as any).imageFeedback }),
      history: editCase.history,
      steps: editCase.steps as TestStep[], // Cast steps as well
      // tags and dates handled below
      createdAt: editCase.createdAt instanceof Date ? editCase.createdAt.toISOString() : editCase.createdAt as string | undefined,
      updatedAt: editCase.updatedAt instanceof Date ? editCase.updatedAt.toISOString() : editCase.updatedAt as string | undefined,
    };

    // Handle tags conversion
    if (typeof editCase.tags === 'string') {
      try {
        frontendTestCase.tags = JSON.parse(editCase.tags);
      } catch (e) {
        console.error("Failed to parse tags string:", editCase.tags, e);
        frontendTestCase.tags = [];
      }
    } else if (editCase.tags) {
      frontendTestCase.tags = editCase.tags;
    }

    await saveTestCase(frontendTestCase);
    closeTestCaseModal();
  };

  const handleGenerateSteps = async () => {
    setLoadingAI(true);
    setEditCase({ steps: [] }); // Clear steps before starting generation
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateStepsForCase(editCase.title || "", editCase.description || "", setEditCase as any, showToast);
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

    const updatedCase: Partial<TestCase> = {
        ...editCase as unknown as Partial<TestCase>,
        status,
        history: [...(editCase.history || []), newRecord]
    };

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      step.id === stepId ? { ...step, feedback: (step as any).feedback === feedback ? undefined : feedback } : step
    );
    setEditCase({ ...editCase, steps: updatedSteps });
  };

  const handleVisualFeedback = (feedback: 'up' | 'down') => {
    if (!editCase) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedFeedback = (editCase as any).imageFeedback === feedback ? undefined : feedback;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setEditCase({ ...editCase, imageFeedback: updatedFeedback } as any);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            editCase={editCase as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setEditCase={setEditCase as any}
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

      {showImportCasesModal && importTargetProjectId && (
        <ImportCasesModal 
          projectId={importTargetProjectId}
          onClose={closeImportCasesModal}
          onImport={async (projectId, data) => {
            setLoadingAI(true);
            try {
              const res = await fetch('/api/testcases/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, cases: data }),
              });

              if (!res.ok) throw new Error('Import failed');

              const result = await res.json();
              showToast(`Successfully imported ${result.count} test cases.`, 'success');
              refreshData(); // Refresh the project data to show new cases
              closeImportCasesModal();
            } catch (error) {
              console.error("Import error:", error);
              showToast("Failed to import test cases. Please try again.", 'error');
            } finally {
              setLoadingAI(false);
            }
          }}
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

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
import { ImportProjectModal } from "@/components/ImportProjectModal";
import { ExecutionRecord, Project, TestCase, TestStatus, Priority, TestStep, ReviewStatus, Defect } from "@/types";
import { XCircle } from "lucide-react"; 
import { safeParseTags } from "@/lib/formatters";

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
    }, 5000); 
  };
  
  // Store
  const { 
    currentUser, users, login, logout,
    projects, suites, defects, refreshData,
    createProject, updateProject,
    saveTestCase, 
    generateStepsForCase, generateMockupForCase, generateFieldForCase
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
    showCaseModal, modalMode, editCase, closeTestCaseModal, setEditCase,
    historyViewCase, closeHistoryModal,
    showImportCasesModal, importTargetProjectId, closeImportCasesModal,
    showImportProjectModal, closeImportProjectModal,
    loadingAI, setLoadingAI,
    executionNote, setExecutionNote,
    executionEnv, setExecutionEnv,
    executionEvidence, setExecutionEvidence,
    
    executionSelectedDefectId, setExecutionSelectedDefectId,
    executionNewDefectData, setExecutionNewDefectData,
    executionStagedFiles, setExecutionStagedFiles,
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

    const resolvedAuthorId = editCase.authorId || currentUser?.id;

    const frontendTestCase: Partial<TestCase> = {
      id: editCase.id,
      projectId: editCase.projectId,
      suiteId: editCase.suiteId || undefined,
      title: editCase.title,
      description: editCase.description || undefined,
      userStory: editCase.userStory || undefined,
      requirementId: editCase.requirementId || undefined,
      acceptanceCriteria: editCase.acceptanceCriteria || undefined,
      preconditions: editCase.preconditions || "",
      status: editCase.status as TestStatus,
      priority: editCase.priority as Priority,
      reviewStatus: (editCase.reviewStatus as ReviewStatus) || undefined, 
      authorId: resolvedAuthorId,
      assignedToId: editCase.assignedToId || undefined,
      visualReference: editCase.visualReference || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((editCase as any).imageFeedback !== undefined && { imageFeedback: (editCase as any).imageFeedback }),
      history: editCase.history,
      steps: editCase.steps as TestStep[],
      createdAt: editCase.createdAt && typeof editCase.createdAt !== "string" && editCase.createdAt instanceof Date
        ? editCase.createdAt.toISOString()
        : (editCase.createdAt as string | undefined),
      updatedAt: editCase.updatedAt && typeof editCase.updatedAt !== "string" && editCase.updatedAt instanceof Date
        ? editCase.updatedAt.toISOString()
        : (editCase.updatedAt as string | undefined),
    };

    if (editCase.tags) {
      frontendTestCase.tags = safeParseTags(editCase.tags);
    }

    await saveTestCase(frontendTestCase);
    closeTestCaseModal();
  };

  const handleGenerateSteps = async () => {
    setLoadingAI(true);
    setEditCase((prev: Partial<TestCase>) => ({ ...prev, steps: [] })); 
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateStepsForCase(
        editCase.title || "", 
        editCase.description || "", 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (partial: Partial<TestCase>) => setEditCase((prev: Partial<TestCase>) => ({ ...prev, ...partial })), 
        showToast
      );
    } catch (error) {
      console.error("Error in handleGenerateSteps:", error);
      showToast("An unexpected error occurred during step generation.", 'error');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerateField = async (field: 'userStory' | 'acceptanceCriteria' | 'preconditions') => {
    if (!editCase.title) return;
    setLoadingAI(true);
    setEditCase((prev: Partial<TestCase>) => ({ ...prev, [field]: "" }));
    try {
      const relatedFields = { // Reintroduce relatedFields
          userStory: editCase.userStory || "",
          description: editCase.description || "",
          acceptanceCriteria: editCase.acceptanceCriteria || ""
      };
      await generateFieldForCase(
        editCase.title,
        field,
        editCase.description || "",
        relatedFields,
        (val: string) => setEditCase((prev: Partial<TestCase>) => ({ ...prev, [field]: val })),
        showToast
      );
    } catch (error) {
      console.error("Error generating field:", error);
      showToast("Failed to generate text.", 'error');
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

    // Validation: Enforce Bug Selection for FAILED
    if (status === "FAILED" && !executionSelectedDefectId && !executionNewDefectData) {
      showToast("Defect is required when marking a test as FAILED. Please select existing or create new.", 'error');
      return;
    }

    let defectPayload: Partial<Defect> | { id: string } | null = null;
    if (status === "FAILED") {
        if (executionSelectedDefectId) {
            defectPayload = { id: executionSelectedDefectId };
        } else if (executionNewDefectData) {
            defectPayload = {
                title: executionNewDefectData.title,
                severity: executionNewDefectData.severity,
            };
        }
    }

    const newRecord: ExecutionRecord = {
        id: `ex-${Date.now()}`,
        date: new Date().toISOString(),
        status,
        executedBy: currentUser!.name,
        notes: executionNote,
        environment: executionEnv,
        evidence: executionEvidence,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defects: defectPayload ? [defectPayload as any] : []
    };

    const updatedCase: Partial<TestCase> = {
        ...editCase as unknown as Partial<TestCase>,
        status,
        history: [...(editCase.history || []), newRecord]
    };

    const resultCase = await saveTestCase(updatedCase);

    if (resultCase) {
        // Upload staged files to the newly created execution record
        if (executionStagedFiles.length > 0 && resultCase.history && resultCase.history.length > 0) {
            // Get the latest execution record (which we just created)
            const latestExecution = resultCase.history[resultCase.history.length - 1];

            try {
                const formData = new FormData();
                formData.append('executionId', latestExecution.id);
                formData.append('uploadedBy', currentUser!.id);
                executionStagedFiles.forEach(file => {
                    formData.append('files', file);
                });

                const uploadRes = await fetch('/api/attachments', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) {
                    const errData = await uploadRes.json();
                    showToast(`Warning: ${errData.error || 'Failed to upload some attachments'}`, 'error');
                } else {
                    const uploadData = await uploadRes.json();
                    // Update the execution record with attachments
                    latestExecution.attachments = uploadData.attachments;
                }
            } catch (uploadError) {
                console.error('Attachment upload error:', uploadError);
                showToast('Warning: Failed to upload attachments', 'error');
            }
        }

        setEditCase(resultCase);
    }

    // Reset form for next execution (but don't close modal)
    setExecutionNote("");
    setExecutionEnv("QA");
    setExecutionEvidence("");
    setExecutionSelectedDefectId(null);
    setExecutionNewDefectData(null);
    setExecutionStagedFiles([]);

    // Show success feedback instead of closing
    showToast(`Test case marked as ${status}`, 'success');

    // Don't close modal - user can review history, re-execute, or manually close
    // closeTestCaseModal();
  };

  const handleStepFeedback = (stepId: string, feedback: 'up' | 'down') => {
    if (!editCase || !editCase.steps) return;

    const updatedSteps = editCase.steps.map((step: TestStep) => 
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

  if (!currentUser) {
    return <LoginView users={users} onLogin={login} />;
  }

  const projectDefects = defects.filter(d => d.projectId === editCase.projectId);

  return (
    <>
      <MainLayout 
        currentUser={currentUser} 
        projects={projects} 
        onLogout={logout} 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t={t as any}
      >
        {children}
      </MainLayout>

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
            executionEnv={executionEnv}
            setExecutionEnv={setExecutionEnv}
            executionEvidence={executionEvidence}
            setExecutionEvidence={setExecutionEvidence}

            executionStagedFiles={executionStagedFiles}
            setExecutionStagedFiles={setExecutionStagedFiles}

            defects={projectDefects}
            executionSelectedDefectId={executionSelectedDefectId}
            setExecutionSelectedDefectId={setExecutionSelectedDefectId}
            executionNewDefectData={executionNewDefectData}
            setExecutionNewDefectData={setExecutionNewDefectData}
            
            onExecute={handleExecute}
            suites={suites}
            onStepFeedback={handleStepFeedback}
            onVisualFeedback={handleVisualFeedback}
            onGenerateField={handleGenerateField}
            mode={modalMode}
          />
      )}
      
      {historyViewCase && (
          <HistoryModal 
            testCase={historyViewCase}
            onClose={closeHistoryModal}
            defectTrackerUrl="" 
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
                    refreshData(); 
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
      
            {showImportProjectModal && (
              <ImportProjectModal
                onClose={closeImportProjectModal}
                onImport={async (file) => {
                  setLoadingAI(true);
                  try {
                    const text = await file.text();
                    const json = JSON.parse(text);
                    
                    const res = await fetch('/api/projects/import', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(json),
                    });
      
                    if (!res.ok) {
                      const err = await res.json();
                      throw new Error(err.error || 'Import failed');
                    }
      
                    const result = await res.json();
                    showToast(`Project "${result.project.name}" imported successfully.`, 'success');
                    refreshData();
                    closeImportProjectModal();
                  } catch (error) {
                    console.error("Import error:", error);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    showToast((error as any).message || "Failed to import project.", 'error');
                    throw error; 
                  } finally {
                    setLoadingAI(false);
                  }
                }}
              />
            )}
      
            {/* Toast Notifications */}      <div className="fixed bottom-4 right-4 z-[99] space-y-2">
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

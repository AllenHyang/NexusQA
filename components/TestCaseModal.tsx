import React from "react";
import { TestCase, TestStatus, User, TestSuite, Defect, InternalRequirement } from "../types";
import { StatusBadge } from "./ui";
import { XCircle, CheckCircle2 } from "lucide-react";
import { TestCaseForm } from "./TestCase/TestCaseForm";
import { TestStepList } from "./TestCase/TestStepList";
import { VisualReference } from "./TestCase/VisualReference";
import { ExecutionPanel } from "./TestCase/ExecutionPanel";
import { ExecutionHistoryPanel } from "./TestCase/ExecutionHistoryPanel";

interface TestCaseModalProps {
  onClose: () => void;
  editCase: Partial<TestCase>;
  setEditCase: (c: Partial<TestCase>) => void;
  onSave: () => void;
  loadingAI: boolean;
  onGenerateSteps: () => void;
  onGenerateImage: () => void;
  currentUser: User;
  executionNote: string;
  setExecutionNote: (s: string) => void;
  executionEnv: string;
  setExecutionEnv: (s: string) => void;
  executionEvidence: string;
  setExecutionEvidence: (s: string) => void;

  // Evidence Attachments (F-TE-005)
  executionStagedFiles: File[];
  setExecutionStagedFiles: (files: File[]) => void;

  // New Defect Props
  defects: Defect[];
  executionSelectedDefectId: string | null;
  setExecutionSelectedDefectId: (id: string | null) => void;
  executionNewDefectData: Partial<Defect> | null;
  setExecutionNewDefectData: (data: Partial<Defect> | null) => void;

  onExecute: (status: TestStatus) => void;
  suites: TestSuite[];
  requirements?: InternalRequirement[];
  onStepFeedback: (stepId: string, feedback: 'up' | 'down') => void;
  onVisualFeedback: (feedback: 'up' | 'down') => void;
  onGenerateField: (field: 'userStory' | 'acceptanceCriteria' | 'preconditions') => void;
  mode?: 'EDIT' | 'RUN';
}

export function TestCaseModal({
  onClose,
  editCase,
  setEditCase,
  onSave,
  loadingAI,
  onGenerateSteps,
  onGenerateImage,
  currentUser,
  executionNote,
  setExecutionNote,
  executionEnv,
  setExecutionEnv,
  executionEvidence,
  setExecutionEvidence,
  executionStagedFiles,
  setExecutionStagedFiles,

  defects,
  executionSelectedDefectId,
  setExecutionSelectedDefectId,
  executionNewDefectData,
  setExecutionNewDefectData,

  onExecute,
  suites,
  requirements = [],
  onStepFeedback,
  onVisualFeedback,
  onGenerateField,
  mode = 'EDIT'
}: TestCaseModalProps) {
  const isRunMode = mode === 'RUN';
  
  return (
    <div className="fixed inset-0 modal-overlay flex items-end sm:items-center justify-center z-50 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full max-w-6xl h-[90vh] sm:h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-zinc-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-zinc-100 bg-zinc-50/50 backdrop-blur-md z-20">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h3 className="text-base sm:text-xl font-black text-zinc-900 tracking-tight truncate">{isRunMode ? "Execute Test Case" : (editCase.id ? "Test Case Details" : "New Test Case")}</h3>
              {editCase.status && <StatusBadge status={editCase.status} />}
            </div>
            <p className="text-xs font-medium text-zinc-500 mt-1 sm:mt-1.5 hidden sm:block">{isRunMode ? "Review steps and log execution results." : "Use Case Driven Development: Define story, steps, and expected results."}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 transition-colors flex-shrink-0"><XCircle className="w-6 h-6 text-zinc-400 hover:text-zinc-600 transition-colors" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 custom-scrollbar bg-white">
          {/* Left Column: Form */}
          <div className="space-y-6">
            {!isRunMode && (
                <TestCaseForm
                    editCase={editCase}
                    setEditCase={setEditCase}
                    suites={suites}
                    currentUser={currentUser}
                    onGenerateField={onGenerateField}
                    loadingAI={loadingAI}
                    requirements={requirements}
                />
            )}
            {isRunMode && (
                <div className="glass-panel p-6 rounded-2xl border border-zinc-200 shadow-sm bg-zinc-50">
                    <h4 className="text-lg font-bold text-zinc-900 mb-2">{editCase.title}</h4>
                    <p className="text-sm text-zinc-600 mb-4">{editCase.description}</p>
                    <div className="text-xs text-zinc-500 space-y-2">
                        {editCase.preconditions && <p><strong>Preconditions:</strong> {editCase.preconditions}</p>}
                    </div>
                </div>
            )}

            <TestStepList 
                steps={editCase.steps || []}
                onUpdateSteps={(steps) => !isRunMode && setEditCase({ ...editCase, steps })} // Read-only in run mode
                onGenerate={onGenerateSteps}
                loadingAI={loadingAI}
                hasTitle={!!editCase.title}
                onFeedback={onStepFeedback} 
                readOnly={isRunMode} // Assuming TestStepList supports readOnly or I need to check it
            />
          </div>

          {/* Right Column: Visuals, Execution, History */}
          <div className="space-y-8">
            {!isRunMode && (
                <VisualReference 
                    imageUrl={editCase.visualReference}
                    onGenerate={onGenerateImage}
                    loadingAI={loadingAI}
                    hasTitle={!!editCase.title}
                    onFeedback={onVisualFeedback} 
                    imageFeedback={editCase.imageFeedback} 
                />
            )}

            {isRunMode && editCase.visualReference && (
                 <div className="rounded-xl overflow-hidden border border-zinc-200">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={editCase.visualReference} alt="Visual Ref" className="w-full h-48 object-cover" />
                 </div>
            )}

            {(currentUser.role === "TESTER" || isRunMode) && (
              <ExecutionPanel
                env={executionEnv}
                setEnv={setExecutionEnv}
                evidence={executionEvidence}
                setEvidence={setExecutionEvidence}
                note={executionNote}
                setNote={setExecutionNote}

                stagedFiles={executionStagedFiles}
                onStagedFilesChange={setExecutionStagedFiles}

                projectDefects={defects}
                selectedDefectId={executionSelectedDefectId}
                onSelectDefectId={setExecutionSelectedDefectId}
                newDefectData={executionNewDefectData}
                onNewDefectData={setExecutionNewDefectData}

                onExecute={onExecute}
                reviewStatus={editCase.reviewStatus}
                currentStatus={editCase.status}
              />
            )}

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ExecutionHistoryPanel history={editCase.history || []} testCase={editCase as any} />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/80 backdrop-blur-md flex justify-end space-x-2 sm:space-x-4 z-10">
          <button onClick={onClose} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-zinc-200 rounded-xl sm:rounded-2xl text-zinc-600 font-bold hover:bg-zinc-50 shadow-sm transition-colors text-sm sm:text-base">Close</button>
          {!isRunMode && (
            <button
                onClick={onSave}
                disabled={!editCase.title}
                className="px-4 sm:px-8 py-2.5 sm:py-3 bg-zinc-900 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-black shadow-lg shadow-zinc-900/10 flex items-center transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none text-sm sm:text-base">
                <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
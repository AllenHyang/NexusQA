import React from "react";
import { TestCase, TestStatus, User, TestSuite } from "../types";
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
  executionBugId: string;
  setExecutionBugId: (s: string) => void;
  executionEnv: string;
  setExecutionEnv: (s: string) => void;
  executionEvidence: string;
  setExecutionEvidence: (s: string) => void;
  onExecute: (status: TestStatus) => void;
  suites: TestSuite[]; 
  onStepFeedback: (stepId: string, feedback: 'up' | 'down') => void;
  onVisualFeedback: (feedback: 'up' | 'down') => void; // New prop
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
  executionBugId,
  setExecutionBugId,
  executionEnv,
  setExecutionEnv,
  executionEvidence,
  setExecutionEvidence,
  onExecute,
  suites,
  onStepFeedback,
  onVisualFeedback // Destructure new prop
}: TestCaseModalProps) {
  
  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-zinc-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 backdrop-blur-md z-20">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">{editCase.id ? "Test Case Details" : "New Test Case"}</h3>
              {editCase.status && <StatusBadge status={editCase.status} />}
            </div>
            <p className="text-xs font-medium text-zinc-500 mt-1.5">Use Case Driven Development: Define story, steps, and expected results.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 transition-colors"><XCircle className="w-6 h-6 text-zinc-400 hover:text-zinc-600 transition-colors" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 custom-scrollbar bg-white">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <TestCaseForm 
                editCase={editCase} 
                setEditCase={setEditCase} 
                suites={suites} 
                currentUser={currentUser}
            />

            <TestStepList 
                steps={editCase.steps || []}
                onUpdateSteps={(steps) => setEditCase({ ...editCase, steps })}
                onGenerate={onGenerateSteps}
                loadingAI={loadingAI}
                hasTitle={!!editCase.title}
                onFeedback={onStepFeedback} // Pass new prop
            />
          </div>

          {/* Right Column: Visuals, Execution, History */}
          <div className="space-y-8">
            <VisualReference 
                imageUrl={editCase.visualReference}
                onGenerate={onGenerateImage}
                loadingAI={loadingAI}
                hasTitle={!!editCase.title}
                onFeedback={onVisualFeedback} // Pass new prop
                imageFeedback={editCase.imageFeedback} // Pass new prop
            />

            {currentUser.role === "TESTER" && (
              <ExecutionPanel 
                env={executionEnv}
                setEnv={setExecutionEnv}
                evidence={executionEvidence}
                setEvidence={setExecutionEvidence}
                note={executionNote}
                setNote={setExecutionNote}
                bugId={executionBugId}
                setBugId={setExecutionBugId}
                onExecute={onExecute}
              />
            )}

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ExecutionHistoryPanel history={editCase.history || []} testCase={editCase as any} />
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/80 backdrop-blur-md flex justify-end space-x-4 z-10">
          <button onClick={onClose} className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-zinc-600 font-bold hover:bg-zinc-50 shadow-sm transition-colors">Close</button>
          <button 
            onClick={onSave}
            disabled={!editCase.title}
            className="px-8 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black shadow-lg shadow-zinc-900/10 flex items-center transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { TestCase, TestStatus, TestStep, Priority, User } from "../types";
import { StatusBadge, AILoader, TagBadge } from "./ui";
import { ExecutionHistoryList } from "./ExecutionHistory";
import { XCircle, Sparkles, Plus, ImageIcon, CheckCircle2, AlertCircle, History, BookOpen, Link2, Tag, Monitor, Paperclip } from "lucide-react";

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
  onExecute
}: TestCaseModalProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && tagInput.trim()) {
          const newTags = [...(editCase.tags || []), tagInput.trim()];
          setEditCase({ ...editCase, tags: Array.from(new Set(newTags)) });
          setTagInput("");
      }
  };

  const removeTag = (t: string) => {
      setEditCase({ ...editCase, tags: editCase.tags?.filter(tag => tag !== t) });
  };

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
            {/* Title and Requirement */}
            <div className="glass-input p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Test Case Title</label>
              <input 
                type="text" 
                className="w-full text-xl font-bold border-b-2 border-zinc-100 focus:border-zinc-900 outline-none px-0 py-2 bg-transparent placeholder-zinc-300 transition-colors text-zinc-800"
                placeholder="e.g. Verify successful login with valid credentials"
                value={editCase.title || ""}
                onChange={e => setEditCase({...editCase, title: e.target.value})}
              />
              <div className="flex items-center mt-5 pt-4 border-t border-zinc-100">
                 <Link2 className="w-4 h-4 text-zinc-400 mr-2" />
                 <input 
                    type="text" 
                    className="flex-1 text-sm outline-none text-zinc-500 placeholder-zinc-300 bg-transparent font-medium"
                    placeholder="Requirement ID (e.g. JIRA-1024, REQ-50)"
                    value={editCase.requirementId || ""}
                    onChange={e => setEditCase({...editCase, requirementId: e.target.value})}
                 />
              </div>
            </div>

            {/* Tags Input */}
            <div className="glass-input p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1.5" /> Tags
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {editCase.tags?.map(tag => (
                        <TagBadge key={tag} label={tag} onRemove={() => removeTag(tag)} />
                    ))}
                </div>
                <input 
                    type="text" 
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all bg-white text-zinc-800 placeholder-zinc-400"
                    placeholder="Type tag and press Enter..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                />
            </div>

            {/* User Story Section */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm">
              <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
                 <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                 User Story
              </label>
              <textarea 
                className="w-full px-4 py-3 border border-blue-100 rounded-xl text-sm bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-colors min-h-[80px] font-medium text-zinc-800 placeholder-zinc-400"
                placeholder="As a [User], I want to [Action], so that [Benefit]..."
                value={editCase.userStory || ""}
                onChange={e => setEditCase({...editCase, userStory: e.target.value})}
              />
              <p className="text-[10px] text-blue-400 mt-2 font-bold">Defines the business value and context for this test case.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="glass-input p-5 rounded-2xl border border-zinc-200 shadow-sm">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Priority</label>
                <select 
                  value={editCase.priority || "MEDIUM"}
                  onChange={e => setEditCase({...editCase, priority: e.target.value as Priority})}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none transition-shadow text-zinc-800">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="glass-input p-5 rounded-2xl border border-zinc-200 shadow-sm">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Current Status</label>
                <div className="px-3 py-2 text-sm font-bold text-zinc-800">{editCase.status || "UNTESTED"}</div>
              </div>
            </div>

            <div className="glass-input p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Preconditions & Setup</label>
              <textarea 
                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm bg-white focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-zinc-900/5 font-medium text-zinc-800 placeholder-zinc-400"
                placeholder="e.g. User is on the login page, Database is reset..."
                value={editCase.description || ""} 
                onChange={e => setEditCase({...editCase, description: e.target.value})}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Test Steps</label>
                <button 
                  onClick={onGenerateSteps}
                  disabled={loadingAI || !editCase.title}
                  className="text-xs bg-zinc-900 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-black transition-all flex items-center font-bold disabled:opacity-50 disabled:cursor-not-allowed group transform hover:-translate-y-0.5">
                  {loadingAI ? <AILoader /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 group-hover:text-yellow-400 transition-colors" />}
                  <span className="ml-1">{editCase.steps && editCase.steps.length > 0 ? "Regenerate with AI" : "Generate with AI"}</span>
                </button>
              </div>
              <div className="space-y-3">
                {editCase.steps?.map((step, idx) => (
                  <div key={step.id || idx} className="flex items-start p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm group hover:border-zinc-300 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300" style={{animationDelay: `${idx * 50}ms`}}>
                    <span className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-bold mr-4 flex-shrink-0 mt-0.5 group-hover:bg-zinc-900 group-hover:text-white transition-all">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-800 text-sm leading-relaxed">{step.action}</p>
                      <p className="text-zinc-500 mt-1.5 text-xs font-medium bg-zinc-50 p-2 rounded-lg inline-block border border-zinc-100">Expect: {step.expected}</p>
                    </div>
                    <button onClick={() => {
                      const newSteps = editCase.steps?.filter((_, i) => i !== idx);
                      setEditCase({...editCase, steps: newSteps});
                    }} className="text-zinc-300 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-all"><XCircle className="w-5 h-5"/></button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newStep: TestStep = { id: Date.now().toString(), action: "New Action", expected: "Expected Result" };
                    setEditCase({ ...editCase, steps: [...(editCase.steps || []), newStep] });
                  }}
                  className="w-full py-4 flex items-center justify-center border-2 border-zinc-200 border-dashed rounded-2xl text-sm text-zinc-400 hover:bg-zinc-50 hover:border-zinc-400 hover:text-zinc-600 transition-all font-bold group">
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Add Manual Step
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visuals, Execution, History */}
          <div className="space-y-8">
            {/* Visual Reference */}
            <div className="glass-panel rounded-3xl p-6 h-fit bg-white border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-zinc-800 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-yellow-500" />
                  Visual Reference
                </h4>
                <button 
                  onClick={onGenerateImage}
                  disabled={loadingAI || !editCase.title}
                  className="text-xs text-zinc-600 hover:text-zinc-900 font-bold hover:underline disabled:opacity-50 flex items-center bg-zinc-50 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200"
                >
                  {loadingAI && <span className="mr-1.5"><AILoader /></span>}
                  Generate Mockup
                </button>
              </div>
              <div className="aspect-video bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center overflow-hidden relative group transition-all shadow-inner">
                {editCase.visualReference ? (
                  <>
                    <img src={editCase.visualReference} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Ref" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end justify-end p-4">
                      <a href={editCase.visualReference} download="mockup.png" className="opacity-0 group-hover:opacity-100 bg-white p-3 rounded-xl shadow-lg hover:scale-110 transition-all border border-zinc-100">
                        <ImageIcon className="w-5 h-5 text-zinc-800"/>
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-10">
                    {loadingAI ? (
                        <div className="flex flex-col items-center animate-pulse">
                             <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-yellow-500 animate-spin-slow" />
                             </div>
                             <p className="text-sm text-zinc-500 font-bold">AI is imagining the UI...</p>
                        </div>
                    ) : (
                        <>
                            <ImageIcon className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                            <p className="text-xs text-zinc-400 max-w-[200px] mx-auto leading-relaxed font-medium">Generate a visual reference to help testers understand the expected UI.</p>
                        </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Execution Panel */}
            {currentUser.role === "TESTER" && (
              <div className="glass-panel rounded-3xl p-6 border-l-4 border-l-yellow-500 bg-white shadow-xl">
                <h4 className="font-bold text-zinc-800 mb-5 flex items-center text-lg">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-yellow-500"/>
                  Execute Test
                </h4>
                <div className="mb-5 space-y-4">
                   <div className="flex gap-4">
                       <div className="flex-1 relative group">
                          <Monitor className="w-4 h-4 text-zinc-400 absolute left-3 top-3 group-focus-within:text-zinc-800 transition-colors" />
                          <input 
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                            placeholder="Env (e.g. Chrome)"
                            value={executionEnv}
                            onChange={e => setExecutionEnv(e.target.value)}
                          />
                       </div>
                       <div className="flex-1 relative group">
                          <Paperclip className="w-4 h-4 text-zinc-400 absolute left-3 top-3 group-focus-within:text-zinc-800 transition-colors" />
                          <input 
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                            placeholder="Evidence URL"
                            value={executionEvidence}
                            onChange={e => setExecutionEvidence(e.target.value)}
                          />
                       </div>
                   </div>
                  <textarea 
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 min-h-[80px] text-zinc-800"
                    placeholder="Execution Notes..."
                    value={executionNote}
                    onChange={e => setExecutionNote(e.target.value)}
                  />
                  <div className="relative group">
                      <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-100 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                        placeholder="Bug ID / Jira Ticket (Required if Failed)"
                        value={executionBugId}
                        onChange={e => setExecutionBugId(e.target.value)}
                      />
                      <AlertCircle className="w-4 h-4 text-zinc-400 absolute left-3 top-3 group-focus-within:text-red-500 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => onExecute("PASSED")}
                    className="py-3.5 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:border-green-200 hover:-translate-y-1 hover:shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                    Pass
                  </button>
                  <button 
                    onClick={() => {
                      if (!executionBugId) {
                        alert("Please enter a Bug ID / Ticket # for failed tests to track defects.");
                        return;
                      }
                      onExecute("FAILED");
                    }}
                    className="py-3.5 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 hover:-translate-y-1 hover:shadow-md">
                    <XCircle className="w-5 h-5" />
                    Fail
                  </button>
                  <button 
                    onClick={() => onExecute("BLOCKED")}
                    className="py-3.5 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 hover:border-orange-200 hover:-translate-y-1 hover:shadow-md">
                    <AlertCircle className="w-5 h-5" />
                    Block
                  </button>
                </div>
              </div>
            )}

            {/* Execution History */}
            <div className="glass-panel rounded-3xl shadow-sm overflow-hidden flex flex-col bg-white border border-zinc-200">
              <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between flex-shrink-0">
                <h4 className="font-bold text-zinc-800 text-sm flex items-center">
                  <History className="w-4 h-4 mr-2 text-zinc-400" />
                  Execution History
                </h4>
                <span className="text-xs font-bold text-zinc-500 bg-white px-2 py-1 rounded-lg shadow-sm">{editCase.history?.length || 0} runs</span>
              </div>
              <div className="flex-1 max-h-[350px] overflow-y-auto custom-scrollbar bg-white">
                <ExecutionHistoryList history={editCase.history} />
              </div>
            </div>
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
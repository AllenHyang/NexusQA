import React from "react";
import { TestStatus, Defect } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, Monitor, Paperclip, Forward, Bug } from "lucide-react";
import { DefectSelector } from "@/components/DefectSelector";

interface ExecutionPanelProps {
  env: string;
  setEnv: (s: string) => void;
  evidence: string;
  setEvidence: (s: string) => void;
  note: string;
  setNote: (s: string) => void;
  
  // New Defect Props
  projectDefects: Defect[];
  selectedDefectId: string | null;
  onSelectDefectId: (id: string | null) => void;
  newDefectData: Partial<Defect> | null;
  onNewDefectData: (data: Partial<Defect> | null) => void;

  onExecute: (status: TestStatus) => void;
  reviewStatus?: string;
}

export function ExecutionPanel({ 
  env, setEnv, evidence, setEvidence, note, setNote, 
  projectDefects, selectedDefectId, onSelectDefectId, newDefectData, onNewDefectData,
  onExecute, reviewStatus 
}: ExecutionPanelProps) {
  const isApproved = reviewStatus === 'APPROVED';

  const handleCreateDefect = (data: Partial<Defect>) => {
      onNewDefectData(data);
      onSelectDefectId(null); // Deselect existing
  };

  const handleSelectDefect = (defect: Defect) => {
      onSelectDefectId(defect.id);
      onNewDefectData(null); // Clear new
  };

  return (
      <div className="glass-panel rounded-3xl p-6 border-l-4 border-l-yellow-500 bg-white shadow-xl">
        <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-zinc-800 flex items-center text-lg">
            <CheckCircle2 className="w-5 h-5 mr-2 text-yellow-500"/>
            Execute Test
            </h4>
            {!isApproved && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Not Approved
                </span>
            )}
        </div>
        <div className="mb-5 space-y-4">
           {!isApproved && (
               <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-800 font-medium mb-2">
                   ⚠️ This test case has not been approved yet. Execution is discouraged.
               </div>
           )}
           <div className="flex gap-4">
               <div className="flex-1 relative group">
                  <Monitor className="w-4 h-4 text-zinc-400 absolute left-3 top-3 group-focus-within:text-zinc-800 transition-colors" />
                  <input 
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                    placeholder="Env (e.g. Chrome)"
                    value={env}
                    onChange={e => setEnv(e.target.value)}
                  />
               </div>
               <div className="flex-1 relative group">
                  <Paperclip className="w-4 h-4 text-zinc-400 absolute left-3 top-3 group-focus-within:text-zinc-800 transition-colors" />
                  <input 
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                    placeholder="Evidence URL"
                    value={evidence}
                    onChange={e => setEvidence(e.target.value)}
                  />
               </div>
           </div>
          <textarea 
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 min-h-[80px] text-zinc-800"
            placeholder="Execution Notes..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          
          {/* Defect Selector */}
          <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                  <Bug className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Defect (If Failed)</span>
              </div>
              
              <DefectSelector 
                  defects={projectDefects}
                  onSelectExisting={handleSelectDefect}
                  onCreateNew={handleCreateDefect}
              />
              
              {selectedDefectId && (
                  <div className="text-xs text-blue-600 font-bold mt-2 flex items-center">
                      <Bug className="w-3 h-3 mr-1" />
                      Linked: {projectDefects.find(d => d.id === selectedDefectId)?.title || "Unknown"}
                  </div>
              )}
              {newDefectData && (
                  <div className="text-xs text-green-600 font-bold mt-2 flex items-center">
                      <Bug className="w-3 h-3 mr-1" />
                      New: &quot;{newDefectData.title}&quot;
                  </div>
              )}
          </div>

        </div>
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={() => onExecute("PASSED")}
            className="py-3.5 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:border-green-200 hover:-translate-y-1 hover:shadow-md">
            <CheckCircle2 className="w-5 h-5" />
            Pass
          </button>
          <button 
            onClick={() => onExecute("FAILED")}
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
          <button 
            onClick={() => onExecute("SKIPPED")}
            className="py-3.5 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-1 hover:shadow-md">
            <Forward className="w-5 h-5" />
            Skip
          </button>
        </div>
      </div>
  );
}
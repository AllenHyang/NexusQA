import React from "react";
import { TestStatus } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, Monitor, Paperclip, Forward, Bug } from "lucide-react";

interface ExecutionPanelProps {
  env: string;
  setEnv: (s: string) => void;
  evidence: string;
  setEvidence: (s: string) => void;
  note: string;
  setNote: (s: string) => void;
  
  // New Defect Fields
  defectExternalId: string;
  setDefectExternalId: (s: string) => void;
  defectTracker: string;
  setDefectTracker: (s: string) => void;
  defectSeverity: string;
  setDefectSeverity: (s: string) => void;
  defectStatus: string;
  setDefectStatus: (s: string) => void;
  defectUrl: string;
  setDefectUrl: (s: string) => void;

  onExecute: (status: TestStatus) => void;
  reviewStatus?: string;
}

export function ExecutionPanel({ 
  env, setEnv, evidence, setEvidence, note, setNote, 
  defectExternalId, setDefectExternalId, defectTracker, setDefectTracker, defectSeverity, setDefectSeverity, defectStatus, setDefectStatus, defectUrl, setDefectUrl,
  onExecute, reviewStatus 
}: ExecutionPanelProps) {
  const isApproved = reviewStatus === 'APPROVED';

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
          
          {/* Defect Section */}
          <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                  <Bug className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Defect Details (If Failed)</span>
              </div>
              <div className="flex gap-3">
                  <div className="flex-[2] relative">
                      <input 
                        type="text"
                        className={`w-full pl-3 pr-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 transition-all font-medium placeholder-zinc-400 text-zinc-800 ${!defectExternalId && 'border-zinc-200 focus:ring-zinc-900/5'}`}
                        placeholder="Defect ID (e.g. JIRA-123)"
                        value={defectExternalId}
                        onChange={e => setDefectExternalId(e.target.value)}
                      />
                  </div>
                  <div className="flex-1">
                      <select 
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5 font-medium text-zinc-700"
                        value={defectTracker}
                        onChange={e => setDefectTracker(e.target.value)}
                      >
                          <option value="Jira">Jira</option>
                          <option value="GitHub">GitHub</option>
                          <option value="Generic">Generic</option>
                      </select>
                  </div>
              </div>
              <div className="flex gap-3">
                  <div className="flex-1">
                      <select 
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5 font-medium text-zinc-700"
                        value={defectSeverity}
                        onChange={e => setDefectSeverity(e.target.value)}
                      >
                          <option value="S0">S0 - Critical</option>
                          <option value="S1">S1 - Major</option>
                          <option value="S2">S2 - Normal</option>
                          <option value="S3">S3 - Minor</option>
                      </select>
                  </div>
                  <div className="flex-1">
                      <select 
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5 font-medium text-zinc-700"
                        value={defectStatus}
                        onChange={e => setDefectStatus(e.target.value)}
                      >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                      </select>
                  </div>
              </div>
              <input 
                type="text"
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5 font-medium placeholder-zinc-400 text-zinc-800"
                placeholder="Defect URL (Optional)"
                value={defectUrl}
                onChange={e => setDefectUrl(e.target.value)}
              />
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

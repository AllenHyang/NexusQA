import React from "react";
import { TestStatus } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, Monitor, Paperclip } from "lucide-react";

interface ExecutionPanelProps {
  env: string;
  setEnv: (s: string) => void;
  evidence: string;
  setEvidence: (s: string) => void;
  note: string;
  setNote: (s: string) => void;
  bugId: string;
  setBugId: (s: string) => void;
  onExecute: (status: TestStatus) => void;
}

export function ExecutionPanel({ 
  env, setEnv, evidence, setEvidence, note, setNote, bugId, setBugId, onExecute 
}: ExecutionPanelProps) {
  return (
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
          <div className="relative group">
              <input 
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 transition-all font-medium placeholder-zinc-400 text-zinc-800 ${!bugId ? 'border-red-200 focus:ring-red-100' : 'border-zinc-200 focus:ring-zinc-900/5'}`}
                placeholder="Bug ID / Jira Ticket (Mandatory for FAILED)"
                value={bugId}
                onChange={e => setBugId(e.target.value)}
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
        </div>
      </div>
  );
}

import React from "react";
import { ExecutionRecord } from "@/types";
import { History } from "lucide-react";
import { ExecutionHistoryList } from "../ExecutionHistory"; 

interface ExecutionHistoryPanelProps {
  history: ExecutionRecord[];
}

export function ExecutionHistoryPanel({ history }: ExecutionHistoryPanelProps) {
  return (
    <div className="glass-panel rounded-3xl shadow-sm overflow-hidden flex flex-col bg-white border border-zinc-200">
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between flex-shrink-0">
        <h4 className="font-bold text-zinc-800 text-sm flex items-center">
          <History className="w-4 h-4 mr-2 text-zinc-400" />
          Execution History
        </h4>
        <span className="text-xs font-bold text-zinc-500 bg-white px-2 py-1 rounded-lg shadow-sm">{history?.length || 0} runs</span>
      </div>
      <div className="flex-1 max-h-[350px] overflow-y-auto custom-scrollbar bg-white">
        <ExecutionHistoryList history={history} />
      </div>
    </div>
  );
}

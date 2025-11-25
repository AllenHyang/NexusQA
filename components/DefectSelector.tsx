import React, { useState } from "react";
import { Defect, Priority } from "@/types";
import { Search, Link as LinkIcon } from "lucide-react";

interface DefectSelectorProps {
  defects: Defect[];
  onSelectExisting: (defect: Defect) => void;
  onCreateNew: (data: Partial<Defect>) => void;
}

export function DefectSelector({ defects, onSelectExisting, onCreateNew }: DefectSelectorProps) {
  const [mode, setMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [search, setSearch] = useState("");
  
  // New Defect State
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Priority>("MEDIUM");

  // Filtering
  const filtered = defects.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
      <div className="flex border-b border-zinc-100">
          <button 
            onClick={() => setMode('NEW')}
            className={`flex-1 py-2 text-xs font-bold ${mode === 'NEW' ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
              Create New
          </button>
          <button 
            onClick={() => setMode('EXISTING')}
            className={`flex-1 py-2 text-xs font-bold ${mode === 'EXISTING' ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
              Link Existing
          </button>
      </div>

      <div className="p-4">
        {mode === 'NEW' ? (
            <div className="space-y-3">
                <input 
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100"
                    placeholder="Defect Title"
                    value={title}
                    onChange={e => {
                        setTitle(e.target.value);
                        onCreateNew({ title: e.target.value, severity });
                    }}
                />
                <select 
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white"
                    value={severity}
                    onChange={e => {
                        setSeverity(e.target.value as Priority);
                        onCreateNew({ title, severity: e.target.value as Priority });
                    }}
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>
        ) : (
            <div className="space-y-2">
                <div className="relative">
                    <Search className="w-3 h-3 absolute left-3 top-2.5 text-zinc-400" />
                    <input 
                        className="w-full pl-8 pr-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-100"
                        placeholder="Search open defects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                    {filtered.map(d => (
                        <button
                            key={d.id}
                            onClick={() => onSelectExisting(d)}
                            className="w-full text-left p-2 hover:bg-zinc-50 rounded-lg flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${d.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <span className="text-xs font-medium text-zinc-700 truncate">{d.title}</span>
                            </div>
                            <LinkIcon className="w-3 h-3 text-zinc-300 group-hover:text-zinc-900" />
                        </button>
                    ))}
                    {filtered.length === 0 && <p className="text-xs text-zinc-400 text-center py-2">No matches</p>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

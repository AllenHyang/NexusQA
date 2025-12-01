import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Github, Calendar } from "lucide-react";
import { Modal } from "./ui";
import { Project } from "../types";

interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => void;
  loadingAI: boolean;
  initialData?: Project | null;
}

export function NewProjectModal({ onClose, onSubmit, loadingAI, initialData }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [repo, setRepo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Helper to convert ISO date string to yyyy-MM-dd format for date input
  const formatDateForInput = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (initialData) {
        setName(initialData.name);
        setDesc(initialData.description);
        setRepo(initialData.repositoryUrl || "");
        setStartDate(formatDateForInput(initialData.startDate));
        setDueDate(formatDateForInput(initialData.dueDate));
    }
  }, [initialData]);

  return (
    <Modal onClose={onClose} title={initialData ? "Edit Project" : "Create New Project"}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2">Project Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all text-sm font-medium text-zinc-800 placeholder-zinc-400"
            placeholder="e.g. Mobile App V2"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2">Description</label>
          <textarea 
            className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all text-sm font-medium text-zinc-800 placeholder-zinc-400 min-h-[100px]"
            placeholder="Brief overview of what this project tests..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-zinc-500 mb-2 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-zinc-400" /> Start Date
                </label>
                <input
                    type="date"
                    className="w-full px-4 py-2.5 glass-input rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all text-sm font-medium text-zinc-600"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-zinc-500 mb-2 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-zinc-400" /> Due Date
                </label>
                <input
                    type="date"
                    className="w-full px-4 py-2.5 glass-input rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all text-sm font-medium text-zinc-600"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                />
            </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-500 mb-2 flex items-center">
             <Github className="w-3.5 h-3.5 mr-1.5 text-zinc-400" /> Repository URL
          </label>
          <input 
            type="url" 
            className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all text-sm font-medium text-zinc-800 placeholder-zinc-400"
            placeholder="https://github.com/org/repo"
            value={repo}
            onChange={e => setRepo(e.target.value)}
          />
        </div>

        {!initialData && (
            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-sm text-yellow-800 flex items-start">
            <Sparkles className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-yellow-600" />
            <p className="font-medium">AI will automatically generate a unique, professional cover image based on your project description.</p>
            </div>
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-5 py-2.5 text-zinc-500 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-colors border border-transparent">Cancel</button>
          <button 
            onClick={() => onSubmit({ name, description: desc, repositoryUrl: repo, startDate, dueDate })} 
            disabled={loadingAI || !name}
            className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-bold flex items-center shadow-lg disabled:opacity-70 transition-all transform active:scale-95">
            {loadingAI && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
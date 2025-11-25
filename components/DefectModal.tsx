import React, { useState, useEffect } from "react";
import { Defect, Priority, DefectStatus, User } from "@/types";
import { XCircle, Save } from "lucide-react";

interface DefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (defect: Partial<Defect>) => void;
  initialData?: Defect;
  projectId: string;
  currentUser: User;
}

export function DefectModal({ isOpen, onClose, onSave, initialData, projectId, currentUser }: DefectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<DefectStatus>("OPEN");
  const [externalIssueId, setExternalIssueId] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setSeverity(initialData.severity as Priority);
      setStatus(initialData.status as DefectStatus);
      setExternalIssueId(initialData.externalIssueId || "");
      setExternalUrl(initialData.externalUrl || "");
    } else {
      // Reset
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setStatus("OPEN");
      setExternalIssueId("");
      setExternalUrl("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
      onSave({
          id: initialData?.id,
          title,
          description,
          severity,
          status,
          externalIssueId,
          externalUrl,
          projectId,
          authorId: initialData?.authorId || currentUser.id
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-zinc-900">
                {initialData ? "Edit Defect" : "Report New Defect"}
            </h3>
            <button onClick={onClose}><XCircle className="w-6 h-6 text-zinc-400 hover:text-zinc-600"/></button>
        </div>
        
        <div className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Title</label>
                <input 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Defect summary..."
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Description</label>
                <textarea 
                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none min-h-[100px]"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Steps to reproduce, expected vs actual..."
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Severity</label>
                    <select 
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white"
                        value={severity}
                        onChange={e => setSeverity(e.target.value as Priority)}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Status</label>
                    <select 
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white"
                        value={status}
                        onChange={e => setStatus(e.target.value as DefectStatus)}
                    >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">External ID (Jira)</label>
                    <input 
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                        value={externalIssueId}
                        onChange={e => setExternalIssueId(e.target.value)}
                        placeholder="e.g. JIRA-123"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">External URL</label>
                    <input 
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                        value={externalUrl}
                        onChange={e => setExternalUrl(e.target.value)}
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-medium">Cancel</button>
            <button 
                onClick={handleSubmit}
                disabled={!title}
                className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 flex items-center"
            >
                <Save className="w-4 h-4 mr-2" /> Save Defect
            </button>
        </div>
      </div>
    </div>
  );
}
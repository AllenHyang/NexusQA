import React, { useState, useEffect, useRef } from "react";
import { Defect, Priority, DefectStatus, User } from "@/types";
import { XCircle, Save, MessageSquare, Send } from "lucide-react";
import { useAppStore } from "@/store/useAppStore"; 
import Image from "next/image";

interface DefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (defect: Partial<Defect>) => void;
  initialData?: Defect;
  projectId: string;
  currentUser: User;
}

export function DefectModal({ isOpen, onClose, onSave, initialData, projectId, currentUser }: DefectModalProps) {
  const { users, defects, loadComments, addComment } = useAppStore();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DISCUSSION'>('DETAILS');

  // Get the current defect from store to have up-to-date comments
  const currentDefect = initialData ? defects.find(d => d.id === initialData.id) || initialData : undefined;
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<DefectStatus>("OPEN");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [externalIssueId, setExternalIssueId] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  // Comment State
  const [newComment, setNewComment] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setSeverity(initialData.severity as Priority);
      setStatus(initialData.status as DefectStatus);
      setAssigneeId(initialData.assigneeId || undefined);
      setExternalIssueId(initialData.externalIssueId || "");
      setExternalUrl(initialData.externalUrl || "");
      
      // Load comments for existing defect
      loadComments(initialData.id);
    } else {
      // Reset
      setTitle("");
      setDescription("");
      setSeverity("MEDIUM");
      setStatus("OPEN");
      setAssigneeId(undefined);
      setExternalIssueId("");
      setExternalUrl("");
      setActiveTab('DETAILS'); // Always start on details for new
    }
  }, [initialData, isOpen, loadComments]);

  // Scroll to bottom of comments when tab changes or comments update
  useEffect(() => {
      if (activeTab === 'DISCUSSION' && commentsEndRef.current) {
          commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [activeTab, currentDefect?.comments]);

  if (!isOpen) return null;

  const handleSubmit = () => {
      onSave({
          id: initialData?.id,
          title,
          description,
          severity,
          status,
          assigneeId: assigneeId === "" ? undefined : assigneeId,
          externalIssueId,
          externalUrl,
          projectId,
          authorId: initialData?.authorId || currentUser.id
      });
      onClose();
  };

  const handleAddComment = async () => {
      if (!newComment.trim() || !initialData) return;
      await addComment(initialData.id, newComment, currentUser.id);
      setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center flex-shrink-0 bg-zinc-50/50">
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold text-zinc-900">
                    {initialData ? "Edit Defect" : "Report New Defect"}
                </h3>
                {initialData && (
                    <div className="flex bg-zinc-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('DETAILS')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'DETAILS' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('DISCUSSION')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'DISCUSSION' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            <MessageSquare className="w-3 h-3" /> Discussion
                        </button>
                    </div>
                )}
            </div>
            <button onClick={onClose}><XCircle className="w-6 h-6 text-zinc-400 hover:text-zinc-600"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeTab === 'DETAILS' ? (
                <div className="space-y-4">
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

                    {/* Assignee Selection */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Assignee</label>
                        <select
                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white"
                            value={assigneeId || ""}
                            onChange={e => setAssigneeId(e.target.value === "" ? undefined : e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name || user.email}</option>
                            ))}
                        </select>
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
            ) : (
                <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {(!currentDefect?.comments || currentDefect.comments.length === 0) ? (
                            <div className="text-center py-12 text-zinc-400">
                                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No comments yet. Start the discussion!</p>
                            </div>
                        ) : (
                            currentDefect.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <Image 
                                        src={comment.user.avatar || '/default-avatar.png'} 
                                        alt={comment.user.name} 
                                        width={32} 
                                        height={32} 
                                        className="w-8 h-8 rounded-full border border-zinc-100 flex-shrink-0 mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="bg-zinc-50 rounded-2xl rounded-tl-none px-4 py-2 border border-zinc-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-zinc-900">{comment.user.name}</span>
                                                <span className="text-[10px] text-zinc-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={commentsEndRef} />
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                        <div className="flex gap-2">
                            <textarea 
                                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none min-h-[40px]"
                                placeholder="Write a comment..."
                                rows={2}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <button 
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit self-end"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 ml-1">Press Enter to submit, Shift+Enter for new line</p>
                    </div>
                </div>
            )}
        </div>

        {activeTab === 'DETAILS' && (
            <div className="px-6 py-4 bg-zinc-50 flex justify-end gap-2 flex-shrink-0 border-t border-zinc-100">
                <button onClick={onClose} className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-medium">Cancel</button>
                <button 
                    onClick={handleSubmit}
                    disabled={!title}
                    className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 flex items-center"
                >
                    <Save className="w-4 h-4 mr-2" /> Save Defect
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
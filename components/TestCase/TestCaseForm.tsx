import React from "react";
import { TestCase, Priority, TestSuite, ReviewStatus, User } from "@/types";
import { Folder, Link2, Tag, BookOpen, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { TagBadge } from "../ui";
import { safeParseTags } from "@/lib/formatters";

interface TestCaseFormProps {
  editCase: Partial<TestCase>;
  setEditCase: (c: Partial<TestCase>) => void;
  suites: TestSuite[];
  currentUser: User;
  onGenerateField: (field: 'userStory' | 'acceptanceCriteria' | 'preconditions') => void;
  loadingAI: boolean;
}

export function TestCaseForm({ editCase, setEditCase, suites, currentUser, onGenerateField, loadingAI }: TestCaseFormProps) {
  const [tagInput, setTagInput] = React.useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && tagInput.trim()) {
          const currentTags = safeParseTags(editCase.tags);
          const newTags = [...currentTags, tagInput.trim()];
          setEditCase({ ...editCase, tags: Array.from(new Set(newTags)) });
          setTagInput("");
      }
  };

  const removeTag = (t: string) => {
      const currentTags = safeParseTags(editCase.tags);
      setEditCase({ ...editCase, tags: currentTags.filter(tag => tag !== t) });
  };

  return (
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

        {/* Metadata: Suite, Priority, Review Status */}
        <div className="grid grid-cols-2 gap-6">
            <div className="glass-input p-5 rounded-2xl border border-zinc-200 shadow-sm">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
                    <Folder className="w-3.5 h-3.5 mr-1.5" /> Test Suite
                </label>
                <select
                    value={editCase.suiteId || ""}
                    onChange={e => setEditCase({ ...editCase, suiteId: e.target.value || undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none transition-shadow text-zinc-800"
                >
                    <option value="">(Root / No Suite)</option>
                    {suites.filter(s => s.projectId === editCase.projectId).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>
            <div className="glass-input p-5 rounded-2xl border border-zinc-200 shadow-sm">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Priority</label>
                <select 
                value={editCase.priority || "MEDIUM"}
                onChange={e => setEditCase({...editCase, priority: e.target.value as Priority})}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none transition-shadow text-zinc-800"
                >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
                </select>
            </div>
        </div>

        {/* Review Status */}
        <div className="glass-input p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <label htmlFor="review-status-select" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5" /> Review Status
          </label>
          {(currentUser?.role === "ADMIN" || currentUser?.role === "QA_LEAD") ? (
            <select 
              id="review-status-select"
              value={editCase.reviewStatus || "PENDING"}
              onChange={e => setEditCase({...editCase, reviewStatus: e.target.value as ReviewStatus})}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none transition-shadow text-zinc-800"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
          ) : (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-zinc-500 border-zinc-200">
              {editCase.reviewStatus || "PENDING"}
            </span>
          )}
        </div>

        {/* Tags Input */}
        <div className="glass-input p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1.5" /> Tags
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                {safeParseTags(editCase.tags).map(tag => (
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
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center">
               <BookOpen className="w-3.5 h-3.5 mr-1.5" />
               User Story
            </label>
            <button 
                onClick={() => onGenerateField('userStory')}
                disabled={loadingAI || !editCase.title}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate with AI"
            >
                <Sparkles className="w-3.5 h-3.5" /> AI Auto-Fill
            </button>
          </div>
          <textarea 
            className="w-full px-4 py-3 border border-blue-100 rounded-xl text-sm bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-colors min-h-[80px] font-medium text-zinc-800 placeholder-zinc-400"
            placeholder="As a [User], I want to [Action], so that [Benefit]..."
            value={editCase.userStory || ""}
            onChange={e => setEditCase({...editCase, userStory: e.target.value})}
          />
          <p className="text-[10px] text-blue-400 mt-2 font-bold">Defines the business value and context for this test case.</p>
        </div>

        {/* Acceptance Criteria Section */}
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center">
               <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
               Acceptance Criteria (AC)
            </label>
            <button 
                onClick={() => onGenerateField('acceptanceCriteria')}
                disabled={loadingAI || !editCase.title}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate with AI"
            >
                <Sparkles className="w-3.5 h-3.5" /> AI Auto-Fill
            </button>
          </div>
          <textarea 
            className="w-full px-4 py-3 border border-emerald-100 rounded-xl text-sm bg-white focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-colors min-h-[80px] font-medium text-zinc-800 placeholder-zinc-400"
            placeholder="Given [context], When [event], Then [outcome]..."
            value={editCase.acceptanceCriteria || ""}
            onChange={e => setEditCase({...editCase, acceptanceCriteria: e.target.value})}
          />
          <p className="text-[10px] text-emerald-400 mt-2 font-bold">Defines the &apos;Done&apos; conditions for this test case.</p>
        </div>

        {/* Preconditions */}
        <div className="glass-input p-6 rounded-2xl border border-zinc-200 shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Preconditions & Setup</label>
            <button 
                onClick={() => onGenerateField('preconditions')}
                disabled={loadingAI || !editCase.title}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-zinc-500 hover:text-zinc-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate with AI"
            >
                <Sparkles className="w-3.5 h-3.5" /> AI Auto-Fill
            </button>
          </div>
          <textarea 
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm bg-white focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-zinc-900/5 font-medium text-zinc-800 placeholder-zinc-400"
            placeholder="e.g. User is on the login page, Database is reset..."
            value={editCase.preconditions || editCase.description || ""} 
            onChange={e => setEditCase({...editCase, description: e.target.value, preconditions: e.target.value})}
          />
        </div>
    </div>
  );
}

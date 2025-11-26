"use client";

import React, { useState } from "react";
import { Project, TestCase, User, Priority, TestStatus, TestSuite, TestPlan, ReviewStatus } from "../types";
import { StatusBadge, PriorityBadge, AnimatedEmptyState, Tooltip } from "../components/ui";
import { FolderTree as FolderTreeSidebar } from "../components/FolderTree";
import { safeParseTags } from "../lib/formatters";
import { Filter, ChevronDown, Check, Trash2, CheckSquare, Copy, SearchX, Maximize2, User as UserIcon, FolderInput, ClipboardList, Users, CheckCircle2, XCircle, AlertCircle, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";

interface ProjectCasesViewProps {
  project: Project;
  testCases: TestCase[];
  suites: TestSuite[];
  currentUser: User;
  users: User[];
  searchQuery: string;
  onCreateCase: (suiteId?: string | null) => void;
  onEditCase: (tc: TestCase) => void;
  onDeleteCase: (id: string) => void;
  onDuplicateCase: (tc: TestCase) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusUpdate: (ids: string[], status: TestStatus) => void;
  onBulkReviewStatusUpdate: (ids: string[], status: ReviewStatus) => void;
  onBulkMove: (ids: string[], targetSuiteId: string | null) => void;
  onViewCaseDetails: (projectId: string, testCaseId: string) => void;
  onCreateSuite: (parentId: string | null, name: string) => void;
  onRenameSuite: (id: string, name: string) => void;
  onDeleteSuite: (id: string) => void;
  
  plans: TestPlan[];
  onAddToPlan: (planId: string, caseIds: string[]) => void;

  showMobileFolders: boolean;
  setShowMobileFolders: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ProjectCasesView({
  project,
  testCases,
  suites,
  currentUser,
  users,
  searchQuery,
  onCreateCase,
  onEditCase,
  onDeleteCase,
  onDuplicateCase,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkReviewStatusUpdate,
  onBulkMove,
  onViewCaseDetails,
  onCreateSuite,
  onRenameSuite,
  onDeleteSuite,
  plans,
  onAddToPlan,
  showMobileFolders,
  setShowMobileFolders,
}: ProjectCasesViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const [reviewStatusFilter, setReviewStatusFilter] = useState<ReviewStatus[]>([]);
  const [showReviewDropdown, setShowReviewDropdown] = useState(false);

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);

  // Bulk Move State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);

  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const togglePriorityFilter = (p: Priority) => {
    if (priorityFilter.includes(p)) {
      setPriorityFilter(priorityFilter.filter(item => item !== p));
    } else {
      setPriorityFilter([...priorityFilter, p]);
    }
  };

  const toggleAssigneeFilter = (userId: string) => {
    if (assigneeFilter.includes(userId)) {
        setAssigneeFilter(assigneeFilter.filter(id => id !== userId));
    } else {
        setAssigneeFilter([...assigneeFilter, userId]);
    }
  };

  const toggleReviewFilter = (status: ReviewStatus) => {
    if (reviewStatusFilter.includes(status)) {
      setReviewStatusFilter(reviewStatusFilter.filter(item => item !== status));
    } else {
      setReviewStatusFilter([...reviewStatusFilter, status]);
    }
  };

  const filteredCases = testCases.filter(tc => {
    const matchesSuite = selectedSuiteId ? tc.suiteId === selectedSuiteId : true;
    
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(tc.priority);
    const matchesReview = reviewStatusFilter.length === 0 || reviewStatusFilter.includes(tc.reviewStatus || "PENDING");
    const matchesSearch = searchQuery 
        ? tc.title.toLowerCase().includes(searchQuery.toLowerCase()) || (tc.description && tc.description.toLowerCase().includes(searchQuery.toLowerCase())) || (tc.userStory && tc.userStory.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
    
    let matchesAssignee = true;
    if (onlyMyTasks) {
        matchesAssignee = tc.assignedToId === currentUser.id;
    } else {
        matchesAssignee = assigneeFilter.length === 0 || (tc.assignedToId ? assigneeFilter.includes(tc.assignedToId) : false);
    }

    return matchesSuite && matchesPriority && matchesReview && matchesSearch && matchesAssignee;
  });

  // Calculate Pending Review Count
  const pendingReviewCount = testCases.filter(tc => (!tc.reviewStatus || tc.reviewStatus === 'PENDING')).length;
  const isManager = currentUser.role === 'ADMIN' || currentUser.role === 'QA_LEAD';

  const getAssignee = (id?: string | null) => users.find(u => u.id === id);
  
  const handleSelectAll = () => {    
    if (selectedIds.length === filteredCases.length && filteredCases.length > 0) {
        setSelectedIds([]);
    } else {
        setSelectedIds(filteredCases.map(tc => tc.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
        setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (action: () => void) => {
      action();
      setSelectedIds([]); 
  };

  const handleMoveSubmit = () => {
      onBulkMove(selectedIds, moveTargetId);
      setShowMoveModal(false);
      setSelectedIds([]);
      setMoveTargetId(null);
  };

  const applyPendingFilter = () => {
      setReviewStatusFilter(["PENDING"]);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Manager Notification Banner */}
      {isManager && pendingReviewCount > 0 && !reviewStatusFilter.includes("PENDING") && (
         <div className="mx-4 md:mx-6 mt-4 mb-2 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-500 shadow-sm flex-shrink-0">
             <div className="flex items-center gap-4">
                 <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
                     <Clock className="w-5 h-5" />
                 </div>
                 <div>
                     <h4 className="text-sm font-bold text-zinc-900 mb-0.5">Pending Reviews</h4>
                     <p className="text-xs text-zinc-500 font-medium">You have <span className="font-bold text-amber-600">{pendingReviewCount} test cases</span> waiting for approval.</p>
                 </div>
             </div>
             <button
                onClick={applyPendingFilter}
                className="px-5 py-2.5 bg-amber-500 border border-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
             >
                 Review Now <ArrowRight className="w-3.5 h-3.5 ml-2" />
             </button>
         </div>
      )}

      {/* Mobile Folder Toggle */}
      <button 
          onClick={() => setShowMobileFolders(!showMobileFolders)}
          className="md:hidden w-full mb-4 flex items-center justify-between px-4 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-700 shadow-sm mx-4 mt-4 flex-shrink-0"
      >
          <span className="flex items-center gap-2">
              <FolderInput className="w-4 h-4 text-zinc-400" />
              {selectedSuiteId ? suites.find(s => s.id === selectedSuiteId)?.name : "All Cases"}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFolders ? "rotate-180" : ""}`} />
      </button>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Sidebar: Folder Tree */}
        <div className={`${showMobileFolders ? "block" : "hidden"} md:block border-b md:border-b-0 md:border-r border-zinc-200 h-full overflow-y-auto md:mr-2`}>
            <FolderTreeSidebar 
                suites={suites} 
                selectedSuiteId={selectedSuiteId}
                onSelect={(id) => { setSelectedSuiteId(id); setShowMobileFolders(false); }}
                onCreate={onCreateSuite}
                onRename={onRenameSuite}
                onDelete={onDeleteSuite}
            />
        </div>

        {/* Right Content: Flex Column with Fixed Filters and Scrollable Table */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-[#F2F0E9]">
            {/* Filters Bar - Fixed at Top */}
            <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-2 z-10">
                <div className="flex flex-wrap gap-2 md:space-x-3 items-center">
                    <button 
                        onClick={() => setOnlyMyTasks(!onlyMyTasks)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all border ${onlyMyTasks ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200'}`}
                    >
                        <UserIcon className="w-4 h-4 mr-2" /> 
                        <span className="hidden sm:inline">{onlyMyTasks ? "My Assignments" : "All Assignments"}</span>
                        <span className="sm:hidden">{onlyMyTasks ? "Mine" : "All"}</span>
                    </button>
                    
                    <div className="hidden md:block w-px h-6 bg-zinc-300 mx-2"></div>

                    {/* Review Status Filter */}
                    <div className="relative">
                    <button
                        onClick={() => setShowReviewDropdown(!showReviewDropdown)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all border ${reviewStatusFilter.length > 0 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200"}`}
                    >
                        <Clock className={`w-4 h-4 mr-2 ${reviewStatusFilter.length > 0 ? "text-yellow-400" : "text-zinc-400"}`} />
                        <span className="hidden sm:inline">Review: {reviewStatusFilter.length === 0 ? "All" : `${reviewStatusFilter.length} selected`}</span>
                        <span className="sm:hidden">Review</span>
                        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </button>

                    {showReviewDropdown && (
                        <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowReviewDropdown(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-100 shadow-xl rounded-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Filter by Review Status</div>
                            {(["PENDING", "APPROVED", "CHANGES_REQUESTED"] as ReviewStatus[]).map(s => (
                            <button
                                key={s}
                                onClick={() => toggleReviewFilter(s)}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-50 flex items-center justify-between group transition-colors mb-1"
                            >
                                <div className="flex items-center">
                                <div className={`w-5 h-5 border rounded-lg mr-3 flex items-center justify-center transition-all ${reviewStatusFilter.includes(s) ? "bg-zinc-900 border-zinc-900 shadow-sm" : "border-zinc-200 bg-white"}`}>
                                    {reviewStatusFilter.includes(s) && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className={`font-bold capitalize ${reviewStatusFilter.includes(s) ? "text-zinc-900" : "text-zinc-500"}`}>
                                    {s.replace('_', ' ').toLowerCase()}
                                </span>
                                </div>
                            </button>
                            ))}
                        </div>
                        </>
                    )}
                    </div>

                    {/* Priority Filter */}
                    <div className="relative">
                    <button
                        onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all border ${priorityFilter.length > 0 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200"}`}
                    >
                        <Filter className={`w-4 h-4 mr-2 ${priorityFilter.length > 0 ? "text-yellow-400" : "text-zinc-400"}`} />
                        <span className="hidden sm:inline">Priority: {priorityFilter.length === 0 ? "All" : `${priorityFilter.length} selected`}</span>
                        <span className="sm:hidden">Priority</span>
                        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </button>

                    {showPriorityDropdown && (
                        <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowPriorityDropdown(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-100 shadow-xl rounded-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Priorities</div>
                            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map(p => (
                            <button
                                key={p}
                                onClick={() => togglePriorityFilter(p)}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-50 flex items-center justify-between group transition-colors mb-1"
                            >
                                <div className="flex items-center">
                                <div className={`w-5 h-5 border rounded-lg mr-3 flex items-center justify-center transition-all ${priorityFilter.includes(p) ? "bg-zinc-900 border-zinc-900 shadow-sm" : "border-zinc-200 bg-white"}`}>
                                    {priorityFilter.includes(p) && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className={`font-bold capitalize ${priorityFilter.includes(p) ? "text-zinc-900" : "text-zinc-500"}`}>{p.toLowerCase()}</span>
                                </div>
                                <PriorityBadge priority={p} />
                            </button>
                            ))}
                        </div>
                        </>
                    )}
                    </div>

                    {/* Assignee Filter */}
                    <div className="relative">
                    <button
                        onClick={() => !onlyMyTasks && setShowAssigneeDropdown(!showAssigneeDropdown)}
                        disabled={onlyMyTasks}
                        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${assigneeFilter.length > 0 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200"}`}
                    >
                        <Users className={`w-4 h-4 mr-2 ${assigneeFilter.length > 0 ? "text-yellow-400" : "text-zinc-400"}`} />
                        <span className="hidden sm:inline">Assignee: {assigneeFilter.length === 0 ? "All" : `${assigneeFilter.length} selected`}</span>
                        <span className="sm:hidden">Users</span>
                        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </button>

                    {showAssigneeDropdown && (
                        <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeDropdown(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-zinc-100 shadow-xl rounded-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Filter by User</div>
                            {users.map(u => (
                            <button
                                key={u.id}
                                onClick={() => toggleAssigneeFilter(u.id)}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-50 flex items-center justify-between group transition-colors mb-1"
                            >
                                <div className="flex items-center">
                                <div className={`w-5 h-5 border rounded-lg mr-3 flex items-center justify-center transition-all ${assigneeFilter.includes(u.id) ? "bg-zinc-900 border-zinc-900 shadow-sm" : "border-zinc-200 bg-white"}`}>
                                    {assigneeFilter.includes(u.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <Image src={u.avatar} alt={u.name} width={24} height={24} className="w-6 h-6 rounded-full mr-2" />
                                <span className={`font-bold truncate max-w-[120px] ${assigneeFilter.includes(u.id) ? "text-zinc-900" : "text-zinc-500"}`}>{u.name}</span>
                                </div>
                            </button>
                            ))}
                        </div>
                        </>
                    )}
                    </div>
                </div>
            </div>

            {/* Scrollable Table Section */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 min-h-0">
                <div className="glass-panel rounded-[1.5rem] bg-white border border-zinc-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50/80 border-b border-zinc-100 backdrop-blur-sm sticky top-0 z-20">
                            <tr>
                            <th className="px-6 py-4 font-bold text-zinc-400 w-10">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800"
                                    checked={filteredCases.length > 0 && selectedIds.length === filteredCases.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 font-bold text-zinc-400 w-16 text-center">#</th>
                            <th className="px-6 py-4 font-bold text-zinc-400 min-w-[240px]">Test Case</th>
                            <th className="px-6 py-4 font-bold text-zinc-400">Assignee</th>
                            <th className="px-6 py-4 font-bold text-zinc-400">Status</th>
                            <th className="px-6 py-4 font-bold text-zinc-400">Review</th>
                            <th className="px-6 py-4 font-bold text-zinc-400">Priority</th>
                            <th className="px-6 py-4 font-bold text-zinc-400 text-right sticky right-0 bg-zinc-50/95 backdrop-blur-sm z-20 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.02)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredCases.map((tc, idx) => {
                                const isPending = !tc.reviewStatus || tc.reviewStatus === 'PENDING';
                                return (
                            <tr 
                                key={tc.id} 
                                onClick={() => onViewCaseDetails(project.id, tc.id)}
                                className={`
                                    group cursor-pointer transition-all duration-200
                                    hover:bg-zinc-50/80 
                                    ${isPending ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'bg-white'}
                                `}
                            >
                                <td className="px-6 py-5 relative" onClick={(e) => e.stopPropagation()}>
                                    {isPending && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400"></div>
                                    )}
                                    <input
                                        type="checkbox"
                                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer relative z-10"
                                        checked={selectedIds.includes(tc.id)}
                                        onChange={() => toggleSelect(tc.id)}
                                    />
                                </td>
                                <td className="px-6 py-5 text-zinc-400 text-center font-medium font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                                <td className="px-6 py-5">
                                <div className="flex flex-col gap-1.5">
                                <div
                                    onClick={() => onViewCaseDetails(project.id, tc.id)}
                                    className="font-bold text-[13px] truncate max-w-[280px] transition-colors text-zinc-800 hover:text-zinc-900 cursor-pointer underline decoration-zinc-300 hover:decoration-zinc-500 underline-offset-2" title={tc.title}>
                                        {tc.title}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tc.requirementId && (
                                            <div className="inline-flex items-center text-[10px] font-bold text-zinc-400 bg-zinc-100/80 px-1.5 py-0.5 rounded border border-zinc-200/50">
                                                {tc.requirementId}
                                            </div>
                                        )}
                                        {safeParseTags(tc.tags).slice(0, 2).map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                </td>
                                <td className="px-6 py-5">
                                    {getAssignee(tc.assignedToId) ? (
                                        <div className="flex items-center gap-2" title={getAssignee(tc.assignedToId)?.name}>
                                            <Image src={getAssignee(tc.assignedToId)?.avatar || '/default-avatar.png'} alt="avatar" width={24} height={24} className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-zinc-100" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-zinc-50 border border-dashed border-zinc-300 flex items-center justify-center">
                                            <UserIcon className="w-3 h-3 text-zinc-300" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5"><StatusBadge status={tc.status} /></td>
                                <td className="px-6 py-5">
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        !tc.reviewStatus || tc.reviewStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                        tc.reviewStatus === 'APPROVED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                        'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                        {(!tc.reviewStatus || tc.reviewStatus === 'PENDING') && <Clock className="w-3 h-3 mr-1.5" />}
                                        {tc.reviewStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                        {tc.reviewStatus === 'CHANGES_REQUESTED' && <AlertCircle className="w-3 h-3 mr-1.5" />}
                                        {tc.reviewStatus ? tc.reviewStatus.replace('_', ' ') : 'PENDING'}
                                    </div>
                                </td>
                                <td className="px-6 py-5"><PriorityBadge priority={tc.priority} /></td>
                                <td className={`px-6 py-5 text-right sticky right-0 z-10 transition-colors shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.02)]
                                    ${isPending ? 'bg-amber-50/30 group-hover:bg-amber-50/80' : 'bg-white group-hover:bg-zinc-50/80'}
                                `}>
                                <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <Tooltip content="Details" position="left">
                                        <button 
                                        onClick={(e) => { e.stopPropagation(); onEditCase(tc); }}
                                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                    {(currentUser.role !== "TESTER") && (
                                        <Tooltip content="Duplicate" position="left">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDuplicateCase(tc); }}
                                                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </Tooltip>
                                    )}
                                    {currentUser.role === "ADMIN" && (
                                    <Tooltip content="Delete" position="left">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteCase(tc.id); }}
                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                    )}
                                </div>
                                </td>
                            </tr>
                            )})}
                            {filteredCases.length === 0 && (
                            <tr>
                                <td colSpan={8}>
                                    <AnimatedEmptyState 
                                        icon={searchQuery ? SearchX : CheckSquare}
                                        title={searchQuery ? "No Matches" : "Empty Project"}
                                        description={searchQuery ? "Try adjusting your filters." : "Get started by creating a test case."}
                                        action={(!searchQuery && currentUser.role !== "TESTER") && (
                                            <button onClick={() => onCreateCase(selectedSuiteId)} className="text-zinc-900 font-bold hover:underline">Create Case</button>
                                        )}
                                    />
                                </td>
                            </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Bulk Actions Floating Bar */}
            {selectedIds.length > 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in w-max max-w-[90vw] border border-zinc-200 bg-white">
                 <div className="flex items-center gap-3 pr-6 border-r border-zinc-100">
                     <div className="bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{selectedIds.length}</div>
                     <span className="font-bold text-zinc-700 text-sm">Selected</span>
                     <button onClick={() => setSelectedIds([])} className="text-xs text-zinc-400 hover:text-zinc-800 underline ml-1 font-medium">Clear</button>
                 </div>
                 
                 <div className="flex items-center gap-2">
                     {/* Manager Review Actions */}
                     {isManager && (
                         <>
                            <button 
                             onClick={() => handleBulkAction(() => onBulkReviewStatusUpdate(selectedIds, "APPROVED"))}
                             className="flex items-center px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                            </button>
                            <button 
                             onClick={() => handleBulkAction(() => onBulkReviewStatusUpdate(selectedIds, "CHANGES_REQUESTED"))}
                             className="flex items-center px-3 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-colors"
                            >
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                            </button>
                            <div className="w-px h-6 bg-zinc-200 mx-2"></div>
                         </>
                     )}

                     <button 
                      onClick={() => handleBulkAction(() => onBulkStatusUpdate(selectedIds, "PASSED"))}
                      className="flex items-center px-3 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 text-xs font-bold transition-colors"
                     >
                         <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Pass
                     </button>
                     <button 
                      onClick={() => handleBulkAction(() => onBulkStatusUpdate(selectedIds, "FAILED"))}
                      className="flex items-center px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors"
                     >
                         <XCircle className="w-3.5 h-3.5 mr-1.5" /> Fail
                     </button>
                     <button 
                      onClick={() => handleBulkAction(() => onBulkStatusUpdate(selectedIds, "BLOCKED"))}
                      className="flex items-center px-3 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 text-xs font-bold transition-colors"
                     >
                         <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Block
                     </button>

                     <button 
                      onClick={() => setShowAddToPlanModal(true)}
                      className="flex items-center px-3 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors"
                     >
                         <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Add to Plan
                     </button>
                     
                     <button 
                      onClick={() => setShowMoveModal(true)}
                      className="flex items-center px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
                     >
                         <FolderInput className="w-3.5 h-3.5 mr-1.5" /> Move
                     </button>

                     {currentUser.role === "ADMIN" && (
                         <>
                             <div className="w-px h-6 bg-zinc-200 mx-2"></div>
                             <button 
                              onClick={() => handleBulkAction(() => onBulkDelete(selectedIds))}
                              className="flex items-center px-3 py-2 rounded-xl bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-500 border border-zinc-200 hover:border-red-200 text-xs font-bold transition-colors"
                             >
                                 <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                             </button>
                         </>
                     )}
                 </div>
              </div>
            )}
            
            {/* Bulk Move Modal */}
            {showMoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-zinc-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Move {selectedIds.length} cases to...</h3>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => setMoveTargetId(null)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center ${moveTargetId === null ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                            >
                                <FolderInput className="w-4 h-4 mr-2" /> (Root)
                            </button>
                            {suites.map(suite => (
                                <button
                                    key={suite.id}
                                    onClick={() => setMoveTargetId(suite.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center ${moveTargetId === suite.id ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                                >
                                    <FolderInput className="w-4 h-4 mr-2" /> {suite.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setShowMoveModal(false)}
                              className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                              onClick={handleMoveSubmit}
                              className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors"
                            >
                                Move
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Plan Modal */}
            {showAddToPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-zinc-200">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Add {selectedIds.length} cases to Plan...</h3>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                            {plans.filter(p => p.status !== 'ARCHIVED').map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center ${selectedPlanId === plan.id ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                                >
                                    <ClipboardList className="w-4 h-4 mr-2" /> {plan.name}
                                </button>
                            ))}
                            {plans.filter(p => p.status !== 'ARCHIVED').length === 0 && <div className="text-center text-zinc-400 text-sm py-4">No active plans found.</div>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setShowAddToPlanModal(false); setSelectedPlanId(null); }}
                              className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                              onClick={() => {
                                  if (selectedPlanId) {
                                      onAddToPlan(selectedPlanId, selectedIds);
                                      setShowAddToPlanModal(false);
                                      setSelectedIds([]);
                                      setSelectedPlanId(null);
                                  }
                              }}
                              disabled={!selectedPlanId}
                              className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
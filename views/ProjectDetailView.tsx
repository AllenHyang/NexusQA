import React, { useState } from "react";
import { Project, TestCase, User, Priority, TestStatus, TestSuite } from "../types";
import { StatusBadge, PriorityBadge, AnimatedEmptyState, TagBadge, ProgressBar, Tooltip } from "../components/ui";
import { FolderTree as FolderTreeSidebar } from "../components/FolderTree";
import { Download, Plus, Filter, ChevronDown, Check, Trash2, CheckSquare, History, Copy, SearchX, X, Maximize2, CheckCircle2, XCircle, AlertCircle, BookOpen, Tag, Sparkles, Bug, PlayCircle, ArrowRight, Layout, Info, User as UserIcon, Github, Calendar, BarChart3, Activity, Users, Pencil, FolderInput } from "lucide-react";

interface ProjectDetailViewProps {
  project: Project;
  testCases: TestCase[];
  suites: TestSuite[]; // New
  currentUser: User;
  users: User[];
  searchQuery: string;
  onExport: () => void;
  onCreateCase: () => void;
  onEditCase: (tc: TestCase) => void;
  onDeleteCase: (id: string) => void;
  onDuplicateCase: (tc: TestCase) => void;
  onViewHistory: (tc: TestCase) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusUpdate: (ids: string[], status: TestStatus) => void;
  onBulkMove: (ids: string[], targetSuiteId: string | null) => void; // New prop
  onViewCaseDetails: (projectId: string, testCaseId: string) => void;
  onImportCases: () => void;
  // Suite Handlers
  onCreateSuite: (parentId: string | null, name: string) => void;
  onRenameSuite: (id: string, name: string) => void;
  onDeleteSuite: (id: string) => void;
  
  defectTrackerUrl?: string;
}

const WorkflowStep = ({ icon: Icon, title, description, color, stepNumber }: any) => (
    <div className="flex-1 relative group min-w-[200px]">
        <div className={`p-6 rounded-2xl glass-panel h-full relative z-10 flex flex-col bg-white border border-zinc-100 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('500', '100')} ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-zinc-300">0{stepNumber}</span>
            </div>
            <h4 className="font-bold text-zinc-800 text-sm mb-2">{title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">{description}</p>
        </div>
        {/* Connector Line */}
        {stepNumber < 4 && (
             <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-zinc-200 -translate-y-1/2 z-0">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white p-1.5 rounded-full shadow-sm border border-zinc-100">
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                 </div>
             </div>
        )}
    </div>
);

export function ProjectDetailView({
  project,
  testCases,
  suites,
  currentUser,
  users,
  searchQuery,
  onExport,
  onCreateCase,
  onEditCase,
  onDeleteCase,
  onDuplicateCase,
  onViewHistory,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkMove,
  onViewCaseDetails,
  onCreateSuite,
  onRenameSuite,
  onDeleteSuite,
  onImportCases,
  defectTrackerUrl
}: ProjectDetailViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);

  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"WORKFLOW" | "ANALYTICS">("ANALYTICS");
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);

  // Bulk Move State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);

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

  const filteredCases = testCases.filter(tc => {
    // Fix: only filter by suite if selectedSuiteId is not null
    // If selectedSuiteId is null, show ALL cases (or root cases? Usually all cases for better UX unless specified)
    // Let's assume null = "All Cases" view.
    const matchesSuite = selectedSuiteId ? tc.suiteId === selectedSuiteId : true;
    
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(tc.priority);
    const matchesSearch = searchQuery 
        ? tc.title.toLowerCase().includes(searchQuery.toLowerCase()) || tc.description.toLowerCase().includes(searchQuery.toLowerCase()) || (tc.userStory && tc.userStory.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
    
    let matchesAssignee = true;
    if (onlyMyTasks) {
        matchesAssignee = tc.assignedToId === currentUser.id;
    } else {
        matchesAssignee = assigneeFilter.length === 0 || (tc.assignedToId ? assigneeFilter.includes(tc.assignedToId) : false);
    }

    return matchesSuite && matchesPriority && matchesSearch && matchesAssignee;
  });

  const selectedPreviewCase = testCases.find(tc => tc.id === selectedPreviewId);
  const getAssignee = (id?: string) => users.find(u => u.id === id);

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

  // Analytics Calculations
  const failedCases = testCases.filter(tc => tc.status === "FAILED");
  const defectCount = failedCases.length;
  const totalExecuted = testCases.filter(tc => tc.status !== "UNTESTED" && tc.status !== "DRAFT").length;
  const defectDensity = totalExecuted > 0 ? Math.round((defectCount / totalExecuted) * 100) : 0;
  const uniqueBugIds = new Set(testCases.flatMap(tc => tc.history?.filter(h => h.bugId).map(h => h.bugId) || []));

  // Timeline
  const start = project.startDate ? new Date(project.startDate) : new Date();
  const end = project.dueDate ? new Date(project.dueDate) : new Date(new Date().setDate(new Date().getDate() + 14));
  const today = new Date();
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const getLast7DaysData = () => {
      const days = [];
      for(let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const count = testCases.reduce((acc, tc) => {
              const executedOnDay = tc.history?.some(h => h.date.startsWith(dateStr));
              return acc + (executedOnDay ? 1 : 0);
          }, 0);
          days.push({ date: dateStr, count, label: d.toLocaleDateString(undefined, {weekday: 'narrow'}) });
      }
      return days;
  };
  const trendData = getLast7DaysData();
  const maxTrend = Math.max(...trendData.map(d => d.count), 1);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Non-scrolling */}
      <div className="flex-shrink-0 pt-6 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 bg-[#F2F0E9]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{project.name}</h1>
            {project.repositoryUrl && (
                <a 
                    href={project.repositoryUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors border border-zinc-200 shadow-sm"
                    title="Go to Repository"
                >
                    <Github className="w-5 h-5" />
                </a>
            )}
          </div>
          <p className="text-zinc-500 max-w-2xl line-clamp-1 font-medium">{project.description}</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-white rounded-xl p-1 border border-zinc-200 shadow-sm">
              <button 
                onClick={() => setActiveTab("ANALYTICS")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${activeTab === "ANALYTICS" ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Progress
              </button>
              <button 
                onClick={() => setActiveTab("WORKFLOW")}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${activeTab === "WORKFLOW" ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <Layout className="w-3.5 h-3.5 mr-1.5" /> Workflow
              </button>
          </div>
          <button
            onClick={onExport}
            className="glass-button px-4 py-2.5 rounded-xl text-sm font-bold flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
          {(currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD") && (
            <button
              onClick={onImportCases}
              className="glass-button px-4 py-2.5 rounded-xl text-sm font-bold flex items-center"
            >
              <FolderInput className="w-4 h-4 mr-2" /> Import
            </button>
          )}
          {(currentUser.role !== "TESTER") && (
            <button 
              onClick={onCreateCase}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center hover:bg-black shadow-lg hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Create Case
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: Folder Tree */}
        <FolderTreeSidebar 
            suites={suites} 
            selectedSuiteId={selectedSuiteId}
            onSelect={setSelectedSuiteId}
            onCreate={onCreateSuite}
            onRename={onRenameSuite}
            onDelete={onDeleteSuite}
        />

        {/* Right Content: Scrollable */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6">
            {/* Intelligence Section */}
            <div className="animate-in slide-in-from-top-2 fade-in duration-300 mb-6">
                {activeTab === "WORKFLOW" && (
                    <div className="glass-panel rounded-[2rem] p-8 bg-white">
                        <div className="flex items-center mb-6">
                            <Info className="w-4 h-4 text-yellow-500 mr-2" />
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Use Case Driven Workflow</h3>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6">
                            <WorkflowStep stepNumber={1} icon={BookOpen} title="User Story" description="Define the 'Who', 'What', and 'Why' in the User Story field to set the context." color="text-blue-500" />
                            <WorkflowStep stepNumber={2} icon={Sparkles} title="AI Design" description="Gemini AI generates precise test steps and visual mockups based on your story." color="text-purple-500" />
                            <WorkflowStep stepNumber={3} icon={PlayCircle} title="Execution" description="Testers run scenarios. Results are logged with timestamps and executor details." color="text-emerald-500" />
                            <WorkflowStep stepNumber={4} icon={Bug} title="Defect Tracking" description="Failed tests link directly to Jira (or external tracker) via Requirement ID." color="text-red-500" />
                        </div>
                    </div>
                )}

                {activeTab === "ANALYTICS" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Timeline Card */}
                        <div className="glass-panel rounded-[2rem] p-8 lg:col-span-2 bg-white">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="font-bold text-zinc-800 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-yellow-500" /> Project Schedule
                                    </h4>
                                    <p className="text-xs text-zinc-500 mt-1 font-medium">
                                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-3xl font-black text-zinc-900">
                                        {Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))}
                                    </span>
                                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Days Left</span>
                                </div>
                            </div>
                            
                            {/* Progress Bar Timeline */}
                            <div className="relative pt-8 pb-2">
                                <ProgressBar progress={progressPercent} height="h-3" className="mb-2" />
                                <div className="flex justify-between text-xs text-zinc-400 font-bold">
                                    <span>Start</span>
                                    <span 
                                        className="text-yellow-600 absolute transition-all duration-1000 transform -translate-x-1/2 -top-1"
                                        style={{ left: `${progressPercent}%` }}
                                    >
                                        Today
                                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-yellow-600 mx-auto mt-1"></div>
                                    </span>
                                    <span>Due</span>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Column */}
                        <div className="grid grid-rows-2 gap-6">
                            <div className="glass-panel rounded-[2rem] p-6 flex flex-col justify-between bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                                        <Bug className="w-3.5 h-3.5 mr-1.5" /> Defect Metrics
                                    </h4>
                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg font-bold">{uniqueBugIds.size} Open</span>
                                </div>
                                <div className="flex items-end gap-4">
                                    <div>
                                        <span className="text-2xl font-black text-zinc-900">{defectDensity}%</span>
                                        <span className="text-xs text-zinc-400 ml-1 font-bold">Density</span>
                                    </div>
                                    <div className="h-8 w-px bg-zinc-200"></div>
                                    <div>
                                        <span className="text-2xl font-black text-zinc-900">{failedCases.length}</span>
                                        <span className="text-xs text-zinc-400 ml-1 font-bold">Failed</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel rounded-[2rem] p-6 flex flex-col bg-white">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center mb-4">
                                        <Activity className="w-3.5 h-3.5 mr-1.5" /> 7-Day Activity
                                </h4>
                                <div className="flex items-end justify-between h-full gap-2">
                                    {trendData.map((d, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                                            <div 
                                                className="w-full bg-yellow-100 rounded-t-sm relative hover:bg-yellow-200 transition-colors"
                                                style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: '4px' }}
                                            >
                                                {d.count > 0 && (
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                                        {d.count}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-zinc-400 uppercase font-bold">{d.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters Bar */}
            <div className="flex space-x-3 mb-4 sticky top-0 z-20 py-2 px-1 items-center bg-[#F2F0E9]/95 backdrop-blur-sm">
                <button 
                    onClick={() => setOnlyMyTasks(!onlyMyTasks)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all backdrop-blur-md border ${onlyMyTasks ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200'}`}
                >
                    <UserIcon className="w-4 h-4 mr-2" /> 
                    {onlyMyTasks ? "My Assignments" : "All Assignments"}
                </button>
                
                <div className="w-px h-6 bg-zinc-300 mx-2"></div>

                {/* Priority Filter */}
                <div className="relative">
                <button
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all backdrop-blur-md border ${priorityFilter.length > 0 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200"}`}
                >
                    <Filter className={`w-4 h-4 mr-2 ${priorityFilter.length > 0 ? "text-yellow-400" : "text-zinc-400"}`} />
                    Priority: {priorityFilter.length === 0 ? "All" : `${priorityFilter.length} selected`}
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
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center transition-all backdrop-blur-md border disabled:opacity-50 disabled:cursor-not-allowed ${assigneeFilter.length > 0 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200"}`}
                >
                    <Users className={`w-4 h-4 mr-2 ${assigneeFilter.length > 0 ? "text-yellow-400" : "text-zinc-400"}`} />
                    Assignee: {assigneeFilter.length === 0 ? "All" : `${assigneeFilter.length} selected`}
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
                            <img src={u.avatar} className="w-6 h-6 rounded-full mr-2" alt={u.name} />
                            <span className={`font-bold truncate max-w-[120px] ${assigneeFilter.includes(u.id) ? "text-zinc-900" : "text-zinc-500"}`}>{u.name}</span>
                            </div>
                        </button>
                        ))}
                    </div>
                    </>
                )}
                </div>
            </div>

            {/* Table Section */}
            <div className={`flex-1 min-w-0 transition-all duration-500 ease-in-out w-full pb-24`}>
                <div className="glass-panel rounded-[1.5rem] bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
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
                            <th className="px-6 py-4 font-bold text-zinc-400">Priority</th>
                            <th className="px-6 py-4 font-bold text-zinc-400 text-right sticky right-0 bg-zinc-50/95 backdrop-blur-sm z-20 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.02)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredCases.map((tc, idx) => {
                            const isActive = selectedPreviewId === tc.id;
                            return (
                            <tr 
                                key={tc.id} 
                                onClick={() => onViewCaseDetails(project.id, tc.id)}
                                className={`
                                    group cursor-pointer transition-all duration-200
                                    ${isActive ? "bg-blue-50/60" : "hover:bg-zinc-50/80 bg-white"}
                                `}
                            >
                                <td className="px-6 py-4 relative">
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>}
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer relative z-10"
                                        checked={selectedIds.includes(tc.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => toggleSelect(tc.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 text-zinc-400 text-center font-medium font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                                <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5">
                                <div 
                                    onClick={() => onViewCaseDetails(project.id, tc.id)}
                                    className={`font-bold text-[13px] truncate max-w-[280px] transition-colors text-blue-600 hover:text-blue-800 cursor-pointer`} title={tc.title}>
                                        {tc.title}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tc.requirementId && (
                                            <div className="inline-flex items-center text-[10px] font-bold text-zinc-400 bg-zinc-100/80 px-1.5 py-0.5 rounded border border-zinc-200/50">
                                                {tc.requirementId}
                                            </div>
                                        )}
                                        {tc.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getAssignee(tc.assignedToId) ? (
                                        <div className="flex items-center gap-2" title={getAssignee(tc.assignedToId)?.name}>
                                            <img src={getAssignee(tc.assignedToId)?.avatar} alt="avatar" className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-zinc-100" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-zinc-50 border border-dashed border-zinc-300 flex items-center justify-center">
                                            <UserIcon className="w-3 h-3 text-zinc-300" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={tc.status} /></td>
                                <td className="px-6 py-4"><PriorityBadge priority={tc.priority} /></td>
                                <td className={`px-6 py-4 text-right sticky right-0 z-10 transition-colors shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.02)]
                                    ${isActive ? "bg-blue-50/60" : "bg-white group-hover:bg-zinc-50/80"}
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
                                <td colSpan={7}>
                                    <AnimatedEmptyState 
                                        icon={searchQuery ? SearchX : CheckSquare}
                                        title={searchQuery ? "No Matches" : "Empty Project"}
                                        description={searchQuery ? "Try adjusting your filters." : "Get started by creating a test case."}
                                        action={(!searchQuery && currentUser.role !== "TESTER") && (
                                            <button onClick={onCreateCase} className="text-zinc-900 font-bold hover:underline">Create Case</button>
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
        </div>
        
        {/* Preview Panel Removed in favor of full page view */}
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
    </div>
  );
}
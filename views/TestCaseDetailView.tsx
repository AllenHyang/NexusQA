import React from "react";
import { TestCase, User, Project, ExecutionRecord, TestStep } from "../types";
import { StatusBadge, PriorityBadge, TagBadge } from "../components/ui";
import { safeParseTags } from "../lib/formatters";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  User as UserIcon, 
  Calendar, 
  Hash, 
  Link as LinkIcon,
  Layers,
  History,
  PlayCircle,
  Image as ImageIcon,
  MoreHorizontal
} from "lucide-react";

interface TestCaseDetailViewProps {
  projectId: string;
  testCaseId: string;
  testCases: TestCase[];
  users: User[];
  projects: Project[];
  currentUser: User;
  onBack: () => void;
  onEdit: (tc: TestCase) => void;
  onRunTest: (tc: TestCase) => void;
  onDelete: (id: string) => void;
}

export function TestCaseDetailView({
  projectId,
  testCaseId,
  testCases,
  users,
  projects,
  currentUser,
  onBack,
  onEdit,
  onRunTest,
  onDelete
}: TestCaseDetailViewProps) {
  const testCase = testCases.find(tc => tc.id === testCaseId && tc.projectId === projectId);
  const project = projects.find(p => p.id === projectId);
  
  // Helper to get user details
  const getUser = (userId?: string) => users.find(u => u.id === userId);
  const assignee = getUser(testCase?.assignedToId);
  const author = getUser(testCase?.authorId);
  
  const [showActions, setShowActions] = React.useState(false);

  if (!testCase || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
            <SearchX className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Test Case Not Found</h2>
        <p className="text-zinc-500 mb-8 max-w-md">
            The test case you are looking for might have been deleted or moved.
        </p>
        <button 
            onClick={onBack} 
            className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Project
        </button>
      </div>
    );
  }

  const lastRun = testCase.history && testCase.history.length > 0 
    ? testCase.history[testCase.history.length - 1] 
    : null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 sticky top-0 bg-zinc-50/90 backdrop-blur-md py-4 z-30 border-b border-zinc-200/50 -mx-4 md:-mx-8 px-4 md:px-8 gap-4">
          <button 
            onClick={onBack} 
            className="group flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center mr-3 group-hover:border-zinc-300 shadow-sm">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="mr-1">Back to</span>
            <span className="underline decoration-zinc-300 group-hover:decoration-zinc-900 underline-offset-2 truncate max-w-[200px] md:max-w-xs">{project.name}</span>
          </button>

          <div className="flex items-center gap-2 md:gap-3 relative justify-end">
             <div className="text-right mr-2 hidden sm:block">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Last Updated</div>
                 <div className="text-xs font-bold text-zinc-700">Just now</div>
             </div>
             
             {/* Context Menu */}
             <div className="relative">
                <button 
                    onClick={() => setShowActions(!showActions)}
                    className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm"
                >
                    <MoreHorizontal className="w-5 h-5" />
                </button>
                {showActions && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-2xl p-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                             <button 
                                onClick={() => { onEdit(testCase); setShowActions(false); }}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 flex items-center transition-colors"
                             >
                                 Edit Case
                             </button>
                             {currentUser.role === "ADMIN" && (
                                 <button 
                                    onClick={() => { onDelete(testCase.id); }}
                                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center transition-colors"
                                 >
                                     Delete Case
                                 </button>
                             )}
                        </div>
                    </>
                )}
             </div>

             <button 
                onClick={() => onRunTest(testCase)}
                className="px-5 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center"
             >
                 <PlayCircle className="w-4 h-4 mr-2" /> <span className="whitespace-nowrap">Run Test</span>
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT COLUMN (Left) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Title & Basic Info Header */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-200/50 text-zinc-600 text-xs font-mono font-bold border border-zinc-200">
                        {testCase.id}
                    </span>
                    {testCase.requirementId && (
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 flex items-center">
                            <LinkIcon className="w-3 h-3 mr-1.5" />
                            {testCase.requirementId}
                        </span>
                    )}
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-zinc-900 leading-tight tracking-tight mb-4 break-words">
                    {testCase.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                    {safeParseTags(testCase.tags).map(tag => (
                        <TagBadge key={tag} label={tag} />
                    ))}
                </div>
            </div>

            {/* User Story Section (Highlighted) */}
            {testCase.userStory && (
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl opacity-60 blur-sm"></div>
                    <div className="relative bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">User Story</span>
                        </div>
                        <p className="text-lg font-medium text-zinc-800 leading-relaxed italic">
                            "{testCase.userStory}"
                        </p>
                    </div>
                </div>
            )}

            {/* Description & Context */}
            <div className="glass-panel p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide mb-4 flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-zinc-400" /> Description
                </h3>
                <p className="text-zinc-600 leading-7 text-sm">
                    {testCase.description || <span className="italic text-zinc-400">No description provided.</span>}
                </p>

                {testCase.preconditions && (
                    <div className="mt-6 pt-6 border-t border-zinc-100">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Preconditions</h4>
                        <div className="bg-zinc-50 rounded-xl p-4 text-sm text-zinc-700 font-mono border border-zinc-100">
                            {testCase.preconditions}
                        </div>
                    </div>
                )}
            </div>

            {/* Test Steps */}
            <div>
                <h3 className="text-xl font-black text-zinc-900 mb-5 flex items-center">
                    Test Steps
                    <span className="ml-3 bg-zinc-100 text-zinc-500 text-xs font-bold px-2.5 py-1 rounded-full">
                        {testCase.steps.length}
                    </span>
                </h3>
                
                <div className="space-y-4">
                    {testCase.steps.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                            <p className="text-zinc-400 font-medium text-sm">No steps defined for this test case.</p>
                        </div>
                    ) : (
                        testCase.steps.map((step, index) => (
                            <div key={step.id || index} className="group flex gap-4 p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                    {index + 1}
                                </div>
                                <div className="flex-1 grid md:grid-cols-2 gap-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Action</span>
                                        <p className="text-sm text-zinc-800 font-medium leading-relaxed">{step.action}</p>
                                    </div>
                                    <div className="md:border-l md:border-zinc-100 md:pl-6">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Expected Result</span>
                                        <p className="text-sm text-zinc-600 leading-relaxed">{step.expected}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Execution History */}
            <div className="pt-8 border-t border-zinc-200">
                <h3 className="text-lg font-black text-zinc-900 mb-6 flex items-center">
                    <History className="w-5 h-5 mr-2 text-zinc-400" /> Execution History
                </h3>
                
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    {(!testCase.history || testCase.history.length === 0) ? (
                        <div className="p-8 text-center">
                            <p className="text-zinc-400 text-sm font-medium">No execution history available.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-wider">Executed By</th>
                                        <th className="px-6 py-3 font-bold text-zinc-400 text-xs uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {testCase.history.map((record) => (
                                        <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4 text-zinc-600 whitespace-nowrap font-mono text-xs">
                                                {new Date(record.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={record.status} />
                                            </td>
                                            <td className="px-6 py-4 text-zinc-900 font-medium">
                                                {record.executedBy}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 max-w-xs truncate" title={record.notes}>
                                                {record.notes || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* SIDEBAR COLUMN (Right) */}
        <div className="space-y-6">
            
            {/* Status Card */}
            <div className="bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Current Status</h3>
                <div className="flex items-center justify-between mb-6">
                    <StatusBadge status={testCase.status} />
                    <PriorityBadge priority={testCase.priority} />
                </div>
                
                {lastRun && (
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <div className="flex items-start gap-3">
                            {lastRun.status === 'PASSED' ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" /> : 
                             lastRun.status === 'FAILED' ? <XCircle className="w-5 h-5 text-red-500 mt-0.5" /> :
                             <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />}
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Last Run Result</p>
                                <p className="text-sm font-bold text-zinc-900 mb-1">{lastRun.status}</p>
                                <p className="text-xs text-zinc-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" /> 
                                    {new Date(lastRun.date).toLocaleDateString()} by {lastRun.executedBy}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* People & Metadata Card */}
            <div className="bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-sm space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Assignee</h3>
                    {assignee ? (
                        <div className="flex items-center gap-3">
                            <img src={assignee.avatar} alt={assignee.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                            <div>
                                <p className="text-sm font-bold text-zinc-900">{assignee.name}</p>
                                <p className="text-xs text-zinc-500 font-medium">{assignee.role}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-zinc-400">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm italic">Unassigned</span>
                        </div>
                    )}
                </div>
                
                <div className="w-full h-px bg-zinc-100"></div>

                <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Author</h3>
                    {author ? (
                        <div className="flex items-center gap-3">
                            <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                            <div>
                                <p className="text-sm font-bold text-zinc-700">{author.name}</p>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-zinc-400 italic">Unknown</span>
                    )}
                </div>
            </div>

            {/* Visual Reference */}
            <div className="bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Visual Reference</span>
                    <ImageIcon className="w-4 h-4" />
                </h3>
                
                {testCase.visualReference ? (
                    <div className="group relative rounded-xl overflow-hidden border border-zinc-100 cursor-zoom-in bg-zinc-50">
                        <img 
                            src={testCase.visualReference} 
                            alt="Visual Reference" 
                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                ) : (
                    <div className="w-full aspect-video rounded-xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 gap-2">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold">No visual reference</span>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}

// Helper for Not Found Icon
function SearchX({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m13.5 8.5-5 5" />
            <path d="m8.5 8.5 5 5" />
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

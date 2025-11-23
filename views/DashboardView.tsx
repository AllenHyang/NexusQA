import React from "react";
import { Project, TestCase, User } from "../types";
import { StatCard, ProjectCard, AnimatedEmptyState, DonutChart } from "../components/ui";
import { CheckSquare, CheckCircle2, Briefcase, Plus, FolderSearch, Activity, ArrowRight } from "lucide-react";

interface DashboardViewProps {
  testCases: TestCase[];
  projects: Project[];
  currentUser: User;
  searchQuery: string;
  onNewProject: () => void;
  onProjectClick: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onEditProject: (p: Project) => void;
}

export function DashboardView({ testCases, projects, currentUser, searchQuery, onNewProject, onProjectClick, onDeleteProject, onEditProject }: DashboardViewProps) {
  
  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Analytics Data Calculation
  const passedCount = testCases.filter(tc => tc.status === "PASSED").length;
  const failedCount = testCases.filter(tc => tc.status === "FAILED").length;
  const blockedCount = testCases.filter(tc => tc.status === "BLOCKED").length;
  const untestedCount = testCases.filter(tc => tc.status === "UNTESTED" || tc.status === "DRAFT").length;

  const chartData = [
      { label: "Passed", value: passedCount, color: "#10b981" }, // emerald-500
      { label: "Failed", value: failedCount, color: "#ef4444" }, // red-500
      { label: "Blocked", value: blockedCount, color: "#f97316" }, // orange-500
      { label: "Untested", value: untestedCount, color: "#e4e4e7" }, // zinc-200
  ];

  // Recent Activity Extraction
  const recentActivity = testCases
    .flatMap(tc => (tc.history || []).map(h => ({ ...h, testCaseTitle: tc.title, projectId: tc.projectId })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">Overview</h2>
          <p className="text-zinc-500 text-lg font-medium">Welcome back, {currentUser.name.split(' ')[0]}.</p>
        </div>
        {(currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD") && (
          <button 
            onClick={onNewProject}
            className="bg-zinc-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-transform shadow-lg hover:-translate-y-0.5 flex items-center text-sm font-bold uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </button>
        )}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 1. Key Stats (Top Row) */}
        <div className="lg:col-span-1 h-full">
            <StatCard title="Total Cases" value={testCases.length} icon={<CheckSquare />} />
        </div>
        <div className="lg:col-span-1 h-full">
            <StatCard title="Pass Rate" value={`${testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0}%`} icon={<CheckCircle2 />} />
        </div>
        <div className="lg:col-span-1 h-full">
            <StatCard title="Active Projects" value={projects.length} icon={<Briefcase />} />
        </div>
        
        {/* 2. Donut Chart (Square) */}
        <div className="lg:col-span-1 lg:row-span-2 bento-card rounded-[2rem] p-6 flex flex-col items-center justify-center relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 p-6 opacity-50">
                <Activity className="w-6 h-6 text-zinc-300" />
            </div>
            <div className="relative z-10 mt-4">
                 <DonutChart data={chartData} size={180} strokeWidth={18} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-8">
                {chartData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-700">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. Main Projects Area (Large Block) */}
        <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-6 mt-2">
                <h3 className="text-xl font-bold text-zinc-800 tracking-tight">
                    {searchQuery ? `Search Results` : "Recent Projects"}
                </h3>
                {!searchQuery && (
                    <button className="text-xs font-bold text-zinc-400 hover:text-zinc-900 flex items-center transition-colors uppercase tracking-wider">
                        View All <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredProjects.slice(0, searchQuery ? undefined : 3).map((project, idx) => (
                    <ProjectCard 
                        key={project.id}
                        project={project}
                        testCases={testCases.filter(tc => tc.projectId === project.id)}
                        onClick={() => onProjectClick(project.id)}
                        onDelete={onDeleteProject}
                        onEdit={onEditProject}
                        showActions={currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD"}
                        index={idx}
                    />
                ))}
                {filteredProjects.length === 0 && (
                    <div className="col-span-3">
                        <AnimatedEmptyState 
                            icon={FolderSearch}
                            title={searchQuery ? "No matches found" : "Start your journey"}
                            description={searchQuery ? "Try different keywords" : "Create your first project to populate the dashboard."}
                            action={(!searchQuery && (currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD")) && (
                                <button onClick={onNewProject} className="text-yellow-600 font-bold hover:text-yellow-700">
                                    Create Project
                                </button>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>

        {/* 4. Recent Activity Feed (Wide Bottom Block) */}
        <div className="lg:col-span-4 bento-card rounded-[2rem] p-8 bg-white">
            <h4 className="font-bold text-zinc-900 text-lg mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-yellow-500" />
                Activity Feed
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                            activity.status === 'PASSED' ? 'bg-green-500' : 
                            activity.status === 'FAILED' ? 'bg-red-500' : 
                            activity.status === 'BLOCKED' ? 'bg-orange-500' : 'bg-zinc-300'
                        }`}></div>
                        <div>
                            <p className="text-sm text-zinc-500 leading-snug">
                                <span className="font-bold text-zinc-800">{activity.executedBy}</span> marked <span className="font-bold text-zinc-800">{activity.testCaseTitle}</span> as <span className="font-black">{activity.status}</span>
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-wide">
                                {new Date(activity.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center text-zinc-400 py-8">No recent activity.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
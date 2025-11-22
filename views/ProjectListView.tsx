
import React from "react";
import { Project, TestCase, User } from "../types";
import { ProjectCard, AnimatedEmptyState } from "../components/ui";
import { Plus, Briefcase, SearchX, Layers } from "lucide-react";

interface ProjectListViewProps {
  projects: Project[];
  testCases: TestCase[];
  currentUser: User;
  searchQuery: string;
  onNewProject: () => void;
  onProjectClick: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onEditProject: (p: Project) => void;
}

export function ProjectListView({ projects, testCases, currentUser, searchQuery, onNewProject, onProjectClick, onDeleteProject, onEditProject }: ProjectListViewProps) {
  
  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Modern Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-white flex items-center justify-center shadow-lg shadow-yellow-400/20 rotate-3">
                <Layers className="w-6 h-6 text-black" />
             </div>
             <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">All Projects</h2>
          </div>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl">
            Manage your test suites, track progress, and organize workflows across all active projects.
          </p>
        </div>
        
        {(currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD") && (
          <button 
            onClick={onNewProject}
            className="group relative overflow-hidden bg-zinc-900 text-white px-7 py-3.5 rounded-2xl shadow-xl shadow-zinc-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center text-sm font-bold uppercase tracking-wider"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
               <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300 text-yellow-400" /> 
               New Project
            </span>
          </button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id}
            project={project}
            testCases={testCases.filter(tc => tc.projectId === project.id)}
            onClick={() => onProjectClick(project.id)}
            onDelete={onDeleteProject}
            onEdit={onEditProject}
            showActions={currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD"}
          />
        ))}
        
        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="col-span-full">
            <AnimatedEmptyState 
                icon={searchQuery ? SearchX : Briefcase}
                title={searchQuery ? "No Projects Found" : "Start Building"}
                description={searchQuery ? `No projects match "${searchQuery}". Try adjusting your filters.` : "Your workspace is empty. Create your first project to begin testing."}
                action={(!searchQuery && (currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD")) && (
                    <button 
                        onClick={onNewProject} 
                        className="mt-4 px-8 py-4 bg-yellow-400 text-black font-black rounded-2xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20 flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create First Project
                    </button>
                )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

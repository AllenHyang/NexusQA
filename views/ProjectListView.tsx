
import React from "react";
import { Project, TestCase, User } from "../types";
import { ProjectCard, AnimatedEmptyState } from "../components/ui";
import { Plus, Briefcase, SearchX } from "lucide-react";

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
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">All Projects</h2>
          <p className="text-slate-500 mt-2 font-medium">Browse all active test suites and projects.</p>
        </div>
        {(currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD") && (
          <button 
            onClick={onNewProject}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all flex items-center text-sm font-bold">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        {filteredProjects.length === 0 && (
          <AnimatedEmptyState 
            icon={searchQuery ? SearchX : Briefcase}
            title={searchQuery ? "No Projects Found" : "Welcome to NexusQA"}
            description={searchQuery ? `No projects match "${searchQuery}". Try a different keyword.` : "Your dashboard is empty. Create a project to begin."}
            action={(!searchQuery && (currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD")) && (
                <button 
                    onClick={onNewProject} 
                    className="bg-white border border-indigo-100 text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                >
                    Create First Project
                </button>
            )}
          />
        )}
      </div>
    </div>
  );
}

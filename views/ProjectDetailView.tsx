"use client";

import React, { useState } from "react";
import { Project, TestCase, User, TestSuite, TestPlan, TestStatus } from "../types";
import { Download, Plus, ChevronDown, Trash2, Pencil, Github, BarChart3, Layout, ClipboardList, FolderInput, Bug } from "lucide-react";
import { Tooltip } from "../components/ui";

// Import the new sub-views
import { ProjectCasesView } from "./ProjectCasesView";
import { ProjectDefectsView } from "./ProjectDefectsView";
import { ProjectPlansView } from "./ProjectPlansView";
import { ProjectAnalyticsView } from "./ProjectAnalyticsView";

// Update props interface
interface ProjectDetailViewProps {
  project: Project;
  testCases: TestCase[];
  suites: TestSuite[];
  currentUser: User;
  users: User[];
  searchQuery: string;
  onExport: () => void;
  onExportExcel: () => void;
  onCreateCase: (suiteId?: string | null) => void;
  onEditCase: (tc: TestCase) => void;
  onDeleteCase: (id: string) => void;
  onDuplicateCase: (tc: TestCase) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusUpdate: (ids: string[], status: TestStatus) => void;
  onBulkMove: (ids: string[], targetSuiteId: string | null) => void;
  onViewCaseDetails: (projectId: string, testCaseId: string) => void;
  onImportCases: () => void;
  onCreateSuite: (parentId: string | null, name: string) => void;
  onRenameSuite: (id: string, name: string) => void;
  onDeleteSuite: (id: string) => void;
  onEditProject: () => void;
  onDeleteProject: (id: string) => void;
  plans: TestPlan[];
  onCreatePlan: (data: Partial<TestPlan>) => void;
  onAddToPlan: (planId: string, caseIds: string[]) => void;
}

export function ProjectDetailView({
  project,
  testCases,
  suites,
  currentUser,
  users,
  searchQuery,
  onExport,
  onExportExcel,
  onCreateCase,
  onEditCase,
  onDeleteCase,
  onDuplicateCase,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkMove,
  onViewCaseDetails,
  onImportCases,
  onCreateSuite,
  onRenameSuite,
  onDeleteSuite,
  onEditProject,
  onDeleteProject,
  plans,
  onCreatePlan,
  onAddToPlan
}: ProjectDetailViewProps) {
  // New state for top-level navigation
  const [activeMainTab, setActiveMainTab] = useState<"CASES" | "PLANS" | "DEFECTS" | "ANALYTICS">("CASES");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showMobileFolders, setShowMobileFolders] = useState(false); // Still needed for cases view

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Non-scrolling */}
      <div className="flex-shrink-0 pt-4 px-4 md:pt-8 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 bg-[#F2F0E9]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">{project.name}</h1>
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
          <p className="text-zinc-500 max-w-2xl line-clamp-1 font-medium text-sm md:text-base">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:space-x-3">
          {/* New Top-Level Navigation Tabs */}
          <div className="flex bg-white rounded-xl p-1 border border-zinc-200 shadow-sm">
              <button 
                onClick={() => setActiveMainTab("CASES")}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${activeMainTab === "CASES" ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <Layout className="w-3.5 h-3.5 mr-1.5" /> <span className="hidden sm:inline">Test Cases</span>
              </button>
              <button 
                onClick={() => setActiveMainTab("PLANS")}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${activeMainTab === "PLANS" ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> <span className="hidden sm:inline">Test Plans</span>
              </button>
              <button 
                onClick={() => setActiveMainTab("DEFECTS")}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${activeMainTab === "DEFECTS" ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <Bug className="w-3.5 h-3.5 mr-1.5" /> <span className="hidden sm:inline">Defects</span>
              </button>
              <button 
                onClick={() => setActiveMainTab("ANALYTICS")}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-all ${activeMainTab === "ANALYTICS" ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> <span className="hidden sm:inline">Analytics</span>
              </button>
          </div>
          
          {(currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD") && (
            <>
                <Tooltip content="Edit Project">
                    <button onClick={onEditProject} className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-200 bg-white shadow-sm">
                        <Pencil className="w-4 h-4" />
                    </button>
                </Tooltip>
                <Tooltip content="Delete Project">
                    <button onClick={() => onDeleteProject(project.id)} className="p-2.5 rounded-xl hover:bg-red-50 text-zinc-500 hover:text-red-600 transition-colors border border-zinc-200 bg-white shadow-sm">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </Tooltip>
                <div className="w-px h-6 bg-zinc-300 mx-1 hidden md:block"></div>
            </>
          )}

          {activeMainTab === "CASES" && ( // Only show export/import/create case for Cases tab
            <>
              <div className="relative">
                <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="glass-button px-4 py-2.5 rounded-xl text-sm font-bold flex items-center"
                >
                    <Download className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Export</span>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </button>
                {showExportDropdown && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-2xl p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                            <button
                                onClick={() => { onExport(); setShowExportDropdown(false); }}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-50 flex items-center font-bold text-zinc-700"
                            >
                                JSON Export
                            </button>
                            <button
                                onClick={() => { onExportExcel(); setShowExportDropdown(false); }}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-50 flex items-center font-bold text-zinc-700"
                            >
                                Excel Export
                            </button>
                        </div>
                    </>
                )}
              </div>
              {(currentUser.role === "ADMIN" || currentUser.role === "QA_LEAD") && (
                <button
                  onClick={onImportCases}
                  className="glass-button px-4 py-2.5 rounded-xl text-sm font-bold flex items-center"
                >
                  <FolderInput className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Import</span>
                </button>
              )}
              {(currentUser.role !== "TESTER") && (
                <button 
                  onClick={() => onCreateCase(null)} // passing null for suiteId for now, will be refined in ProjectCasesView
                  className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center hover:bg-black shadow-lg hover:-translate-y-0.5 transition-all ml-auto md:ml-0">
                  <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Create Case</span><span className="md:hidden">New</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeMainTab === "CASES" && (
          <ProjectCasesView 
            project={project}
            testCases={testCases}
            suites={suites}
            currentUser={currentUser}
            users={users}
            searchQuery={searchQuery}
            onCreateCase={onCreateCase}
            onEditCase={onEditCase}
            onDeleteCase={onDeleteCase}
            onDuplicateCase={onDuplicateCase}
            onBulkDelete={onBulkDelete}
            onBulkStatusUpdate={onBulkStatusUpdate}
            onBulkMove={onBulkMove}
            onViewCaseDetails={onViewCaseDetails}
            onCreateSuite={onCreateSuite}
            onRenameSuite={onRenameSuite}
            onDeleteSuite={onDeleteSuite}
            plans={plans}
            onAddToPlan={onAddToPlan}
            showMobileFolders={showMobileFolders}
            setShowMobileFolders={setShowMobileFolders}
          />
        )}
        {activeMainTab === "PLANS" && (
          <ProjectPlansView
            project={project}
            plans={plans}
            onCreatePlan={onCreatePlan}
          />
        )}
        {activeMainTab === "DEFECTS" && (
          <ProjectDefectsView
            project={project}
            currentUser={currentUser}
          />
        )}
        {activeMainTab === "ANALYTICS" && (
          <ProjectAnalyticsView
            project={project}
            testCases={testCases}
          />
        )}
      </div>
    </div>
  );
}
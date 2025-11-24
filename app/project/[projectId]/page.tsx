"use client";

import React, { useEffect } from "react";
import { ProjectDetailView } from "@/views/ProjectDetailView";
import { useAppStore } from "@/store/useAppStore";
import { useUI } from "@/contexts/UIContext";
import { useRouter, useParams } from "next/navigation";
import { TestCase, TestStatus } from "@/types";
import { generateExcelExport } from "@/lib/exportGenerator";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  
  const { 
    projects, testCases, suites, 
    deleteTestCase, bulkDeleteTestCases, bulkUpdateStatus, bulkMoveTestCases,
    createSuite, renameSuite, deleteSuite,
    deleteProject,
    fetchPlans, plans, createPlan, addCasesToPlan,
    currentUser, users
  } = useAppStore();
  
  const { 
    openTestCaseModal, searchQuery, openImportCasesModal, openEditProjectModal 
  } = useUI();

  useEffect(() => {
      if (projectId) {
          fetchPlans(projectId);
      }
  }, [projectId, fetchPlans]);

  const project = projects.find(p => p.id === projectId);
  const projectCases = testCases.filter(tc => tc.projectId === projectId);
  const projectSuites = suites.filter(s => s.projectId === projectId);

  if (!project) return <div className="p-8">Project not found</div>;
  if (!currentUser) return null;

  return (
    <ProjectDetailView 
        project={project}
        testCases={projectCases}
        suites={projectSuites}
        currentUser={currentUser}
        users={users}
        searchQuery={searchQuery}
        defectTrackerUrl="" // TODO - this prop is now unused by ProjectDetailView
        onExport={() => {
            const exportData = {
                ...project,
                suites: projectSuites,
                testCases: projectCases
            };
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = `${project.name}_export.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }}
        onExportExcel={() => generateExcelExport(project, projectCases, projectSuites)}
        onCreateCase={(suiteId) => openTestCaseModal({ projectId: project.id, suiteId: suiteId || undefined })}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEditCase={openTestCaseModal as any}
        onDeleteCase={deleteTestCase}
        onDuplicateCase={(tc: TestCase) => {
            const dupe = { ...tc, id: undefined, title: `${tc.title} (Copy)`, status: "UNTESTED" as TestStatus, history: [] };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            openTestCaseModal(dupe as any);
        }}
        // The onViewHistory prop is no longer directly handled by ProjectDetailView, 
        // as the test case details view will handle its own history.
        // onViewHistory={openHistoryModal as any}
        onImportCases={() => openImportCasesModal(project.id)}
        onBulkDelete={bulkDeleteTestCases}
        onBulkStatusUpdate={bulkUpdateStatus}
        onBulkMove={bulkMoveTestCases}
        onViewCaseDetails={(pid, tid) => router.push(`/project/${pid}/case/${tid}`)}
        
        onCreateSuite={(parentId, name) => createSuite(projectId, parentId, name)}
        onRenameSuite={renameSuite}
        onDeleteSuite={deleteSuite}
        
        onEditProject={() => openEditProjectModal(project)}
        onDeleteProject={async (id) => {
            if (confirm("Are you sure you want to delete this project?")) {
                await deleteProject(id);
                router.push('/projects');
            }
        }}
        plans={plans}
        onCreatePlan={(data) => createPlan(projectId, data)}
        onAddToPlan={addCasesToPlan}
    />
  );
}
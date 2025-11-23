"use client";

import React from "react";
import { ProjectDetailView } from "@/views/ProjectDetailView";
import { useAppStore } from "@/store/useAppStore";
import { useUI } from "@/contexts/UIContext";
import { useRouter, useParams } from "next/navigation";
import { TestCase, TestStatus } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  
  const { 
    projects, testCases, suites, 
    deleteTestCase, bulkDeleteTestCases, bulkUpdateStatus, bulkMoveTestCases,
    createSuite, renameSuite, deleteSuite,
    currentUser, users
  } = useAppStore();
  
  const { 
    openTestCaseModal, openHistoryModal, searchQuery 
  } = useUI();

  const project = projects.find(p => p.id === projectId);
  const projectCases = testCases.filter(tc => tc.projectId === projectId);
  const projectSuites = suites.filter(s => s.projectId === projectId);

  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <ProjectDetailView 
        project={project}
        testCases={projectCases}
        suites={projectSuites}
        currentUser={currentUser}
        users={users}
        searchQuery={searchQuery}
        defectTrackerUrl="" // TODO
        onExport={() => alert("Exporting feature coming soon!")}
        onCreateCase={() => openTestCaseModal({ projectId: project.id })}
        onEditCase={openTestCaseModal}
        onDeleteCase={deleteTestCase}
        onDuplicateCase={(tc: TestCase) => {
            const dupe = { ...tc, id: undefined, title: `${tc.title} (Copy)`, status: "UNTESTED" as TestStatus, history: [] };
            openTestCaseModal(dupe);
        }}
        onViewHistory={openHistoryModal}
        onBulkDelete={bulkDeleteTestCases}
        onBulkStatusUpdate={bulkUpdateStatus}
        onBulkMove={bulkMoveTestCases}
        onViewCaseDetails={(pid, tid) => router.push(`/project/${pid}/case/${tid}`)}
        
        onCreateSuite={(parentId, name) => createSuite(projectId, parentId, name)}
        onRenameSuite={renameSuite}
        onDeleteSuite={deleteSuite}
    />
  );
}

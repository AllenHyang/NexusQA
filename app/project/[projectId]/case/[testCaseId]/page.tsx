"use client";

import React from "react";
import { TestCaseDetailView } from "@/views/TestCaseDetailView";
import { useAppStore } from "@/store/useAppStore";
import { useUI } from "@/contexts/UIContext";
import { useRouter, useParams } from "next/navigation";

export default function TestCaseDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const testCaseId = params.testCaseId as string;
  const router = useRouter();

  const { projects, testCases, deleteTestCase, currentUser, users } = useAppStore();
  const { openTestCaseModal } = useUI();

  return (
    <TestCaseDetailView
        projectId={projectId}
        testCaseId={testCaseId}
        testCases={testCases}
        users={users}
        projects={projects}
        currentUser={currentUser}
        onBack={() => router.push(`/project/${projectId}`)}
        onEdit={openTestCaseModal}
        onRunTest={openTestCaseModal}
        onDelete={(id) => { 
             deleteTestCase(id); 
             router.push(`/project/${projectId}`);
        }}
    />
  );
}

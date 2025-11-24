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

  if (!currentUser) return null;

  return (
    <TestCaseDetailView
        projectId={projectId}
        testCaseId={testCaseId}
        testCases={testCases}
        users={users}
        projects={projects}
        currentUser={currentUser}
        onBack={() => router.push(`/project/${projectId}`)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEdit={(tc) => openTestCaseModal(tc as any, 'EDIT')}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRunTest={(tc) => openTestCaseModal(tc as any, 'RUN')}
        onDelete={(id) => { 
             deleteTestCase(id); 
             router.push(`/project/${projectId}`);
        }}
    />
  );
}

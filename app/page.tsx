"use client";

import React from "react";
import { DashboardView } from "@/views/DashboardView";
import { useAppStore } from "@/store/useAppStore";
import { useUI } from "@/contexts/UIContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { projects, testCases, deleteProject, currentUser } = useAppStore();
  const { openNewProjectModal, openEditProjectModal, searchQuery } = useUI();
  const router = useRouter();

  if (!currentUser) return null; // Handled by ClientLayout

  return (
    <DashboardView 
        testCases={testCases}
        projects={projects}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onNewProject={openNewProjectModal}
        onProjectClick={(id) => router.push(`/project/${id}`)}
        onDeleteProject={(id) => {
            if (confirm("Are you sure?")) deleteProject(id);
        }}
        onEditProject={openEditProjectModal}
    />
  );
}
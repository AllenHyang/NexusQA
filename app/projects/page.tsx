"use client";

import React from "react";
import { ProjectListView } from "@/views/ProjectListView";
import { useAppStore } from "@/store/useAppStore";
import { useUI } from "@/contexts/UIContext";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { projects, testCases, deleteProject, currentUser } = useAppStore();
  const { openNewProjectModal, openEditProjectModal, searchQuery } = useUI();
  const router = useRouter();

  if (!currentUser) return null;

  return (
    <ProjectListView 
        projects={projects}
        testCases={testCases}
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

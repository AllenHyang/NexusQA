"use client";

import React from "react";
import { Project, TestPlan } from "../types";
import { PlanList } from "../components/PlanList";
import { useAppStore } from "@/store/useAppStore"; // Import useAppStore

interface ProjectPlansViewProps {
  project: Project; // To pass projectId to PlanList
  plans: TestPlan[];
  onCreatePlan: (data: Partial<TestPlan>) => void;
}

export function ProjectPlansView({ project, plans, onCreatePlan }: ProjectPlansViewProps) {
  const { duplicateTestPlan } = useAppStore(); // Get duplicateTestPlan action

  const handleDuplicatePlan = async (planId: string) => {
      // Add confirmation or toast here? For now, just duplicate.
      await duplicateTestPlan(planId);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-6">
        <PlanList 
          projectId={project.id} 
          plans={plans} 
          onCreatePlan={onCreatePlan} 
          onDuplicatePlan={handleDuplicatePlan} // Pass the handler
        />
    </div>
  );
}
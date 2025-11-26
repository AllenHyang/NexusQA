"use client";

import React from "react";
import { Project, TestPlan } from "../types";
import { PlanList } from "../components/PlanList";
import { useAppStore } from "@/store/useAppStore";

interface ProjectPlansViewProps {
  project: Project;
  plans: TestPlan[];
  onCreatePlan: (data: Partial<TestPlan>) => void;
}

export function ProjectPlansView({ project, plans, onCreatePlan }: ProjectPlansViewProps) {
  const { duplicateTestPlan, deleteTestPlan } = useAppStore();

  const handleDuplicatePlan = async (planId: string) => {
      await duplicateTestPlan(planId);
  };

  const handleDeletePlan = async (planId: string) => {
      await deleteTestPlan(planId);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-6">
        <PlanList
          projectId={project.id}
          plans={plans}
          onCreatePlan={onCreatePlan}
          onDuplicatePlan={handleDuplicatePlan}
          onDeletePlan={handleDeletePlan}
        />
    </div>
  );
}
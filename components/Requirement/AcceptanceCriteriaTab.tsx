"use client";

import React from "react";
import {
  Activity,
  Target,
  Plus,
  Trash2,
} from "lucide-react";
import { TabProps } from "./types";
import { AIButton } from "./AIButton";
import { CommentsTab } from "./CommentsTab";
import { AcceptanceCriteria, User } from "@/types";
import { MentionInput } from "@/components/MentionInput";

interface AcceptanceCriteriaTabProps extends TabProps {
  aiGenerating: string | null;
  onAIGenerate: (fieldType: string) => void;
  onAddAC: () => void;
  onUpdateAC: (index: number, field: keyof AcceptanceCriteria, value: string) => void;
  onRemoveAC: (index: number) => void;
  currentUser: User;
}

export function AcceptanceCriteriaTab({
  isEditMode,
  requirement,
  formState,
  aiGenerating,
  onAIGenerate,
  onAddAC,
  onUpdateAC,
  onRemoveAC,
  currentUser,
}: AcceptanceCriteriaTabProps) {
  const { acceptanceCriteria } = formState;

  if (!isEditMode) {
    // View Mode - 只显示 AC 定义
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-zinc-600" />
          <h4 className="font-bold text-zinc-900">验收标准</h4>
          <span className="text-xs text-zinc-400">
            ({acceptanceCriteria.length} 项)
          </span>
        </div>

        {acceptanceCriteria.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
            <Target className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400">暂无验收标准</p>
          </div>
        ) : (
          <div className="space-y-3">
            {acceptanceCriteria.map((ac, index) => (
              <div
                key={ac.id}
                className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="text-sm text-zinc-700 pt-1.5">{ac.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-zinc-400 text-center pt-2">
          测试覆盖情况请查看「关联用例」标签页
        </p>

        {/* Discussion Section */}
        {requirement && (
          <CommentsTab
            requirementId={requirement.id}
            currentUser={currentUser}
            topic="ACCEPTANCE_CRITERIA"
            compact
          />
        )}
      </div>
    );
  }

  // Edit Mode - 只编辑 AC 定义
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-zinc-500 uppercase">
          验收标准 (AC)
        </label>
        <div className="flex items-center gap-2">
          <AIButton
            fieldType="acceptanceCriteria"
            label="AI 生成"
            generating={aiGenerating}
            onGenerate={onAIGenerate}
          />
          <button
            onClick={onAddAC}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-3 h-3" /> 添加
          </button>
        </div>
      </div>

      {acceptanceCriteria.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
          <Target className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">添加可验证的验收标准</p>
        </div>
      ) : (
        <div className="space-y-3">
          {acceptanceCriteria.map((ac, index) => (
            <div key={ac.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-zinc-400 mt-2.5">AC-{index + 1}</span>
                <div className="flex-1">
                  <MentionInput
                    value={ac.description}
                    onChange={(value) => onUpdateAC(index, "description", value)}
                    placeholder="描述具体可测的验收标准..."
                    rows={2}
                    className="bg-white"
                  />
                </div>
                <button
                  onClick={() => onRemoveAC(index)}
                  className="p-1.5 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-400 text-center pt-2">
        定义完 AC 后，可在「关联用例」标签页管理测试覆盖
      </p>
    </div>
  );
}

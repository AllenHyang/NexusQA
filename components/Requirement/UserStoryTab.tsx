"use client";

import React from "react";
import { BookOpen, Users, Layers, Code2, Plus, Trash2 } from "lucide-react";
import { TabProps } from "./types";
import { TARGET_USER_OPTIONS } from "./constants";
import { AIButton } from "./AIButton";
import { CommentsTab } from "./CommentsTab";
import { UserStory, BusinessRule, User } from "@/types";
import { MentionInput } from "@/components/MentionInput";

interface UserStoryTabProps extends TabProps {
  aiGenerating: string | null;
  onAIGenerate: (fieldType: string) => void;
  currentUser: User;
}

export function UserStoryTab({
  isEditMode,
  requirement,
  formState,
  formActions,
  aiGenerating,
  onAIGenerate,
  currentUser,
}: UserStoryTabProps) {
  // Add new user story
  const handleAddUserStory = () => {
    const newStory: UserStory = {
      id: `us-${Date.now()}`,
      role: "",
      goal: "",
      benefit: "",
    };
    formActions.setUserStories([...formState.userStories, newStory]);
  };

  // Update user story
  const handleUpdateUserStory = (index: number, field: keyof UserStory, value: string) => {
    const updated = [...formState.userStories];
    updated[index] = { ...updated[index], [field]: value };
    formActions.setUserStories(updated);
  };

  // Remove user story
  const handleRemoveUserStory = (id: string) => {
    formActions.setUserStories(formState.userStories.filter((s) => s.id !== id));
  };

  // Add business rule
  const handleAddBusinessRule = () => {
    const newRule: BusinessRule = {
      id: `br-${Date.now()}`,
      code: `BR-${String(formState.businessRules.length + 1).padStart(3, "0")}`,
      description: "",
    };
    formActions.setBusinessRules([...formState.businessRules, newRule]);
  };

  // Update business rule
  const handleUpdateBusinessRule = (index: number, field: keyof BusinessRule, value: string) => {
    const updated = [...formState.businessRules];
    updated[index] = { ...updated[index], [field]: value };
    formActions.setBusinessRules(updated);
  };

  // Remove business rule
  const handleRemoveBusinessRule = (index: number) => {
    formActions.setBusinessRules(formState.businessRules.filter((_, i) => i !== index));
  };

  // Toggle target user
  const handleToggleTargetUser = (userId: string) => {
    if (formState.targetUsers.includes(userId)) {
      formActions.setTargetUsers(formState.targetUsers.filter((u) => u !== userId));
    } else {
      formActions.setTargetUsers([...formState.targetUsers, userId]);
    }
  };

  // View Mode
  if (!isEditMode && requirement) {
    return (
      <div className="space-y-6">
        {/* User Stories Card */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-zinc-900">用户故事</h4>
            {formState.userStories.length > 0 && (
              <span className="text-xs text-zinc-400">({formState.userStories.length})</span>
            )}
          </div>
          {formState.userStories.length > 0 ? (
            <div className="space-y-3">
              {formState.userStories.map((story, index) => (
                <div key={story.id} className="p-4 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-600">US-{index + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    <span className="text-zinc-500">作为</span>{" "}
                    <span className="font-medium text-blue-700">{story.role}</span>
                    <span className="text-zinc-500">，我希望</span>{" "}
                    <span className="font-medium text-zinc-900">{story.goal}</span>
                    <span className="text-zinc-500">，以便</span>{" "}
                    <span className="font-medium text-green-700">{story.benefit}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 italic">暂无用户故事</p>
          )}
        </div>

        {/* Target Users */}
        <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-zinc-600" />
            <h4 className="font-bold text-zinc-900">目标用户</h4>
          </div>
          {formState.targetUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formState.targetUsers.map((userId) => {
                const user = TARGET_USER_OPTIONS.find((u) => u.value === userId);
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm"
                  >
                    <span>{user?.icon}</span>
                    <span className="text-zinc-700">{user?.label || userId}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 italic">暂未指定目标用户</p>
          )}
        </div>

        {/* Preconditions */}
        <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-zinc-600" />
            <h4 className="font-bold text-zinc-900">前置条件</h4>
          </div>
          {formState.preconditions ? (
            <div className="p-4 bg-white rounded-lg border border-zinc-200">
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{formState.preconditions}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-400 italic">暂无前置条件</p>
          )}
        </div>

        {/* Business Rules */}
        <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-zinc-600" />
            <h4 className="font-bold text-zinc-900">业务规则</h4>
            {formState.businessRules.length > 0 && (
              <span className="text-xs text-zinc-400">({formState.businessRules.length})</span>
            )}
          </div>
          {formState.businessRules.length > 0 ? (
            <div className="space-y-2">
              {formState.businessRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-zinc-200"
                >
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-mono">
                    {rule.code}
                  </span>
                  <p className="text-sm text-zinc-700 flex-1">{rule.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 italic">暂无业务规则</p>
          )}
        </div>

        {/* Discussion Section */}
        <CommentsTab
          requirementId={requirement.id}
          currentUser={currentUser}
          topic="USER_STORY"
          compact
        />
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-5">
      {/* User Stories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-zinc-500 uppercase">用户故事</label>
          <div className="flex items-center gap-2">
            <AIButton
              fieldType="userStory"
              label="AI 生成"
              generating={aiGenerating}
              onGenerate={onAIGenerate}
            />
            <button
              onClick={handleAddUserStory}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3 h-3" /> 添加故事
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          使用 BDD 格式: 作为[用户角色]，我希望[目标]，以便[价值]
        </p>

        {formState.userStories.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
            <BookOpen className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm">添加用户故事来描述不同角色的需求</p>
          </div>
        ) : (
          <div className="space-y-3">
            {formState.userStories.map((story, index) => (
              <div
                key={story.id}
                className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600">US-{index + 1}</span>
                  <button
                    onClick={() => handleRemoveUserStory(story.id)}
                    className="p-1 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-12 shrink-0">作为</span>
                    <input
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                      value={story.role}
                      onChange={(e) => handleUpdateUserStory(index, "role", e.target.value)}
                      placeholder="用户角色，如：注册用户、管理员"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-12 shrink-0">我希望</span>
                    <input
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                      value={story.goal}
                      onChange={(e) => handleUpdateUserStory(index, "goal", e.target.value)}
                      placeholder="功能目标，如：使用邮箱登录系统"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-12 shrink-0">以便</span>
                    <input
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                      value={story.benefit}
                      onChange={(e) => handleUpdateUserStory(index, "benefit", e.target.value)}
                      placeholder="价值/原因，如：访问我的个人账户"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Target Users */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">目标用户</label>
        <div className="flex flex-wrap gap-2">
          {TARGET_USER_OPTIONS.map((user) => (
            <button
              key={user.value}
              onClick={() => handleToggleTargetUser(user.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                formState.targetUsers.includes(user.value)
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <span>{user.icon}</span>
              <span>{user.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preconditions */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-zinc-500 uppercase">前置条件</label>
          <AIButton
            fieldType="preconditions"
            label="AI 生成"
            generating={aiGenerating}
            onGenerate={onAIGenerate}
          />
        </div>
        <MentionInput
          value={formState.preconditions}
          onChange={formActions.setPreconditions}
          placeholder="描述此需求的前提条件或依赖..."
          rows={3}
        />
      </div>

      {/* Business Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-zinc-500 uppercase">业务规则</label>
          <div className="flex items-center gap-2">
            <AIButton
              fieldType="businessRules"
              label="AI 生成"
              generating={aiGenerating}
              onGenerate={onAIGenerate}
            />
            <button
              onClick={handleAddBusinessRule}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3 h-3" /> 添加规则
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {formState.businessRules.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center border border-dashed border-zinc-200 rounded-lg">
              暂无业务规则，点击上方按钮添加
            </p>
          ) : (
            formState.businessRules.map((rule, index) => (
              <div
                key={rule.id}
                className="flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <input
                  className="w-24 px-2 py-1.5 rounded border border-zinc-200 bg-white text-zinc-900 text-xs font-mono"
                  value={rule.code}
                  onChange={(e) => handleUpdateBusinessRule(index, "code", e.target.value)}
                  placeholder="BR-001"
                />
                <div className="flex-1">
                  <MentionInput
                    value={rule.description}
                    onChange={(value) => handleUpdateBusinessRule(index, "description", value)}
                    placeholder="描述业务规则..."
                    rows={1}
                    className="bg-white"
                  />
                </div>
                <button
                  onClick={() => handleRemoveBusinessRule(index)}
                  className="p-1.5 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

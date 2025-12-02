"use client";

import React, { useState, useMemo } from "react";
import {
  XCircle as XIcon,
  Calendar,
  Clock,
  User as UserIcon,
  BarChart3,
  GitBranch,
  Trash2,
} from "lucide-react";
import { TabProps, TestStats } from "./types";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  RELATION_TYPE_OPTIONS,
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
} from "./constants";
import { AIButton } from "./AIButton";
import { FieldError, RequiredIndicator } from "./SubmitFeedback";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentsTab } from "./CommentsTab";
import { InternalRequirement, RelatedRequirement, TestCase, RequirementStatus, User } from "@/types";
import { MentionInput } from "@/components/MentionInput";

interface BasicInfoTabProps extends TabProps {
  linkedTestCases: TestCase[];
  otherRequirements: InternalRequirement[];
  aiGenerating: string | null;
  onAIGenerate: (fieldType: string) => void;
  currentUser: User;
  users?: User[];
}

export function BasicInfoTab({
  isEditMode,
  requirement,
  formState,
  formActions,
  linkedTestCases,
  otherRequirements,
  aiGenerating,
  onAIGenerate,
  currentUser,
  users = [],
}: BasicInfoTabProps) {
  const [tagInput, setTagInput] = useState("");

  // Calculate test execution stats
  const testStats: TestStats = useMemo(() => {
    const total = linkedTestCases.length;
    const executed = linkedTestCases.filter((tc) => tc.status !== "UNTESTED").length;
    const passed = linkedTestCases.filter((tc) => tc.status === "PASSED").length;
    const failed = linkedTestCases.filter((tc) => tc.status === "FAILED").length;
    const blocked = linkedTestCases.filter((tc) => tc.status === "BLOCKED").length;

    const executionProgress = total > 0 ? (executed / total) * 100 : 0;
    const passRate = passed + failed > 0 ? (passed / (passed + failed)) * 100 : 0;

    return { total, executed, passed, failed, blocked, executionProgress, passRate };
  }, [linkedTestCases]);

  // Tag handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !formState.tags.includes(tagInput.trim())) {
      formActions.setTags([...formState.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    formActions.setTags(formState.tags.filter((t) => t !== tag));
  };

  // Related Requirement handlers
  const handleAddRelatedRequirement = (reqId: string, type: RelatedRequirement["type"]) => {
    if (formState.relatedRequirements.some((r) => r.id === reqId)) return;
    formActions.setRelatedRequirements([...formState.relatedRequirements, { id: reqId, type }]);
  };

  const handleRemoveRelatedRequirement = (reqId: string) => {
    formActions.setRelatedRequirements(formState.relatedRequirements.filter((r) => r.id !== reqId));
  };

  // View Mode
  if (!isEditMode && requirement) {
    return (
      <div className="space-y-6">
        {/* Header Card */}
        <div className="p-5 bg-gradient-to-br from-zinc-50 to-white rounded-xl border border-zinc-200 shadow-sm">
          <h4 className="text-xl font-bold text-zinc-900 mb-4">{formState.title || "无标题"}</h4>

          {/* Status Badges & Key People */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadgeStyle(
                  formState.status
                )}`}
              >
                {STATUS_OPTIONS.find((s) => s.value === formState.status)?.label}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getPriorityBadgeStyle(
                  formState.priority
                )}`}
              >
                {PRIORITY_OPTIONS.find((p) => p.value === formState.priority)?.label}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                  requirement.acceptanceStatus === "ACCEPTED"
                    ? "bg-green-100 text-green-700"
                    : requirement.acceptanceStatus === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {requirement.acceptanceStatus === "ACCEPTED"
                  ? "已验收"
                  : requirement.acceptanceStatus === "REJECTED"
                  ? "已拒绝"
                  : "待验收"}
              </span>
            </div>
            {/* Owner & Reviewer - Prominent Display */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-blue-500" />
                <span className="text-zinc-500">负责人:</span>
                <span className="font-medium text-zinc-900">
                  {formState.ownerId ? (users.find(u => u.id === formState.ownerId)?.name || "-") : "-"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-purple-500" />
                <span className="text-zinc-500">评审人:</span>
                <span className="font-medium text-zinc-900">
                  {formState.reviewerId ? (users.find(u => u.id === formState.reviewerId)?.name || "-") : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">标签</label>
            {formState.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formState.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-zinc-400">暂无标签</span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">需求描述</label>
            {formState.description ? (
              <div className="p-3 bg-white rounded-lg border border-zinc-100">
                <MarkdownRenderer content={formState.description} />
              </div>
            ) : (
              <span className="text-sm text-zinc-400">暂无描述</span>
            )}
          </div>
        </div>

        {/* Planning Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-500 uppercase">目标版本</span>
            </div>
            <p className="text-sm text-zinc-900">{formState.targetVersion || "-"}</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-500 uppercase">预估工作量</span>
            </div>
            <p className="text-sm text-zinc-900">{formState.estimatedEffort || "-"}</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-500 uppercase">负责人</span>
            </div>
            <p className="text-sm text-zinc-900">
              {formState.ownerId ? (users.find(u => u.id === formState.ownerId)?.name || formState.ownerId) : "-"}
            </p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-500 uppercase">评审人</span>
            </div>
            <p className="text-sm text-zinc-900">
              {formState.reviewerId ? (users.find(u => u.id === formState.reviewerId)?.name || formState.reviewerId) : "-"}
            </p>
          </div>
        </div>

        {/* Test Coverage Stats */}
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-zinc-500" />
            <label className="text-xs font-bold text-zinc-500 uppercase">测试覆盖情况</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">执行进度</span>
                <span className="text-sm font-bold text-zinc-900">
                  {testStats.executed}/{testStats.total}
                </span>
              </div>
              <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${testStats.executionProgress}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-zinc-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">通过率</span>
                <span className="text-sm font-bold text-zinc-900">
                  {testStats.passed}/{testStats.passed + testStats.failed}
                </span>
              </div>
              <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    testStats.passRate >= 80
                      ? "bg-green-500"
                      : testStats.passRate >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${testStats.passRate}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> 通过: {testStats.passed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> 失败: {testStats.failed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> 阻塞: {testStats.blocked}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-300" /> 未执行:{" "}
              {testStats.total - testStats.executed}
            </span>
          </div>
        </div>

        {/* Related Requirements */}
        {formState.relatedRequirements.length > 0 && (
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-zinc-500" />
              <label className="text-xs font-bold text-zinc-500 uppercase">关联需求</label>
            </div>
            <div className="space-y-2">
              {formState.relatedRequirements.map((rel) => {
                const relReq = otherRequirements.find((r) => r.id === rel.id);
                return (
                  <div
                    key={rel.id}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-200"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        rel.type === "depends_on"
                          ? "bg-blue-100 text-blue-700"
                          : rel.type === "blocks"
                          ? "bg-red-100 text-red-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {RELATION_TYPE_OPTIONS.find((o) => o.value === rel.type)?.label}
                    </span>
                    <span className="text-sm text-zinc-900">{relReq?.title || rel.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Discussion Section */}
        <CommentsTab
          requirementId={requirement.id}
          currentUser={currentUser}
          topic="BASIC_INFO"
          compact
        />
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-5">
      {/* Title - Required */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
          需求标题 <RequiredIndicator />
        </label>
        <input
          className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none transition-colors ${
            !formState.title.trim() ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-zinc-200"
          }`}
          value={formState.title}
          onChange={(e) => formActions.setTitle(e.target.value)}
          placeholder="输入需求标题..."
        />
        <FieldError message={!formState.title.trim() ? "标题为必填项" : undefined} />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-zinc-500 uppercase">需求描述</label>
          <AIButton
            fieldType="refineDescription"
            label="AI 优化"
            generating={aiGenerating}
            onGenerate={onAIGenerate}
          />
        </div>
        <MentionInput
          value={formState.description}
          onChange={formActions.setDescription}
          placeholder="详细描述需求背景..."
          rows={4}
        />
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">状态</label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
            value={formState.status}
            onChange={(e) => formActions.setStatus(e.target.value as RequirementStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
            优先级 <RequiredIndicator />
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
            value={formState.priority}
            onChange={(e) => formActions.setPriority(e.target.value)}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Version & Effort & Owner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">目标版本</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none"
            value={formState.targetVersion}
            onChange={(e) => formActions.setTargetVersion(e.target.value)}
            placeholder="如: v1.0.0, Sprint 23"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">预估工作量</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none"
            value={formState.estimatedEffort}
            onChange={(e) => formActions.setEstimatedEffort(e.target.value)}
            placeholder="如: 3d, 5 story points"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 flex items-center">
            <UserIcon className="w-3.5 h-3.5 mr-1.5" /> 负责人
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
            value={formState.ownerId}
            onChange={(e) => formActions.setOwnerId(e.target.value)}
          >
            <option value="">未分配</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name || user.email}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">标签</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formState.tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-sm"
            >
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <XIcon className="w-3 h-3 text-zinc-400 hover:text-red-500" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            placeholder="输入标签后回车添加"
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium"
          >
            添加
          </button>
        </div>
      </div>

      {/* Related Requirements */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">关联需求</label>
        <div className="space-y-2 mb-2">
          {formState.relatedRequirements.map((rel) => {
            const relReq = otherRequirements.find((r) => r.id === rel.id);
            return (
              <div
                key={rel.id}
                className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      rel.type === "depends_on"
                        ? "bg-blue-100 text-blue-700"
                        : rel.type === "blocks"
                        ? "bg-red-100 text-red-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {RELATION_TYPE_OPTIONS.find((o) => o.value === rel.type)?.label}
                  </span>
                  <span className="text-sm text-zinc-900">{relReq?.title || rel.id}</span>
                </div>
                <button
                  onClick={() => handleRemoveRelatedRequirement(rel.id)}
                  className="p-1 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        {otherRequirements.length > 0 && (
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs text-zinc-500 mb-2">选择要关联的需求：</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {otherRequirements
                .filter((r) => !formState.relatedRequirements.some((rel) => rel.id === r.id))
                .map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-2 hover:bg-zinc-100 rounded"
                  >
                    <span className="text-sm text-zinc-700">{req.title}</span>
                    <div className="flex gap-1">
                      {RELATION_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() =>
                            handleAddRelatedRequirement(req.id, opt.value as RelatedRequirement["type"])
                          }
                          className="px-2 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

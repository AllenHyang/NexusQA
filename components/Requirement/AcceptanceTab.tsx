"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle as XIcon,
  AlertCircle,
} from "lucide-react";
import { InternalRequirement } from "@/types";
import { TestStats } from "./types";
import { MentionInput } from "@/components/MentionInput";

interface AcceptanceTabProps {
  requirement: InternalRequirement;
  testStats: TestStats;
  acceptanceNotes: string;
  onAcceptanceNotesChange: (notes: string) => void;
  onAccept: () => void;
  onReject: () => void;
}

export function AcceptanceTab({
  requirement,
  testStats,
  acceptanceNotes,
  onAcceptanceNotesChange,
  onAccept,
  onReject,
}: AcceptanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div className="text-sm text-zinc-500 mb-1">执行进度</div>
          <div className="text-2xl font-bold text-zinc-900">
            {testStats.executed}/{testStats.total}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {Math.round(testStats.executionProgress)}% 已执行
          </div>
        </div>
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div className="text-sm text-zinc-500 mb-1">通过率</div>
          <div className={`text-2xl font-bold ${
            testStats.passRate >= 80 ? "text-green-600" :
            testStats.passRate >= 50 ? "text-yellow-600" : "text-red-600"
          }`}>
            {Math.round(testStats.passRate)}%
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {testStats.passed}/{testStats.passed + testStats.failed} 通过
          </div>
        </div>
      </div>

      {/* Warnings */}
      {testStats.failed > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              存在 {testStats.failed} 个失败的测试用例
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              建议修复后再进行验收，或在验收意见中说明原因
            </p>
          </div>
        </div>
      )}

      {testStats.total > 0 && testStats.executed < testStats.total && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              尚有 {testStats.total - testStats.executed} 个用例未执行
            </p>
            <p className="text-xs text-blue-600 mt-1">
              确定要在测试未完成的情况下验收吗？
            </p>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div className="text-sm text-zinc-500 mb-2">当前验收状态</div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          requirement.acceptanceStatus === "ACCEPTED" ? "bg-green-100 text-green-700" :
          requirement.acceptanceStatus === "REJECTED" ? "bg-red-100 text-red-700" :
          "bg-zinc-100 text-zinc-600"
        }`}>
          {requirement.acceptanceStatus === "ACCEPTED" && <CheckCircle2 className="w-4 h-4" />}
          {requirement.acceptanceStatus === "REJECTED" && <XIcon className="w-4 h-4" />}
          {requirement.acceptanceStatus === "PENDING" && <AlertCircle className="w-4 h-4" />}
          {requirement.acceptanceStatus === "ACCEPTED" ? "已通过" :
           requirement.acceptanceStatus === "REJECTED" ? "已拒绝" : "待验收"}
        </div>
        {requirement.acceptedAt && (
          <div className="text-xs text-zinc-400 mt-2">
            验收时间: {new Date(requirement.acceptedAt).toLocaleString()}
          </div>
        )}
        {requirement.acceptanceNotes && (
          <div className="mt-2 p-3 bg-white rounded-lg border border-zinc-200 text-sm text-zinc-600">
            {requirement.acceptanceNotes}
          </div>
        )}
      </div>

      {/* Acceptance Form */}
      {requirement.acceptanceStatus === "PENDING" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
              验收意见
            </label>
            <MentionInput
              value={acceptanceNotes}
              onChange={onAcceptanceNotesChange}
              placeholder="填写验收意见（拒绝时必填）..."
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium"
            >
              <XIcon className="w-4 h-4" />
              验收不通过
            </button>
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              验收通过
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

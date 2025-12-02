"use client";

import React from "react";
import {
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Play,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  AlertCircle,
  Activity,
  Send,
  RotateCcw,
  History,
  User as UserIcon,
} from "lucide-react";
import { InternalRequirement, RequirementStatus, RequirementReview, User } from "@/types";
import { STATUS_OPTIONS, getReviewActionColor, getReviewActionLabel } from "./constants";
import { MentionInput } from "@/components/MentionInput";

interface ReviewTabProps {
  requirement: InternalRequirement;
  status: RequirementStatus;
  currentUser: User;
  isAuthor: boolean;
  canReview: boolean;
  reviewHistory: RequirementReview[];
  reviewComment: string;
  reviewLoading: boolean;
  reviewError: string | null;
  reviewerId: string;
  onReviewerIdChange: (reviewerId: string) => void;
  users?: User[];
  onReviewCommentChange: (comment: string) => void;
  onSubmitForReview: () => void;
  onApproveReview: () => void;
  onRejectReview: () => void;
  onRequestChanges: () => void;
  onStartImplementation: () => void;
  onCompleteImplementation: () => void;
  onReopen: () => void;
}

export function ReviewTab({
  requirement,
  status,
  isAuthor,
  canReview,
  reviewHistory,
  reviewComment,
  reviewLoading,
  reviewError,
  reviewerId,
  onReviewerIdChange,
  users = [],
  onReviewCommentChange,
  onSubmitForReview,
  onApproveReview,
  onRejectReview,
  onRequestChanges,
  onStartImplementation,
  onCompleteImplementation,
  onReopen,
}: ReviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500 mb-1">当前状态</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
              status === "DRAFT" ? "bg-zinc-100 text-zinc-600" :
              status === "PENDING_REVIEW" ? "bg-yellow-100 text-yellow-700" :
              status === "APPROVED" ? "bg-blue-100 text-blue-700" :
              status === "IN_PROGRESS" ? "bg-purple-100 text-purple-700" :
              "bg-green-100 text-green-700"
            }`}>
              {status === "DRAFT" && <FileText className="w-4 h-4" />}
              {status === "PENDING_REVIEW" && <Clock className="w-4 h-4" />}
              {status === "APPROVED" && <ThumbsUp className="w-4 h-4" />}
              {status === "IN_PROGRESS" && <Play className="w-4 h-4" />}
              {status === "COMPLETED" && <CheckCircle2 className="w-4 h-4" />}
              {STATUS_OPTIONS.find(s => s.value === status)?.label}
            </div>
          </div>
          {requirement.reviewedAt && (
            <div className="text-right">
              <div className="text-xs text-zinc-400">最后评审时间</div>
              <div className="text-sm text-zinc-600">{new Date(requirement.reviewedAt).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Status Flow Diagram */}
      <div className="p-4 bg-white border border-zinc-200 rounded-xl">
        <div className="text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4" /> 评审流程
        </div>
        <div className="flex items-center justify-between px-4">
          <StatusNode status="DRAFT" currentStatus={status} label="草稿" icon={FileText} />
          <ArrowRight className="w-5 h-5 text-zinc-300" />
          <StatusNode status="PENDING_REVIEW" currentStatus={status} label="待评审" icon={Clock} activeColor="bg-yellow-500" />
          <ArrowRight className="w-5 h-5 text-zinc-300" />
          <StatusNode status="APPROVED" currentStatus={status} label="已批准" icon={ThumbsUp} activeColor="bg-blue-500" />
          <ArrowRight className="w-5 h-5 text-zinc-300" />
          <StatusNode status="IN_PROGRESS" currentStatus={status} label="进行中" icon={Play} activeColor="bg-purple-500" />
          <ArrowRight className="w-5 h-5 text-zinc-300" />
          <StatusNode status="COMPLETED" currentStatus={status} label="已完成" icon={CheckCircle2} activeColor="bg-green-500" />
        </div>
      </div>

      {/* Error Message */}
      {reviewError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {reviewError}
        </div>
      )}

      {/* Actions based on status */}
      <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4">
        <div className="text-sm font-bold text-zinc-700 flex items-center gap-2">
          <Activity className="w-4 h-4" /> 可用操作
        </div>

        {/* DRAFT state */}
        {status === "DRAFT" && isAuthor && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">需求编写完成后，可以提交给评审人进行评审。</p>
            {/* Reviewer Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 flex items-center">
                <UserIcon className="w-3.5 h-3.5 mr-1.5" /> 指定评审人
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
                value={reviewerId}
                onChange={(e) => onReviewerIdChange(e.target.value)}
              >
                <option value="">未指定（由系统分配）</option>
                {users
                  .filter(u => u.role === 'QA_LEAD' || u.role === 'ADMIN' || u.role === 'PM' || u.role === 'PRODUCT_MANAGER')
                  .map(user => (
                    <option key={user.id} value={user.id}>{user.name || user.email}</option>
                  ))
                }
              </select>
              <p className="text-xs text-zinc-400 mt-1">可选择管理员、QA负责人、项目经理或产品经理作为评审人</p>
            </div>
            <button
              onClick={onSubmitForReview}
              disabled={reviewLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-medium"
            >
              <Send className="w-4 h-4" />
              {reviewLoading ? "提交中..." : "提交评审"}
            </button>
          </div>
        )}

        {status === "DRAFT" && !isAuthor && (
          <p className="text-sm text-zinc-500">等待作者提交评审。只有作者可以提交评审。</p>
        )}

        {/* PENDING_REVIEW state */}
        {status === "PENDING_REVIEW" && (
          <div className="space-y-4">
            {canReview ? (
              <>
                <p className="text-sm text-zinc-500">请审阅需求内容，并选择批准或打回修改。</p>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
                    评审意见
                  </label>
                  <MentionInput
                    value={reviewComment}
                    onChange={onReviewCommentChange}
                    placeholder="填写评审意见（拒绝或要求修改时必填）..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={onRejectReview}
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    拒绝
                  </button>
                  <button
                    onClick={onRequestChanges}
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl font-medium disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    要求修改
                  </button>
                  <button
                    onClick={onApproveReview}
                    disabled={reviewLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    批准
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500">等待评审人审批。只有管理员、产品经理或测试负责人可以评审。</p>
            )}
          </div>
        )}

        {/* APPROVED state */}
        {status === "APPROVED" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">需求已批准，可以开始实现。</p>
            <div className="flex gap-3">
              <button
                onClick={onStartImplementation}
                disabled={reviewLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                开始实现
              </button>
              {canReview && (
                <button
                  onClick={onReopen}
                  disabled={reviewLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-xl font-medium disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新打开
                </button>
              )}
            </div>
          </div>
        )}

        {/* IN_PROGRESS state */}
        {status === "IN_PROGRESS" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">需求正在实现中，完成后可标记为已完成。</p>
            <div className="flex gap-3">
              <button
                onClick={onCompleteImplementation}
                disabled={reviewLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                标记完成
              </button>
              {canReview && (
                <button
                  onClick={onReopen}
                  disabled={reviewLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-xl font-medium disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新打开
                </button>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED state */}
        {status === "COMPLETED" && (
          <div className="space-y-3">
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              需求已完成实现
            </p>
            {canReview && (
              <button
                onClick={onReopen}
                disabled={reviewLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-xl font-medium disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                重新打开
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review History */}
      <div className="p-4 bg-white border border-zinc-200 rounded-xl">
        <div className="text-sm font-bold text-zinc-700 mb-4 flex items-center gap-2">
          <History className="w-4 h-4" /> 评审历史
        </div>
        {reviewHistory.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">暂无评审记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewHistory.map((review) => (
              <div key={review.id} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getReviewActionColor(review.action)}`}>
                  {review.action === "SUBMIT" && <Send className="w-4 h-4" />}
                  {review.action === "APPROVE" && <ThumbsUp className="w-4 h-4" />}
                  {review.action === "REJECT" && <ThumbsDown className="w-4 h-4" />}
                  {review.action === "REQUEST_CHANGES" && <RotateCcw className="w-4 h-4" />}
                  {review.action === "START" && <Play className="w-4 h-4" />}
                  {review.action === "COMPLETE" && <CheckCircle2 className="w-4 h-4" />}
                  {review.action === "REOPEN" && <RotateCcw className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-900 text-sm">{review.reviewer?.name || "Unknown"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getReviewActionColor(review.action)}`}>
                      {getReviewActionLabel(review.action)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-zinc-600 mt-1">{review.comment}</p>
                  )}
                  {review.fromStatus && review.toStatus && (
                    <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                      <span>{STATUS_OPTIONS.find(s => s.value === review.fromStatus)?.label || review.fromStatus}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{STATUS_OPTIONS.find(s => s.value === review.toStatus)?.label || review.toStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for status flow nodes
function StatusNode({
  status,
  currentStatus,
  label,
  icon: Icon,
  activeColor = "bg-zinc-900"
}: {
  status: RequirementStatus;
  currentStatus: RequirementStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor?: string;
}) {
  const isActive = status === currentStatus;
  return (
    <div className={`flex flex-col items-center ${isActive ? "opacity-100" : "opacity-40"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? `${activeColor} text-white` : "bg-zinc-200 text-zinc-500"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </div>
  );
}

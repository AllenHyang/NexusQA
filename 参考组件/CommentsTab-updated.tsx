"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Send,
  Trash2,
  Edit2,
  X,
  Check,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { User } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { MentionInput, renderWithMentions } from "@/components/MentionInput";

interface RequirementComment {
  id: string;
  content: string;
  requirementId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type CommentTopic = "BASIC_INFO" | "USER_STORY" | "ACCEPTANCE_CRITERIA";

interface CommentsTabProps {
  requirementId: string;
  currentUser: User;
  topic?: CommentTopic;
  compact?: boolean;
}

export function CommentsTab({ requirementId, currentUser, topic, compact = false }: CommentsTabProps) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<RequirementComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!requirementId) return;
    setLoading(true);
    setError(null);
    try {
      const url = topic
        ? `/api/requirements/${requirementId}/comments?topic=${topic}`
        : `/api/requirements/${requirementId}/comments`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError(t("comments.error_load"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [requirementId, topic, t]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/requirements/${requirementId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          userId: currentUser.id,
          topic: topic || "BASIC_INFO",
        }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      setError(t("comments.error_add"));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/requirements/${requirementId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: editContent.trim(),
            userId: currentUser.id,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update comment");
      }
      const updated = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      );
      setEditingId(null);
      setEditContent("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("comments.error_update");
      setError(message);
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t("comments.delete_confirm"))) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/requirements/${requirementId}/comments/${commentId}?userId=${currentUser.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete comment");
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("comments.error_delete");
      setError(message);
      console.error(err);
    }
  };

  const startEdit = (comment: RequirementComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "";
    const roleKey = `role.${role}` as const;
    return t(roleKey as "role.ADMIN" | "role.QA_LEAD" | "role.TESTER" | "role.PM" | "role.DEVELOPER") || role;
  };

  const getTopicLabel = () => {
    if (topic === "USER_STORY") return t("comments.user_story_discussion");
    if (topic === "ACCEPTANCE_CRITERIA") return t("comments.acceptance_criteria_discussion");
    return t("comments.requirement_discussion");
  };

  return (
    <div className={compact ? "space-y-3 mt-4 pt-4 border-t border-zinc-200" : "space-y-4"}>
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-700">
        <MessageCircle className="w-4 h-4" />
        {compact ? getTopicLabel() : t("comments.discussion")} ({comments.length})
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`space-y-3 overflow-y-auto ${compact ? "max-h-[200px]" : "max-h-[400px]"}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t("comments.loading")}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t("comments.no_comments")}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 text-sm">{comment.user.name}</span>
                      {comment.user.role && (
                        <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-600 rounded text-xs">
                          {getRoleLabel(comment.user.role)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">
                      {formatDate(comment.createdAt)}
                      {comment.updatedAt !== comment.createdAt && ` ${t("comments.edited")}`}
                    </span>
                  </div>
                </div>

                {comment.userId === currentUser.id && editingId !== comment.id && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(comment)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)} className="p-1 text-zinc-400 hover:text-red-500 rounded" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <MentionInput value={editContent} onChange={setEditContent} rows={3} className="bg-white" />
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700">
                      {t("comments.cancel")}
                    </button>
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      disabled={!editContent.trim()}
                      className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t("comments.save")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{renderWithMentions(comment.content)}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-zinc-100">
        <div className="flex gap-2">
          <div className="flex-1">
            <MentionInput
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleAddComment}
              placeholder={t("comments.add_placeholder")}
              rows={2}
              disabled={submitting}
            />
            <div className="mt-1 text-xs text-zinc-400">
              {t("comments.send_hint")} | 输入 @ 可提及用户
            </div>
          </div>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            className="self-start px-4 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

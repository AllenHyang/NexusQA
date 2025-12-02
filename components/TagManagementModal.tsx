"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Tag,
  Search,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Hash,
  Settings,
} from "lucide-react";
import { InternalRequirement } from "@/types";

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: InternalRequirement[];
  onRenameTag: (oldTag: string, newTag: string) => Promise<void>;
  onDeleteTag: (tag: string) => Promise<void>;
}

interface TagInfo {
  name: string;
  count: number;
}

export function TagManagementModal({
  isOpen,
  onClose,
  requirements,
  onRenameTag,
  onDeleteTag,
}: TagManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse tags from requirement
  const parseTags = (tags: string | string[] | null | undefined): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Collect all tags with usage count
  const tagInfoList = useMemo<TagInfo[]>(() => {
    const tagCountMap = new Map<string, number>();
    requirements.forEach((req) => {
      const tags = parseTags(req.tags);
      tags.forEach((tag) => {
        tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [requirements]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tagInfoList;
    const query = searchQuery.toLowerCase();
    return tagInfoList.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tagInfoList, searchQuery]);

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue("");
    setError(null);
  };

  const handleConfirmRename = async () => {
    if (!editingTag || !editValue.trim()) return;
    const newTag = editValue.trim();

    if (newTag === editingTag) {
      handleCancelEdit();
      return;
    }

    // Check if new tag already exists
    if (tagInfoList.some((t) => t.name === newTag)) {
      setError(`标签 "${newTag}" 已存在`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRenameTag(editingTag, newTag);
      handleCancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "重命名失败");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelete = (tag: string) => {
    setDeletingTag(tag);
    setError(null);
  };

  const handleCancelDelete = () => {
    setDeletingTag(null);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTag) return;

    setLoading(true);
    setError(null);
    try {
      await onDeleteTag(deletingTag);
      handleCancelDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">标签管理</h2>
              <p className="text-xs text-zinc-500">
                共 {tagInfoList.length} 个标签
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标签..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tag List */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          {filteredTags.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="w-12 h-12 mx-auto mb-3 text-zinc-200" />
              <p className="text-zinc-400 text-sm">
                {searchQuery ? "未找到匹配的标签" : "暂无标签"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTags.map((tag) => (
                <div
                  key={tag.name}
                  className={`group p-3 rounded-xl border transition-all ${
                    editingTag === tag.name
                      ? "border-blue-300 bg-blue-50"
                      : deletingTag === tag.name
                      ? "border-red-300 bg-red-50"
                      : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {editingTag === tag.name ? (
                    // Editing State
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmRename();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        disabled={loading}
                      />
                      <button
                        onClick={handleConfirmRename}
                        disabled={loading || !editValue.trim()}
                        className="p-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : deletingTag === tag.name ? (
                    // Deleting Confirmation State
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">
                          确定删除标签 &ldquo;{tag.name}&rdquo;？
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleConfirmDelete}
                          disabled={loading}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {loading ? "删除中..." : "确认删除"}
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          disabled={loading}
                          className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 text-xs font-medium rounded-lg transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal State
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-zinc-900">
                            {tag.name}
                          </span>
                          <span className="ml-2 text-xs text-zinc-400">
                            {tag.count} 个需求
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(tag.name)}
                          className="p-2 hover:bg-blue-100 text-zinc-400 hover:text-blue-600 rounded-lg transition-colors"
                          title="重命名"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartDelete(tag.name)}
                          className="p-2 hover:bg-red-100 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50">
          <p className="text-xs text-zinc-400 text-center">
            重命名或删除标签将影响所有使用该标签的需求
          </p>
        </div>
      </div>
    </div>
  );
}

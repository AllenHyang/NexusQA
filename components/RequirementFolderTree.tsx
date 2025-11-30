"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { RequirementFolder, FolderType } from "@/types";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Layers,
  Box,
  FileText,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  GripVertical,
  FolderX,
} from "lucide-react";

// Special ID for uncategorized filter
export const UNCATEGORIZED_FOLDER_ID = "__UNCATEGORIZED__";

interface RequirementFolderTreeProps {
  projectId: string;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder?: (parentId: string | null) => void;
  onDropRequirement?: (requirementIds: string[], folderId: string | null) => void;
}

interface FolderItemProps {
  folder: RequirementFolder & { children?: RequirementFolder[]; _count?: { requirements: number; children: number } };
  level: number;
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  onCreateSubFolder?: (parentId: string) => void;
  onRename?: (folderId: string, newName: string) => void;
  onDelete?: (folderId: string) => void;
  onDropRequirement?: (requirementIds: string[], folderId: string) => void;
  onMoveFolder?: (folderId: string, targetParentId: string | null) => void;
  dragOverFolderId: string | null;
  setDragOverFolderId: (id: string | null) => void;
  draggingFolderId: string | null;
  setDraggingFolderId: (id: string | null) => void;
}

const FOLDER_TYPE_CONFIG: Record<FolderType, { icon: React.ElementType; color: string; bgColor: string }> = {
  EPIC: { icon: Layers, color: "text-purple-600", bgColor: "bg-purple-100" },
  FEATURE: { icon: Box, color: "text-blue-600", bgColor: "bg-blue-100" },
  FOLDER: { icon: Folder, color: "text-zinc-600", bgColor: "bg-zinc-100" },
};

function FolderItem({
  folder,
  level,
  selectedFolderId,
  onSelect,
  onCreateSubFolder,
  onRename,
  onDelete,
  onDropRequirement,
  onMoveFolder,
  dragOverFolderId,
  setDragOverFolderId,
  draggingFolderId,
  setDraggingFolderId,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;
  const isDragOver = dragOverFolderId === folder.id;
  const isDragging = draggingFolderId === folder.id;
  const config = FOLDER_TYPE_CONFIG[folder.type as FolderType] || FOLDER_TYPE_CONFIG.FOLDER;
  const IconComponent = config.icon;
  const FolderIcon = isExpanded ? FolderOpen : Folder;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onSelect(folder.id);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== folder.name && onRename) {
      onRename(folder.id, editName.trim());
    }
    setIsEditing(false);
  };

  // Folder drag handlers
  const handleFolderDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggingFolderId(folder.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ folderId: folder.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderDragEnd = () => {
    setDraggingFolderId(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't allow dropping on self or children
    if (draggingFolderId && (draggingFolderId === folder.id)) {
      return;
    }
    setDragOverFolderId(folder.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const data = e.dataTransfer.getData("application/json");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Handle folder move
        if (parsed.folderId) {
          // Don't drop folder on itself
          if (parsed.folderId !== folder.id) {
            onMoveFolder?.(parsed.folderId, folder.id);
          }
        }
        // Handle requirement drop
        else if (parsed.requirementIds && parsed.requirementIds.length > 0) {
          onDropRequirement?.(parsed.requirementIds, folder.id);
        }
      } catch (err) {
        console.error("Failed to parse drag data", err);
      }
    }
  };

  return (
    <div>
      <div
        draggable
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
          isDragging
            ? "opacity-50"
            : isDragOver
            ? "bg-blue-100 ring-2 ring-blue-400 ring-inset"
            : isSelected
            ? "bg-zinc-900 text-white"
            : "hover:bg-zinc-100 text-zinc-700"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
        onDragStart={handleFolderDragStart}
        onDragEnd={handleFolderDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse Toggle */}
        <button
          onClick={handleToggle}
          className={`p-0.5 rounded transition-colors ${
            hasChildren
              ? isSelected
                ? "hover:bg-white/20"
                : "hover:bg-zinc-200"
              : "opacity-0"
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Icon */}
        <div
          className={`p-1 rounded ${
            isDragOver ? "bg-blue-200" : isSelected ? "bg-white/20" : config.bgColor
          }`}
        >
          {folder.type === "FOLDER" ? (
            <FolderIcon
              className={`w-3.5 h-3.5 ${isDragOver ? "text-blue-600" : isSelected ? "text-white" : config.color}`}
            />
          ) : (
            <IconComponent
              className={`w-3.5 h-3.5 ${isDragOver ? "text-blue-600" : isSelected ? "text-white" : config.color}`}
            />
          )}
        </div>

        {/* Name */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setEditName(folder.name);
                setIsEditing(false);
              }
            }}
            className="flex-1 min-w-0 px-1 py-0.5 text-sm bg-white text-zinc-900 rounded border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 min-w-0 text-sm font-medium truncate ${isDragOver ? "text-blue-700" : ""}`}>
            {folder.name}
          </span>
        )}

        {/* Count Badge */}
        {folder._count && folder._count.requirements > 0 && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isDragOver
                ? "bg-blue-200 text-blue-700"
                : isSelected
                ? "bg-white/20 text-white"
                : "bg-zinc-200 text-zinc-600"
            }`}
          >
            {folder._count.requirements}
          </span>
        )}

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isSelected ? "hover:bg-white/20" : "hover:bg-zinc-200"
            }`}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 py-1">
                {folder.type !== "FOLDER" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateSubFolder?.(folder.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-50 flex items-center gap-2 text-zinc-700"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> 新建子文件夹
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-50 flex items-center gap-2 text-zinc-700"
                >
                  <Pencil className="w-3.5 h-3.5" /> 重命名
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除文件夹「${folder.name}」吗？`)) {
                      onDelete?.(folder.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child as RequirementFolder & { children?: RequirementFolder[]; _count?: { requirements: number; children: number } }}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onCreateSubFolder={onCreateSubFolder}
              onRename={onRename}
              onDelete={onDelete}
              onDropRequirement={onDropRequirement}
              onMoveFolder={onMoveFolder}
              dragOverFolderId={dragOverFolderId}
              setDragOverFolderId={setDragOverFolderId}
              draggingFolderId={draggingFolderId}
              setDraggingFolderId={setDraggingFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RequirementFolderTree({
  projectId,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDropRequirement,
}: RequirementFolderTreeProps) {
  const {
    folders,
    foldersLoading,
    rootRequirementsCount,
    uncategorizedCount,
    loadFolders,
    updateFolder,
    deleteFolder,
    moveFolder,
  } = useAppStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderType, setNewFolderType] = useState<FolderType>("EPIC");
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);

  useEffect(() => {
    loadFolders(projectId);
  }, [projectId, loadFolders]);

  const handleRename = async (folderId: string, newName: string) => {
    await updateFolder(folderId, { name: newName });
    loadFolders(projectId);
  };

  const handleDelete = async (folderId: string) => {
    await deleteFolder(folderId);
    if (selectedFolderId === folderId) {
      onSelectFolder(null);
    }
    loadFolders(projectId);
  };

  const handleCreateSubFolder = (parentId: string) => {
    onCreateFolder?.(parentId);
  };

  const handleMoveFolder = async (folderId: string, targetParentId: string | null) => {
    const success = await moveFolder(folderId, targetParentId);
    if (success) {
      loadFolders(projectId);
    }
  };

  // Root drop handlers
  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRoot(true);
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRoot(false);
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverRoot(false);

    const data = e.dataTransfer.getData("application/json");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Handle folder move to root
        if (parsed.folderId) {
          handleMoveFolder(parsed.folderId, null);
        }
        // Handle requirement drop
        else if (parsed.requirementIds && parsed.requirementIds.length > 0) {
          onDropRequirement?.(parsed.requirementIds, null);
        }
      } catch (err) {
        console.error("Failed to parse drag data", err);
      }
    }
  };

  if (foldersLoading && folders.length === 0) {
    return (
      <div className="p-4 text-center text-zinc-400 text-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-400 mx-auto mb-2" />
        加载中...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          需求层级
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-700 transition-colors"
          title="新建 Epic"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New Folder Form */}
      {isCreating && (
        <div className="p-3 border-b border-zinc-100 bg-zinc-50 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <select
              value={newFolderType}
              onChange={(e) => setNewFolderType(e.target.value as FolderType)}
              className="text-xs px-2 py-1 border border-zinc-200 rounded-lg bg-white"
            >
              <option value="EPIC">Epic</option>
              <option value="FEATURE">Feature</option>
              <option value="FOLDER">文件夹</option>
            </select>
          </div>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="输入名称..."
            className="w-full px-2 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && newFolderName.trim()) {
                onCreateFolder?.(null);
                setNewFolderName("");
                setIsCreating(false);
              }
              if (e.key === "Escape") {
                setNewFolderName("");
                setIsCreating(false);
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setNewFolderName("");
                setIsCreating(false);
              }}
              className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (newFolderName.trim()) {
                  onCreateFolder?.(null);
                  setNewFolderName("");
                  setIsCreating(false);
                }
              }}
              disabled={!newFolderName.trim()}
              className="px-2 py-1 text-xs bg-zinc-900 text-white rounded-lg disabled:opacity-50"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {/* Drag hint */}
      <div className="px-3 py-2 text-[10px] text-zinc-400 border-b border-zinc-100 flex items-center gap-1 flex-shrink-0">
        <GripVertical className="w-3 h-3" />
        拖拽文件夹或需求进行移动
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* All Requirements (Root) */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
            dragOverRoot
              ? "bg-blue-100 ring-2 ring-blue-400 ring-inset"
              : selectedFolderId === null
              ? "bg-zinc-900 text-white"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
          onClick={() => onSelectFolder(null)}
          onDragOver={handleRootDragOver}
          onDragLeave={handleRootDragLeave}
          onDrop={handleRootDrop}
        >
          <div
            className={`p-1 rounded ${
              dragOverRoot ? "bg-blue-200" : selectedFolderId === null ? "bg-white/20" : "bg-zinc-100"
            }`}
          >
            <FileText
              className={`w-3.5 h-3.5 ${
                dragOverRoot ? "text-blue-600" : selectedFolderId === null ? "text-white" : "text-zinc-500"
              }`}
            />
          </div>
          <span className={`flex-1 text-sm font-medium ${dragOverRoot ? "text-blue-700" : ""}`}>
            全部需求
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              dragOverRoot
                ? "bg-blue-200 text-blue-700"
                : selectedFolderId === null
                ? "bg-white/20 text-white"
                : "bg-zinc-200 text-zinc-600"
            }`}
          >
            {rootRequirementsCount}
          </span>
        </div>

        {/* Uncategorized Requirements */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all mt-1 ${
            selectedFolderId === UNCATEGORIZED_FOLDER_ID
              ? "bg-zinc-900 text-white"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
          onClick={() => onSelectFolder(UNCATEGORIZED_FOLDER_ID)}
        >
          <div
            className={`p-1 rounded ${
              selectedFolderId === UNCATEGORIZED_FOLDER_ID ? "bg-white/20" : "bg-amber-100"
            }`}
          >
            <FolderX
              className={`w-3.5 h-3.5 ${
                selectedFolderId === UNCATEGORIZED_FOLDER_ID ? "text-white" : "text-amber-600"
              }`}
            />
          </div>
          <span className="flex-1 text-sm font-medium">
            未分类需求
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              selectedFolderId === UNCATEGORIZED_FOLDER_ID
                ? "bg-white/20 text-white"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {uncategorizedCount}
          </span>
        </div>

        {/* Folder Tree */}
        {folders && folders.length > 0 ? (
          <div className="mt-2">
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder as RequirementFolder & { children?: RequirementFolder[]; _count?: { requirements: number; children: number } }}
                level={0}
                selectedFolderId={selectedFolderId}
                onSelect={onSelectFolder}
                onCreateSubFolder={handleCreateSubFolder}
                onRename={handleRename}
                onDelete={handleDelete}
                onDropRequirement={onDropRequirement}
                onMoveFolder={handleMoveFolder}
                dragOverFolderId={dragOverFolderId}
                setDragOverFolderId={setDragOverFolderId}
                draggingFolderId={draggingFolderId}
                setDraggingFolderId={setDraggingFolderId}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 p-4 text-center text-zinc-400 text-xs">
            <Folder className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>暂无文件夹</p>
            <p className="mt-1">点击上方 + 创建 Epic</p>
          </div>
        )}
      </div>
    </div>
  );
}

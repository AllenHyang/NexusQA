import React, { useMemo, useState, useCallback } from "react";
import {
  Link2,
  User as UserIcon,
  Layers,
  Users,
  Flag,
  Calendar,
} from "lucide-react";
import { InternalRequirement, RequirementStatus, User } from "@/types";

// Kanban group modes
export type KanbanGroupMode = "status" | "owner" | "priority" | "acceptanceStatus";

interface KanbanViewProps {
  requirements: InternalRequirement[];
  users: User[];
  onCardClick: (requirement: InternalRequirement) => void;
  onStatusChange: (requirementId: string, newStatus: RequirementStatus) => Promise<void>;
  onOwnerChange: (requirementId: string, newOwnerId: string | null) => Promise<void>;
  parseTags: (tagsStr: string) => string[];
}

// Status configuration
const STATUS_CONFIG: Record<RequirementStatus, { label: string; labelZh: string; color: string; bgColor: string; borderColor: string }> = {
  DRAFT: { label: "Draft", labelZh: "草稿", color: "text-zinc-600", bgColor: "bg-zinc-50", borderColor: "border-zinc-200" },
  PENDING_REVIEW: { label: "Pending Review", labelZh: "待评审", color: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  APPROVED: { label: "Approved", labelZh: "已批准", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  IN_PROGRESS: { label: "In Progress", labelZh: "进行中", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  COMPLETED: { label: "Completed", labelZh: "已完成", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  P0: { label: "P0 - 紧急", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  P1: { label: "P1 - 高", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  P2: { label: "P2 - 中", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  P3: { label: "P3 - 低", color: "text-zinc-600", bgColor: "bg-zinc-50", borderColor: "border-zinc-200" },
};

const ACCEPTANCE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  PENDING: { label: "待验收", color: "text-zinc-600", bgColor: "bg-zinc-50", borderColor: "border-zinc-200" },
  ACCEPTED: { label: "已通过", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  REJECTED: { label: "已拒绝", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
};

// Status order for kanban columns
const STATUS_ORDER: RequirementStatus[] = ["DRAFT", "PENDING_REVIEW", "APPROVED", "IN_PROGRESS", "COMPLETED"];
const PRIORITY_ORDER = ["P0", "P1", "P2", "P3"];
const ACCEPTANCE_ORDER = ["PENDING", "ACCEPTED", "REJECTED"];

export function KanbanView({
  requirements,
  users,
  onCardClick,
  onStatusChange,
  onOwnerChange,
  parseTags,
}: KanbanViewProps) {
  const [groupMode, setGroupMode] = useState<KanbanGroupMode>("status");
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Group requirements based on mode
  const groupedRequirements = useMemo(() => {
    const groups: Record<string, InternalRequirement[]> = {};

    if (groupMode === "status") {
      STATUS_ORDER.forEach(status => {
        groups[status] = [];
      });
      requirements.forEach(req => {
        if (groups[req.status]) {
          groups[req.status].push(req);
        }
      });
    } else if (groupMode === "owner") {
      groups["UNASSIGNED"] = [];
      users.forEach(user => {
        groups[user.id] = [];
      });
      requirements.forEach(req => {
        const key = req.ownerId || "UNASSIGNED";
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(req);
      });
    } else if (groupMode === "priority") {
      PRIORITY_ORDER.forEach(priority => {
        groups[priority] = [];
      });
      requirements.forEach(req => {
        const priority = req.priority || "P2";
        if (groups[priority]) {
          groups[priority].push(req);
        }
      });
    } else if (groupMode === "acceptanceStatus") {
      ACCEPTANCE_ORDER.forEach(status => {
        groups[status] = [];
      });
      requirements.forEach(req => {
        if (groups[req.acceptanceStatus]) {
          groups[req.acceptanceStatus].push(req);
        }
      });
    }

    return groups;
  }, [requirements, users, groupMode]);

  // Get column info based on group mode
  const getColumnInfo = useCallback((key: string) => {
    if (groupMode === "status") {
      const config = STATUS_CONFIG[key as RequirementStatus];
      return {
        title: config?.labelZh || key,
        color: config?.color || "text-zinc-600",
        bgColor: config?.bgColor || "bg-zinc-50",
        borderColor: config?.borderColor || "border-zinc-200",
      };
    } else if (groupMode === "owner") {
      if (key === "UNASSIGNED") {
        return {
          title: "未分配",
          color: "text-zinc-500",
          bgColor: "bg-zinc-50",
          borderColor: "border-zinc-200",
        };
      }
      const user = users.find(u => u.id === key);
      return {
        title: user?.name || "未知用户",
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    } else if (groupMode === "priority") {
      const config = PRIORITY_CONFIG[key];
      return {
        title: config?.label || key,
        color: config?.color || "text-zinc-600",
        bgColor: config?.bgColor || "bg-zinc-50",
        borderColor: config?.borderColor || "border-zinc-200",
      };
    } else if (groupMode === "acceptanceStatus") {
      const config = ACCEPTANCE_CONFIG[key];
      return {
        title: config?.label || key,
        color: config?.color || "text-zinc-600",
        bgColor: config?.bgColor || "bg-zinc-50",
        borderColor: config?.borderColor || "border-zinc-200",
      };
    }
    return {
      title: key,
      color: "text-zinc-600",
      bgColor: "bg-zinc-50",
      borderColor: "border-zinc-200",
    };
  }, [groupMode, users]);

  // Get column keys in order
  const columnKeys = useMemo(() => {
    if (groupMode === "status") return STATUS_ORDER;
    if (groupMode === "priority") return PRIORITY_ORDER;
    if (groupMode === "acceptanceStatus") return ACCEPTANCE_ORDER;
    if (groupMode === "owner") {
      return ["UNASSIGNED", ...users.map(u => u.id)];
    }
    return Object.keys(groupedRequirements);
  }, [groupMode, users, groupedRequirements]);

  // Drag handlers - using state to track dragged card since dataTransfer can be unreliable
  const handleDragStart = (e: React.DragEvent, reqId: string) => {
    setDraggedCard(reqId);
    e.dataTransfer.setData("text/plain", reqId);
    e.dataTransfer.effectAllowed = "move";
    // Add a drag image effect
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 10, 10);
    }
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving the column entirely (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Use state-tracked draggedCard since dataTransfer can be unreliable in some browsers
    const reqId = draggedCard || e.dataTransfer.getData("text/plain");

    // Reset state
    setDraggedCard(null);
    setDragOverColumn(null);

    if (!reqId) {
      console.warn("KanbanView: No requirement ID found for drop");
      return;
    }

    // Find the requirement
    const req = requirements.find(r => r.id === reqId);
    if (!req) {
      console.warn("KanbanView: Requirement not found:", reqId);
      return;
    }

    // Update based on group mode
    try {
      if (groupMode === "status") {
        if (req.status !== columnKey) {
          console.log(`KanbanView: Updating status from ${req.status} to ${columnKey}`);
          await onStatusChange(reqId, columnKey as RequirementStatus);
        }
      } else if (groupMode === "owner") {
        const newOwnerId = columnKey === "UNASSIGNED" ? null : columnKey;
        if (req.ownerId !== newOwnerId) {
          console.log(`KanbanView: Updating owner from ${req.ownerId} to ${newOwnerId}`);
          await onOwnerChange(reqId, newOwnerId);
        }
      }
    } catch (error) {
      console.error("KanbanView: Failed to update requirement:", error);
    }
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  // Check if column allows drop
  const canDropInColumn = () => {
    return groupMode === "status" || groupMode === "owner";
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header with group mode selector */}
      <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-500" />
          <h3 className="font-bold text-zinc-900">看板视图</h3>
          <span className="text-xs text-zinc-400 ml-2">共 {requirements.length} 条需求</span>
        </div>

        {/* Group Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">分组方式:</span>
          <div className="flex bg-white rounded-lg border border-zinc-200 p-0.5">
            <button
              onClick={() => setGroupMode("status")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                groupMode === "status" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Layers className="w-3 h-3" /> 状态
            </button>
            <button
              onClick={() => setGroupMode("owner")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                groupMode === "owner" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Users className="w-3 h-3" /> 负责人
            </button>
            <button
              onClick={() => setGroupMode("priority")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                groupMode === "priority" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Flag className="w-3 h-3" /> 优先级
            </button>
            <button
              onClick={() => setGroupMode("acceptanceStatus")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                groupMode === "acceptanceStatus" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <Calendar className="w-3 h-3" /> 验收状态
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {columnKeys.map(columnKey => {
            const items = groupedRequirements[columnKey] || [];
            const columnInfo = getColumnInfo(columnKey);
            const isDragOver = dragOverColumn === columnKey;
            const canDrop = canDropInColumn(columnKey);

            return (
              <div
                key={columnKey}
                className={`w-72 flex-shrink-0 rounded-xl border-2 transition-all ${
                  isDragOver && canDrop
                    ? "border-blue-400 bg-blue-50/50"
                    : `${columnInfo.borderColor} ${columnInfo.bgColor}`
                }`}
                onDragOver={canDrop ? (e) => handleDragOver(e, columnKey) : undefined}
                onDragLeave={canDrop ? (e) => handleDragLeave(e) : undefined}
                onDrop={canDrop ? (e) => handleDrop(e, columnKey) : undefined}
              >
                {/* Column Header */}
                <div className={`px-3 py-2.5 border-b ${columnInfo.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {groupMode === "owner" && columnKey !== "UNASSIGNED" ? (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-blue-600" />
                        </div>
                      ) : null}
                      <span className={`font-bold text-sm ${columnInfo.color}`}>
                        {columnInfo.title}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${columnInfo.bgColor} ${columnInfo.color}`}>
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-350px)] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs">
                      {canDrop ? "拖拽需求到这里" : "暂无需求"}
                    </div>
                  ) : (
                    items.map(req => (
                      <KanbanCard
                        key={req.id}
                        requirement={req}
                        users={users}
                        groupMode={groupMode}
                        parseTags={parseTags}
                        isDragging={draggedCard === req.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onClick={() => onCardClick(req)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      {(groupMode === "status" || groupMode === "owner") && (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 text-xs text-zinc-400 text-center">
          拖拽卡片可快速更改{groupMode === "status" ? "状态" : "负责人"}
        </div>
      )}
    </div>
  );
}

// Kanban Card Component
interface KanbanCardProps {
  requirement: InternalRequirement;
  users: User[];
  groupMode: KanbanGroupMode;
  parseTags: (tagsStr: string) => string[];
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, reqId: string) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

function KanbanCard({
  requirement,
  users,
  groupMode,
  parseTags,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
}: KanbanCardProps) {
  const tags = parseTags(requirement.tags);
  const owner = users.find(u => u.id === requirement.ownerId);
  const testCaseCount = requirement.testCases?.length || 0;
  const statusConfig = STATUS_CONFIG[requirement.status];

  // Track if we're dragging to prevent click after drag
  const [wasDragging, setWasDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setWasDragging(true);
    onDragStart(e, requirement.id);
  };

  const handleDragEnd = () => {
    onDragEnd();
    // Reset after a small delay to allow click event to be blocked
    setTimeout(() => setWasDragging(false), 100);
  };

  const handleClick = () => {
    if (!wasDragging) {
      onClick();
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`bg-white rounded-lg border border-zinc-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-zinc-300 transition-all ${
        isDragging ? "opacity-50 shadow-lg scale-105" : ""
      }`}
    >
      {/* Header: Priority + ID */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
          requirement.priority === "P0" ? "bg-red-500 text-white" :
          requirement.priority === "P1" ? "bg-orange-500 text-white" :
          requirement.priority === "P2" ? "bg-blue-500 text-white" :
          "bg-zinc-400 text-white"
        }`}>
          {requirement.priority || "P2"}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {`F-RQ-${requirement.id.slice(-4)}`}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-bold text-sm text-zinc-800 line-clamp-2 mb-2">
        {requirement.title}
      </h4>

      {/* Description */}
      {requirement.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
          {requirement.description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-zinc-100 text-zinc-600 rounded">
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-[10px] text-zinc-400">+{tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer: Status (if not grouping by status), Owner, Test Cases */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          {/* Show status badge if not grouping by status */}
          {groupMode !== "status" && (
            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${statusConfig?.bgColor} ${statusConfig?.color}`}>
              {statusConfig?.labelZh}
            </span>
          )}

          {/* Show owner if not grouping by owner */}
          {groupMode !== "owner" && owner && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-2.5 h-2.5 text-blue-600" />
              </div>
              <span className="text-[10px] text-zinc-500 truncate max-w-[60px]">
                {owner.name}
              </span>
            </div>
          )}
        </div>

        {/* Test case count */}
        <div className="flex items-center gap-1 text-zinc-400">
          <Link2 className="w-3 h-3" />
          <span className="text-[10px]">{testCaseCount}</span>
        </div>
      </div>
    </div>
  );
}

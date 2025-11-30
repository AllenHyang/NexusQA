import { Image, Link as LinkIcon, Figma } from "lucide-react";
import { RequirementStatus } from "@/types";

export const STATUS_OPTIONS: { value: RequirementStatus; label: string }[] = [
  { value: "DRAFT", label: "草稿" },
  { value: "PENDING_REVIEW", label: "待评审" },
  { value: "APPROVED", label: "已批准" },
  { value: "IN_PROGRESS", label: "进行中" },
  { value: "COMPLETED", label: "已完成" },
];

export const PRIORITY_OPTIONS = [
  { value: "P0", label: "P0 - 紧急" },
  { value: "P1", label: "P1 - 高" },
  { value: "P2", label: "P2 - 中" },
  { value: "P3", label: "P3 - 低" },
];

export const TARGET_USER_OPTIONS = [
  { value: "ADMIN", label: "管理员", icon: "👑" },
  { value: "PM", label: "产品经理", icon: "📋" },
  { value: "QA_LEAD", label: "测试负责人", icon: "🎯" },
  { value: "TESTER", label: "测试工程师", icon: "🧪" },
  { value: "DEVELOPER", label: "开发工程师", icon: "💻" },
];

export const DESIGN_TYPE_OPTIONS = [
  { value: "image", label: "图片", icon: Image },
  { value: "link", label: "链接", icon: LinkIcon },
  { value: "figma", label: "Figma", icon: Figma },
];

export const RELATION_TYPE_OPTIONS = [
  { value: "depends_on", label: "依赖于" },
  { value: "blocks", label: "阻塞" },
  { value: "related_to", label: "关联" },
];

// Status badge styles
export const getStatusBadgeStyle = (status: RequirementStatus): string => {
  switch (status) {
    case "DRAFT":
      return "bg-zinc-100 text-zinc-600";
    case "PENDING_REVIEW":
      return "bg-yellow-100 text-yellow-700";
    case "APPROVED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-orange-100 text-orange-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
};

// Priority badge styles
export const getPriorityBadgeStyle = (priority: string): string => {
  switch (priority) {
    case "P0":
      return "bg-red-500 text-white";
    case "P1":
      return "bg-orange-500 text-white";
    case "P2":
      return "bg-blue-500 text-white";
    case "P3":
      return "bg-zinc-400 text-white";
    default:
      return "bg-zinc-400 text-white";
  }
};

// Review action labels
export const getReviewActionLabel = (action: string): string => {
  switch (action) {
    case "SUBMIT":
      return "提交评审";
    case "APPROVE":
      return "批准";
    case "REJECT":
      return "拒绝";
    case "REQUEST_CHANGES":
      return "要求修改";
    case "START":
      return "开始实现";
    case "COMPLETE":
      return "标记完成";
    case "REOPEN":
      return "重新打开";
    default:
      return action;
  }
};

// Review action colors
export const getReviewActionColor = (action: string): string => {
  switch (action) {
    case "SUBMIT":
      return "bg-blue-100 text-blue-700";
    case "APPROVE":
      return "bg-green-100 text-green-700";
    case "REJECT":
      return "bg-red-100 text-red-700";
    case "REQUEST_CHANGES":
      return "bg-yellow-100 text-yellow-700";
    case "START":
      return "bg-purple-100 text-purple-700";
    case "COMPLETE":
      return "bg-emerald-100 text-emerald-700";
    case "REOPEN":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
};

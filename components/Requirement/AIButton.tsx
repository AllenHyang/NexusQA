"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface AIButtonProps {
  fieldType: string;
  label?: string;
  className?: string;
  generating: string | null;
  onGenerate: (fieldType: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function AIButton({
  fieldType,
  label = "AI 生成",
  className = "",
  generating,
  onGenerate,
  icon,
  disabled = false,
}: AIButtonProps) {
  const isGenerating = generating === fieldType;
  const isDisabled = generating !== null || disabled;

  return (
    <button
      type="button"
      onClick={() => onGenerate(fieldType)}
      disabled={isDisabled}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-all ${
        isGenerating
          ? "bg-purple-100 text-purple-600 cursor-wait"
          : "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 hover:from-purple-100 hover:to-blue-100 border border-purple-200"
      } ${isDisabled && !isGenerating ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {isGenerating ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          生成中...
        </>
      ) : (
        <>
          {icon || <Sparkles className="w-3 h-3" />}
          {label}
        </>
      )}
    </button>
  );
}

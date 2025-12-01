"use client";

import React from "react";
import {
  Palette,
  Plus,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { TabProps } from "./types";
import { DESIGN_TYPE_OPTIONS } from "./constants";
import { DesignReference } from "@/types";

interface DesignTabProps extends TabProps {
  onAddDesignReference: () => void;
  onUpdateDesignReference: (index: number, field: keyof DesignReference, value: string) => void;
  onRemoveDesignReference: (index: number) => void;
}

export function DesignTab({
  isEditMode,
  requirement,
  formState,
  onAddDesignReference,
  onUpdateDesignReference,
  onRemoveDesignReference,
}: DesignTabProps) {
  const { designReferences } = formState;

  if (!isEditMode && requirement) {
    // View Mode
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-zinc-600" />
          <h4 className="font-bold text-zinc-900">设计参考</h4>
          {designReferences.length > 0 && (
            <span className="text-xs text-zinc-400">({designReferences.length})</span>
          )}
        </div>

        {designReferences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {designReferences.map(ref => {
              const TypeIcon = DESIGN_TYPE_OPTIONS.find(o => o.value === ref.type)?.icon || LinkIcon;
              return (
                <a
                  key={ref.id}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      ref.type === "figma" ? "bg-purple-100 text-purple-600" :
                      ref.type === "image" ? "bg-blue-100 text-blue-600" :
                      "bg-zinc-100 text-zinc-600"
                    }`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs uppercase font-bold text-zinc-400">
                      {DESIGN_TYPE_OPTIONS.find(o => o.value === ref.type)?.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-blue-600 flex items-center gap-1">
                    {ref.title || ref.url}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-1">{ref.url}</p>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
            <Palette className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400">暂无设计参考</p>
            <p className="text-xs text-zinc-300 mt-1">点击「编辑」添加设计稿、原型链接</p>
          </div>
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-zinc-500 uppercase">
          设计参考
        </label>
        <button
          onClick={onAddDesignReference}
          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-3 h-3" /> 添加参考
        </button>
      </div>

      {designReferences.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
          <Palette className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">添加设计稿、原型、Figma 链接等</p>
        </div>
      ) : (
        <div className="space-y-3">
          {designReferences.map((ref, index) => (
            <div key={ref.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm"
                  value={ref.type}
                  onChange={e => onUpdateDesignReference(index, "type", e.target.value)}
                >
                  {DESIGN_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <input
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                  value={ref.title}
                  onChange={e => onUpdateDesignReference(index, "title", e.target.value)}
                  placeholder="标题"
                />
                <button
                  onClick={() => onRemoveDesignReference(index)}
                  className="p-2 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                value={ref.url}
                onChange={e => onUpdateDesignReference(index, "url", e.target.value)}
                placeholder="URL 地址"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tag, ChevronDown, X, Check } from "lucide-react";

interface TagFilterDropdownProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilterDropdown({ tags, selectedTags, onChange }: TagFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 border rounded-xl flex items-center gap-2 text-sm font-medium bg-white hover:bg-zinc-50 transition-colors ${
          selectedTags.length > 0
            ? "border-blue-300 text-blue-700 bg-blue-50"
            : "border-zinc-200 text-zinc-600"
        }`}
      >
        <Tag className="w-3.5 h-3.5" />
        {selectedTags.length === 0 ? (
          <span>标签筛选</span>
        ) : (
          <span>{selectedTags.length} 个标签</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Selected Tags Preview */}
      {selectedTags.length > 0 && !isOpen && (
        <div className="absolute top-full left-0 mt-1 flex flex-wrap gap-1 max-w-[300px]">
          {selectedTags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTag(tag);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {selectedTags.length > 3 && (
            <span className="text-xs text-zinc-400">+{selectedTags.length - 3}</span>
          )}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <span className="text-xs font-bold text-zinc-500 uppercase">选择标签</span>
            {selectedTags.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                清除全部
              </button>
            )}
          </div>

          {/* Tag List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {tags.length === 0 ? (
              <div className="py-4 text-center text-zinc-400 text-sm">
                暂无标签
              </div>
            ) : (
              <div className="space-y-0.5">
                {tags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-zinc-300"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm truncate">{tag}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedTags.length > 0 && (
            <div className="px-3 py-2 border-t border-zinc-100 bg-zinc-50">
              <div className="flex flex-wrap gap-1">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

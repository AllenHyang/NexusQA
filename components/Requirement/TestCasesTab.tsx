"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Link2,
  FileText,
  XCircle as XIcon,
  Search,
  Lightbulb,
} from "lucide-react";
import { AIButton } from "./AIButton";
import { TestCase } from "@/types";

interface TestCaseSuggestion {
  title: string;
  description: string;
  priority: string;
}

interface TestCasesTabProps {
  linkedTestCases: TestCase[];
  availableTestCases: TestCase[];
  aiGenerating: string | null;
  showTestCaseSuggestions: boolean;
  testCaseSuggestions: TestCaseSuggestion[];
  onAIGenerate: (fieldType: string) => void;
  onCloseSuggestions: () => void;
  onLinkTestCases: (testCaseIds: string[]) => void;
  onUnlinkTestCase: (testCaseId: string) => void;
}

export function TestCasesTab({
  linkedTestCases,
  availableTestCases,
  aiGenerating,
  showTestCaseSuggestions,
  testCaseSuggestions,
  onAIGenerate,
  onCloseSuggestions,
  onLinkTestCases,
  onUnlinkTestCase,
}: TestCasesTabProps) {
  const [showTestCaseSelector, setShowTestCaseSelector] = useState(false);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [testCaseSearchTerm, setTestCaseSearchTerm] = useState("");
  const [testCaseStatusFilter, setTestCaseStatusFilter] = useState<string>("ALL");
  const [testCasePriorityFilter, setTestCasePriorityFilter] = useState<string>("ALL");

  // Filter available test cases based on search and filters
  const filteredAvailableTestCases = useMemo(() => {
    return availableTestCases.filter(tc => {
      const matchesSearch = !testCaseSearchTerm ||
        tc.title.toLowerCase().includes(testCaseSearchTerm.toLowerCase()) ||
        tc.description?.toLowerCase().includes(testCaseSearchTerm.toLowerCase());
      const matchesStatus = testCaseStatusFilter === "ALL" || tc.status === testCaseStatusFilter;
      const matchesPriority = testCasePriorityFilter === "ALL" || tc.priority === testCasePriorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [availableTestCases, testCaseSearchTerm, testCaseStatusFilter, testCasePriorityFilter]);

  const handleLinkTestCases = () => {
    onLinkTestCases(selectedTestCaseIds);
    setShowTestCaseSelector(false);
    setSelectedTestCaseIds([]);
    setTestCaseSearchTerm("");
    setTestCaseStatusFilter("ALL");
    setTestCasePriorityFilter("ALL");
  };

  const handleCancel = () => {
    setShowTestCaseSelector(false);
    setSelectedTestCaseIds([]);
    setTestCaseSearchTerm("");
    setTestCaseStatusFilter("ALL");
    setTestCasePriorityFilter("ALL");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-900 font-medium">已关联的测试用例</h4>
        <div className="flex items-center gap-2">
          <AIButton
            fieldType="testCaseSuggestions"
            label="AI 推荐用例"
            generating={aiGenerating}
            onGenerate={onAIGenerate}
          />
          <button
            onClick={() => setShowTestCaseSelector(!showTestCaseSelector)}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> 关联用例
          </button>
        </div>
      </div>

      {/* AI Test Case Suggestions */}
      {showTestCaseSuggestions && testCaseSuggestions.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-800">AI 推荐的测试用例</span>
            </div>
            <button
              onClick={onCloseSuggestions}
              className="text-purple-400 hover:text-purple-600"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-purple-600">
            这些是 AI 根据需求推荐创建的测试用例，您可以参考这些建议来创建实际的测试用例。
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testCaseSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-purple-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        suggestion.priority === "HIGH" ? "bg-red-100 text-red-700" :
                        suggestion.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                        "bg-zinc-100 text-zinc-600"
                      }`}>
                        {suggestion.priority}
                      </span>
                      <span className="text-sm font-medium text-zinc-900">{suggestion.title}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{suggestion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Case Selector */}
      {showTestCaseSelector && (
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
          {/* Header with count */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">选择要关联的测试用例</p>
            <span className="text-xs text-zinc-500">共 {availableTestCases.length} 个可选</span>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索用例标题..."
                value={testCaseSearchTerm}
                onChange={e => setTestCaseSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none"
              />
            </div>
            <select
              value={testCaseStatusFilter}
              onChange={e => setTestCaseStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none"
            >
              <option value="ALL">所有状态</option>
              <option value="UNTESTED">未测试</option>
              <option value="PASSED">通过</option>
              <option value="FAILED">失败</option>
              <option value="BLOCKED">阻塞</option>
            </select>
            <select
              value={testCasePriorityFilter}
              onChange={e => setTestCasePriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none"
            >
              <option value="ALL">所有优先级</option>
              <option value="CRITICAL">紧急</option>
              <option value="HIGH">高</option>
              <option value="MEDIUM">中</option>
              <option value="LOW">低</option>
            </select>
          </div>

          {/* Test Case List */}
          <div className="max-h-64 overflow-y-auto space-y-1 border border-zinc-200 rounded-lg bg-white p-2">
            {filteredAvailableTestCases.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">
                {availableTestCases.length === 0 ? "没有可关联的测试用例" : "没有匹配的测试用例"}
              </p>
            ) : (
              filteredAvailableTestCases.map(tc => (
                <label
                  key={tc.id}
                  className="flex items-center gap-3 p-2.5 hover:bg-zinc-50 rounded-lg cursor-pointer border border-transparent hover:border-zinc-200 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedTestCaseIds.includes(tc.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedTestCaseIds([...selectedTestCaseIds, tc.id]);
                      } else {
                        setSelectedTestCaseIds(selectedTestCaseIds.filter(id => id !== tc.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Priority Badge */}
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        tc.priority === "CRITICAL" ? "bg-red-500 text-white" :
                        tc.priority === "HIGH" ? "bg-orange-500 text-white" :
                        tc.priority === "MEDIUM" ? "bg-blue-500 text-white" :
                        "bg-zinc-300 text-zinc-700"
                      }`}>
                        {tc.priority === "CRITICAL" ? "紧急" :
                         tc.priority === "HIGH" ? "高" :
                         tc.priority === "MEDIUM" ? "中" : "低"}
                      </span>
                      {/* Status Badge */}
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                        tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                        tc.status === "BLOCKED" ? "bg-orange-100 text-orange-700" :
                        "bg-zinc-100 text-zinc-500"
                      }`}>
                        {tc.status === "PASSED" ? "通过" :
                         tc.status === "FAILED" ? "失败" :
                         tc.status === "BLOCKED" ? "阻塞" : "未测试"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-900 truncate">{tc.title}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Footer with selected count and actions */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
            <div className="text-sm text-zinc-500">
              已选择 <span className="font-medium text-zinc-900">{selectedTestCaseIds.length}</span> 个用例
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900"
              >
                取消
              </button>
              <button
                onClick={handleLinkTestCases}
                disabled={selectedTestCaseIds.length === 0}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                确认关联
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Linked Test Cases List */}
      <div className="space-y-2">
        {linkedTestCases.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
            <Link2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400">暂无关联的测试用例</p>
          </div>
        ) : (
          linkedTestCases.map(tc => (
            <div
              key={tc.id}
              className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-900">{tc.title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                  tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                  "bg-zinc-100 text-zinc-500"
                }`}>
                  {tc.status}
                </span>
              </div>
              <button
                onClick={() => onUnlinkTestCase(tc.id)}
                className="p-1.5 text-zinc-400 hover:text-red-500"
                title="取消关联"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

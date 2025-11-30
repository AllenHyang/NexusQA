"use client";

import React from "react";
import {
  Activity,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle as XIcon,
} from "lucide-react";
import { TabProps, ACCoverage } from "./types";
import { AIButton } from "./AIButton";
import { AcceptanceCriteria, TestCase } from "@/types";

interface AcceptanceCriteriaTabProps extends TabProps {
  acCoverage: ACCoverage[];
  linkedTestCases: TestCase[];
  aiGenerating: string | null;
  onAIGenerate: (fieldType: string) => void;
  onAddAC: () => void;
  onUpdateAC: (index: number, field: keyof AcceptanceCriteria, value: string) => void;
  onRemoveAC: (index: number) => void;
}

export function AcceptanceCriteriaTab({
  isEditMode,
  requirement,
  formState,
  formActions,
  acCoverage,
  linkedTestCases,
  aiGenerating,
  onAIGenerate,
  onAddAC,
  onUpdateAC,
  onRemoveAC,
}: AcceptanceCriteriaTabProps) {
  const { acceptanceCriteria } = formState;
  const { setAcceptanceCriteria } = formActions;

  if (!isEditMode && requirement) {
    // View Mode
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-zinc-600" />
          <h4 className="font-bold text-zinc-900">验收标准</h4>
          <span className="text-xs text-zinc-400">
            ({acCoverage.filter(ac => ac.coverageStatus === 'covered').length}/{acCoverage.length} 已覆盖)
          </span>
        </div>

        {acCoverage.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
            <Target className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400">暂无验收标准</p>
          </div>
        ) : (
          <div className="space-y-3">
            {acCoverage.map((item, index) => (
              <div
                key={item.ac.id}
                className={`p-4 rounded-xl border ${
                  item.coverageStatus === 'covered' ? "bg-green-50 border-green-200" :
                  item.coverageStatus === 'partial' ? "bg-yellow-50 border-yellow-200" :
                  "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${
                    item.coverageStatus === 'covered' ? "text-green-600" :
                    item.coverageStatus === 'partial' ? "text-yellow-600" :
                    "text-zinc-400"
                  }`}>
                    {item.coverageStatus === 'covered' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : item.coverageStatus === 'partial' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <XIcon className="w-5 h-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-zinc-500">AC-{index + 1}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.coverageStatus === 'covered' ? "bg-green-100 text-green-700" :
                        item.coverageStatus === 'partial' ? "bg-yellow-100 text-yellow-700" :
                        "bg-zinc-100 text-zinc-500"
                      }`}>
                        {item.total > 0 ? `${item.passed}/${item.total} 通过` : "未关联用例"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700">{item.ac.description}</p>

                    {item.linkedTestCases.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-zinc-200 space-y-1.5">
                        {item.linkedTestCases.map(tc => (
                          <div key={tc.id} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              tc.status === "PASSED" ? "bg-green-500" :
                              tc.status === "FAILED" ? "bg-red-500" :
                              tc.status === "BLOCKED" ? "bg-yellow-500" :
                              "bg-zinc-300"
                            }`} />
                            <span className="text-zinc-600">{tc.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                              tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                              tc.status === "BLOCKED" ? "bg-yellow-100 text-yellow-700" :
                              "bg-zinc-100 text-zinc-500"
                            }`}>
                              {tc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-zinc-500 uppercase">
          验收标准 (AC)
        </label>
        <div className="flex items-center gap-2">
          <AIButton
            fieldType="acceptanceCriteria"
            label="AI 生成"
            generating={aiGenerating}
            onGenerate={onAIGenerate}
          />
          <button
            onClick={onAddAC}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-3 h-3" /> 添加
          </button>
        </div>
      </div>

      {acceptanceCriteria.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
          <Target className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">添加可验证的验收标准</p>
        </div>
      ) : (
        <div className="space-y-4">
          {acceptanceCriteria.map((ac, index) => {
            const acLinkedCases = linkedTestCases.filter(tc => ac.testCaseIds?.includes(tc.id));
            const acAvailableCases = linkedTestCases.filter(tc => !ac.testCaseIds?.includes(tc.id));

            return (
              <div key={ac.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                {/* AC Header */}
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-zinc-400 mt-2.5">AC-{index + 1}</span>
                  <textarea
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none min-h-[60px]"
                    value={ac.description}
                    onChange={e => onUpdateAC(index, "description", e.target.value)}
                    placeholder="描述具体可测的验收标准..."
                  />
                  <button
                    onClick={() => onRemoveAC(index)}
                    className="p-1.5 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Linked Test Cases for this AC */}
                {requirement && (
                  <div className="ml-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">
                        关联用例 ({acLinkedCases.length})
                      </span>
                      {acAvailableCases.length > 0 && (
                        <div className="relative group">
                          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                            <Plus className="w-3 h-3" /> 关联
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                            <div className="p-2 max-h-40 overflow-y-auto">
                              {acAvailableCases.map(tc => (
                                <button
                                  key={tc.id}
                                  onClick={() => {
                                    const updated = [...acceptanceCriteria];
                                    updated[index] = {
                                      ...updated[index],
                                      testCaseIds: [...(updated[index].testCaseIds || []), tc.id]
                                    };
                                    setAcceptanceCriteria(updated);
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-zinc-50 rounded flex items-center gap-2"
                                >
                                  <span className={`w-2 h-2 rounded-full ${
                                    tc.status === "PASSED" ? "bg-green-500" :
                                    tc.status === "FAILED" ? "bg-red-500" :
                                    tc.status === "BLOCKED" ? "bg-yellow-500" :
                                    "bg-zinc-300"
                                  }`} />
                                  <span className="truncate">{tc.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {acLinkedCases.length > 0 ? (
                      <div className="space-y-1">
                        {acLinkedCases.map(tc => (
                          <div key={tc.id} className="flex items-center justify-between p-2 bg-white border border-zinc-100 rounded-lg">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                tc.status === "PASSED" ? "bg-green-500" :
                                tc.status === "FAILED" ? "bg-red-500" :
                                tc.status === "BLOCKED" ? "bg-yellow-500" :
                                "bg-zinc-300"
                              }`} />
                              <span className="text-zinc-700">{tc.title}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                                tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                                tc.status === "BLOCKED" ? "bg-yellow-100 text-yellow-700" :
                                "bg-zinc-100 text-zinc-500"
                              }`}>
                                {tc.status === "PASSED" ? "通过" :
                                 tc.status === "FAILED" ? "失败" :
                                 tc.status === "BLOCKED" ? "阻塞" : "未测试"}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const updated = [...acceptanceCriteria];
                                updated[index] = {
                                  ...updated[index],
                                  testCaseIds: updated[index].testCaseIds?.filter(id => id !== tc.id) || []
                                };
                                setAcceptanceCriteria(updated);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-500"
                            >
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-1">
                        {linkedTestCases.length === 0
                          ? "请先在「关联用例」标签页关联测试用例"
                          : "点击上方「关联」按钮选择用例"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

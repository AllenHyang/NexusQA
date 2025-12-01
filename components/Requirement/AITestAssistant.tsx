"use client";

import React, { useState, useMemo } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Wand2,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Plus,
  SkipForward,
  RefreshCw,
} from "lucide-react";
import { TestCase, AcceptanceCriteria } from "@/types";

interface TestCaseSuggestion {
  title: string;
  description: string;
  priority: string;
  status?: 'pending' | 'checking' | 'created' | 'skipped' | 'duplicate';
  duplicateInfo?: {
    id: string;
    title: string;
    similarity: number;
  };
}

interface AITestAssistantProps {
  // Current state
  linkedTestCases: TestCase[];
  availableTestCases: TestCase[];
  acceptanceCriteria: AcceptanceCriteria[];
  isEditMode: boolean;
  projectId: string;
  requirementId?: string;
  requirementTitle?: string;
  requirementDescription?: string;

  // AI generation state
  aiGenerating: string | null;

  // Callbacks
  onAIGenerate: (fieldType: string) => void;
  onLinkTestCases: (testCaseIds: string[]) => void;
  onCreateTestCase: (suggestion: TestCaseSuggestion) => Promise<TestCase | null>;
  onViewTestCase?: (testCaseId: string) => void;

  // AI Match results
  showAIMatchResults?: boolean;
  aiMatchedTestCases?: Array<{ id: string; title: string; reason: string; score: number }>;
  onCloseAIMatch?: () => void;

  // Test case suggestions
  showTestCaseSuggestions?: boolean;
  testCaseSuggestions?: TestCaseSuggestion[];
  onCloseSuggestions?: () => void;

  // AC coverage
  acCoverageRate: number;
}

type RecommendedAction = 'aiSmartMatch' | 'testCaseSuggestions' | 'autoLinkAC' | null;

export function AITestAssistant({
  linkedTestCases,
  availableTestCases,
  acceptanceCriteria,
  isEditMode,
  projectId,
  requirementId: _requirementId,
  requirementTitle: _requirementTitle,
  requirementDescription: _requirementDescription,
  aiGenerating,
  onAIGenerate,
  onLinkTestCases,
  onCreateTestCase,
  onViewTestCase,
  showAIMatchResults = false,
  aiMatchedTestCases = [],
  onCloseAIMatch,
  showTestCaseSuggestions = false,
  testCaseSuggestions: externalSuggestions = [],
  onCloseSuggestions,
  acCoverageRate,
}: AITestAssistantProps) {
  // Reserved for future use
  void _requirementId;
  void _requirementTitle;
  void _requirementDescription;

  const [expanded, setExpanded] = useState(false);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<TestCaseSuggestion[]>([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState<string | null>(null);
  const [creatingCase, setCreatingCase] = useState<string | null>(null);

  // Sync external suggestions to internal state
  React.useEffect(() => {
    if (externalSuggestions.length > 0) {
      setSuggestions(externalSuggestions.map(s => ({ ...s, status: 'pending' as const })));
    }
  }, [externalSuggestions]);

  // Auto-select all matched test cases
  React.useEffect(() => {
    if (showAIMatchResults && aiMatchedTestCases.length > 0) {
      setSelectedMatchIds(aiMatchedTestCases.map(tc => tc.id));
    }
  }, [showAIMatchResults, aiMatchedTestCases]);

  // Determine recommended action based on current state
  const recommendation = useMemo((): { action: RecommendedAction; reason: string } => {
    const linkedCount = linkedTestCases.length;
    const availableCount = availableTestCases.length;
    const acCount = acceptanceCriteria.length;

    if (linkedCount === 0 && availableCount > 0) {
      return { action: 'aiSmartMatch', reason: `检测到 ${availableCount} 个可用用例，推荐智能匹配` };
    }
    if (linkedCount === 0 && availableCount === 0) {
      return { action: 'testCaseSuggestions', reason: '暂无可用用例，推荐生成新用例' };
    }
    if (linkedCount > 0 && acCount > 0 && acCoverageRate < 100) {
      return { action: 'autoLinkAC', reason: `AC 覆盖率 ${acCoverageRate}%，推荐自动关联` };
    }
    return { action: null, reason: '测试覆盖完善' };
  }, [linkedTestCases.length, availableTestCases.length, acceptanceCriteria.length, acCoverageRate]);

  // Check duplicate for a suggestion
  const handleCheckDuplicate = async (index: number) => {
    const suggestion = suggestions[index];
    setCheckingDuplicate(suggestion.title);

    try {
      const response = await fetch("/api/ai/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          description: suggestion.description,
          fieldType: "checkDuplicate",
          context: JSON.stringify({
            projectId,
            availableTestCases: availableTestCases.map(tc => ({
              id: tc.id,
              title: tc.title,
              description: tc.description,
            })),
          }),
        }),
      });

      if (!response.ok) throw new Error("Check failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updated = [...suggestions];
        if (parsed.isDuplicate && parsed.similarity >= 70) {
          updated[index] = {
            ...updated[index],
            status: 'duplicate',
            duplicateInfo: {
              id: parsed.duplicateId,
              title: parsed.duplicateTitle,
              similarity: parsed.similarity,
            },
          };
        } else {
          updated[index] = { ...updated[index], status: 'pending' };
        }
        setSuggestions(updated);
      }
    } catch (error) {
      console.error("Check duplicate error:", error);
    } finally {
      setCheckingDuplicate(null);
    }
  };

  // Create test case from suggestion
  const handleCreateCase = async (index: number) => {
    const suggestion = suggestions[index];
    setCreatingCase(suggestion.title);

    try {
      const created = await onCreateTestCase(suggestion);
      if (created) {
        const updated = [...suggestions];
        updated[index] = { ...updated[index], status: 'created' };
        setSuggestions(updated);
      }
    } catch (error) {
      console.error("Create case error:", error);
    } finally {
      setCreatingCase(null);
    }
  };

  // Skip a suggestion
  const handleSkip = (index: number) => {
    const updated = [...suggestions];
    updated[index] = { ...updated[index], status: 'skipped' };
    setSuggestions(updated);
  };

  // Link AI matched test cases
  const handleLinkAIMatched = () => {
    if (selectedMatchIds.length > 0) {
      onLinkTestCases(selectedMatchIds);
      setSelectedMatchIds([]);
      onCloseAIMatch?.();
    }
  };

  // Stats for suggestions
  const suggestionStats = useMemo(() => {
    const created = suggestions.filter(s => s.status === 'created').length;
    const skipped = suggestions.filter(s => s.status === 'skipped').length;
    const pending = suggestions.filter(s => s.status === 'pending' || s.status === 'duplicate').length;
    return { created, skipped, pending, total: suggestions.length };
  }, [suggestions]);

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      HIGH: "bg-red-100 text-red-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      LOW: "bg-zinc-100 text-zinc-600",
      CRITICAL: "bg-purple-100 text-purple-700",
    };
    return config[priority] || config.LOW;
  };

  return (
    <div className="border border-purple-200 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50/50 to-blue-50/50">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-purple-100/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-purple-900">智能测试助手</span>
            <p className="text-xs text-purple-600">{recommendation.reason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aiGenerating && (
            <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              {aiGenerating === 'testCaseSuggestions' ? '生成中...' :
               aiGenerating === 'aiSmartMatch' ? '匹配中...' : '分析中...'}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-purple-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-purple-200 p-4 space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-purple-100">
              <div className="text-lg font-bold text-purple-900">{linkedTestCases.length}</div>
              <div className="text-[10px] text-purple-600">已关联</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100">
              <div className="text-lg font-bold text-purple-900">{availableTestCases.length}</div>
              <div className="text-[10px] text-purple-600">可用用例</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100">
              <div className="text-lg font-bold text-purple-900">{acceptanceCriteria.length}</div>
              <div className="text-[10px] text-purple-600">验收标准</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-purple-100">
              <div className="text-lg font-bold text-purple-900">{acCoverageRate}%</div>
              <div className="text-[10px] text-purple-600">AC覆盖</div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-2">
            {/* AI Smart Match */}
            <div className={`p-3 rounded-lg border ${recommendation.action === 'aiSmartMatch' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className={`w-4 h-4 ${recommendation.action === 'aiSmartMatch' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  <div>
                    <span className="text-sm font-medium text-zinc-900">AI 智能匹配</span>
                    {recommendation.action === 'aiSmartMatch' && (
                      <span className="ml-2 text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded">推荐</span>
                    )}
                    <p className="text-xs text-zinc-500">从用例库中智能匹配相关用例</p>
                  </div>
                </div>
                <button
                  onClick={() => onAIGenerate('aiSmartMatch')}
                  disabled={aiGenerating !== null || availableTestCases.length === 0}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {aiGenerating === 'aiSmartMatch' ? <Loader2 className="w-3 h-3 animate-spin" /> : '开始匹配'}
                </button>
              </div>
            </div>

            {/* AI Suggest Test Cases */}
            <div className={`p-3 rounded-lg border ${recommendation.action === 'testCaseSuggestions' ? 'bg-blue-50 border-blue-200' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className={`w-4 h-4 ${recommendation.action === 'testCaseSuggestions' ? 'text-blue-600' : 'text-zinc-400'}`} />
                  <div>
                    <span className="text-sm font-medium text-zinc-900">AI 推荐用例</span>
                    {recommendation.action === 'testCaseSuggestions' && (
                      <span className="ml-2 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">推荐</span>
                    )}
                    <p className="text-xs text-zinc-500">根据需求生成测试用例建议，可一键创建</p>
                  </div>
                </div>
                <button
                  onClick={() => onAIGenerate('testCaseSuggestions')}
                  disabled={aiGenerating !== null}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {aiGenerating === 'testCaseSuggestions' ? <Loader2 className="w-3 h-3 animate-spin" /> : '生成建议'}
                </button>
              </div>
            </div>

            {/* Auto Link AC */}
            {isEditMode && linkedTestCases.length > 0 && acceptanceCriteria.length > 0 && (
              <div className={`p-3 rounded-lg border ${recommendation.action === 'autoLinkAC' ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${recommendation.action === 'autoLinkAC' ? 'text-amber-600' : 'text-zinc-400'}`} />
                    <div>
                      <span className="text-sm font-medium text-zinc-900">AI 自动关联 AC</span>
                      {recommendation.action === 'autoLinkAC' && (
                        <span className="ml-2 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded">推荐</span>
                      )}
                      <p className="text-xs text-zinc-500">自动将用例关联到对应验收标准</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAIGenerate('autoLinkACTestCases')}
                    disabled={aiGenerating !== null}
                    className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {aiGenerating === 'autoLinkACTestCases' ? <Loader2 className="w-3 h-3 animate-spin" /> : '自动关联'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Smart Match Results */}
          {showAIMatchResults && aiMatchedTestCases.length > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-800">智能匹配结果</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    找到 {aiMatchedTestCases.length} 个相关用例
                  </span>
                </div>
                <button onClick={onCloseAIMatch} className="text-emerald-400 hover:text-emerald-600">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {aiMatchedTestCases.map((match) => (
                  <label key={match.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-emerald-100 cursor-pointer hover:border-emerald-300">
                    <input
                      type="checkbox"
                      checked={selectedMatchIds.includes(match.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedMatchIds([...selectedMatchIds, match.id]);
                        } else {
                          setSelectedMatchIds(selectedMatchIds.filter(id => id !== match.id));
                        }
                      }}
                      className="w-4 h-4 mt-0.5 rounded border-emerald-300 text-emerald-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          match.score >= 80 ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
                        }`}>{match.score}%</span>
                        <span className="text-sm font-medium text-zinc-900 truncate">{match.title}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{match.reason}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                <span className="text-sm text-emerald-600">已选择 {selectedMatchIds.length} 个</span>
                <div className="flex gap-2">
                  <button onClick={onCloseAIMatch} className="px-3 py-1.5 text-sm text-emerald-600">取消</button>
                  <button
                    onClick={handleLinkAIMatched}
                    disabled={selectedMatchIds.length === 0}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 确认关联
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Test Case Suggestions with Create Actions */}
          {(showTestCaseSuggestions || suggestions.length > 0) && suggestions.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">AI 推荐用例</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {suggestionStats.total} 个建议
                  </span>
                </div>
                <button onClick={() => { setSuggestions([]); onCloseSuggestions?.(); }} className="text-blue-400 hover:text-blue-600">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-blue-600">创建前会自动检查是否与现有用例重复</p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      suggestion.status === 'created' ? 'bg-green-50 border-green-200' :
                      suggestion.status === 'skipped' ? 'bg-zinc-100 border-zinc-200 opacity-60' :
                      suggestion.status === 'duplicate' ? 'bg-amber-50 border-amber-200' :
                      'bg-white border-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${getPriorityBadge(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                          <span className="text-sm font-medium text-zinc-900">{suggestion.title}</span>
                          {suggestion.status === 'created' && (
                            <span className="flex items-center gap-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> 已创建
                            </span>
                          )}
                          {suggestion.status === 'skipped' && (
                            <span className="text-[10px] bg-zinc-400 text-white px-1.5 py-0.5 rounded">已跳过</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">{suggestion.description}</p>

                        {/* Duplicate Warning */}
                        {suggestion.status === 'duplicate' && suggestion.duplicateInfo && (
                          <div className="mt-2 p-2 bg-amber-100 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-amber-800">
                                发现相似用例: <strong>{suggestion.duplicateInfo.title}</strong> (相似度 {suggestion.duplicateInfo.similarity}%)
                              </p>
                            </div>
                            {onViewTestCase && (
                              <button
                                onClick={() => onViewTestCase(suggestion.duplicateInfo!.id)}
                                className="flex-shrink-0 text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> 查看
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {(suggestion.status === 'pending' || suggestion.status === 'duplicate') && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {suggestion.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleCheckDuplicate(index)}
                                disabled={checkingDuplicate !== null}
                                className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="检查重复"
                              >
                                {checkingDuplicate === suggestion.title ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleCreateCase(index)}
                                disabled={creatingCase !== null}
                                className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="创建用例"
                              >
                                {creatingCase === suggestion.title ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          {suggestion.status === 'duplicate' && (
                            <button
                              onClick={() => handleCreateCase(index)}
                              disabled={creatingCase !== null}
                              className="px-2 py-1 text-xs text-amber-700 hover:bg-amber-200 bg-amber-100 rounded transition-colors"
                              title="仍然创建"
                            >
                              仍然创建
                            </button>
                          )}
                          <button
                            onClick={() => handleSkip(index)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                            title="跳过"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <span className="text-xs text-blue-600">
                  已创建: {suggestionStats.created} | 已跳过: {suggestionStats.skipped} | 待处理: {suggestionStats.pending}
                </span>
                {suggestionStats.pending === 0 && suggestionStats.total > 0 && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 处理完成
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

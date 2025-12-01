"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Link2,
  FileText,
  XCircle as XIcon,
  Search,
  ExternalLink,
  Target,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AITestAssistant } from "./AITestAssistant";
import { TestCase, AcceptanceCriteria } from "@/types";

interface TestCaseSuggestion {
  title: string;
  description: string;
  priority: string;
}

interface AIMatchedTestCase {
  id: string;
  title: string;
  reason: string;
  score: number;
}

interface AIAutoLinkMapping {
  acId: string;
  acDescription: string;
  testCaseIds: string[];
  testCaseTitles: string[];
  reason: string;
}

interface ACCoverageItem {
  ac: AcceptanceCriteria;
  linkedTestCases: TestCase[];
  coverageStatus: 'covered' | 'partial' | 'uncovered';
  passed: number;
  failed: number;
  total: number;
}

interface TestStats {
  total: number;
  executed: number;
  passed: number;
  failed: number;
  blocked: number;
  executionProgress: number;
  passRate: number;
}

interface TestCasesTabProps {
  linkedTestCases: TestCase[];
  availableTestCases: TestCase[];
  acceptanceCriteria: AcceptanceCriteria[];
  acCoverage: ACCoverageItem[];
  testStats: TestStats;
  aiGenerating: string | null;
  showTestCaseSuggestions: boolean;
  testCaseSuggestions: TestCaseSuggestion[];
  showAIMatchResults?: boolean;
  aiMatchedTestCases?: AIMatchedTestCase[];
  isEditMode?: boolean;
  formState?: { acceptanceCriteria: AcceptanceCriteria[] };
  formActions?: { setAcceptanceCriteria: (ac: AcceptanceCriteria[]) => void };
  requirementTitle?: string;
  requirementDescription?: string;
  projectId?: string;
  requirementId?: string;
  onAIGenerate: (fieldType: string) => void;
  onCloseSuggestions: () => void;
  onCloseAIMatch?: () => void;
  onLinkTestCases: (testCaseIds: string[]) => void;
  onUnlinkTestCase: (testCaseId: string) => void;
  onViewTestCase?: (testCaseId: string) => void;
  onCreateTestCase?: (suggestion: TestCaseSuggestion) => Promise<TestCase | null>;
  onShowACLinkPrompt?: () => void;
}

export function TestCasesTab({
  linkedTestCases,
  availableTestCases,
  acceptanceCriteria,
  acCoverage,
  testStats,
  aiGenerating,
  showTestCaseSuggestions,
  testCaseSuggestions,
  showAIMatchResults = false,
  aiMatchedTestCases = [],
  isEditMode = false,
  formState,
  formActions,
  requirementTitle,
  requirementDescription,
  projectId,
  requirementId,
  onAIGenerate,
  onCloseSuggestions,
  onCloseAIMatch,
  onLinkTestCases,
  onUnlinkTestCase,
  onViewTestCase,
  onCreateTestCase,
  onShowACLinkPrompt: _onShowACLinkPrompt,
}: TestCasesTabProps) {
  void _onShowACLinkPrompt; // Reserved for future use
  const [showTestCaseSelector, setShowTestCaseSelector] = useState(false);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [testCaseSearchTerm, setTestCaseSearchTerm] = useState("");
  const [testCaseStatusFilter, setTestCaseStatusFilter] = useState<string>("ALL");
  const [testCasePriorityFilter, setTestCasePriorityFilter] = useState<string>("ALL");

  // AC section expansion state
  const [expandedACs, setExpandedACs] = useState<Set<string>>(new Set(acceptanceCriteria.map(ac => ac.id)));
  const [unassignedExpanded, setUnassignedExpanded] = useState(true);

  // AC-level linking state
  const [linkingToACId, setLinkingToACId] = useState<string | null>(null);
  const [acLinkSearchTerm, setAcLinkSearchTerm] = useState("");

  // AI auto-link state
  const [autoLinking, setAutoLinking] = useState(false);
  const [autoLinkResults, setAutoLinkResults] = useState<AIAutoLinkMapping[]>([]);
  const [showAutoLinkConfirm, setShowAutoLinkConfirm] = useState(false);

  // Calculate AC coverage stats
  const acStats = useMemo(() => {
    const total = acceptanceCriteria.length;
    const covered = acCoverage.filter(item => item.total > 0).length;
    const allPassed = acCoverage.filter(item => item.coverageStatus === 'covered').length;
    return { total, covered, allPassed, coverageRate: total > 0 ? Math.round((covered / total) * 100) : 0 };
  }, [acceptanceCriteria, acCoverage]);

  // Calculate unassigned test cases (linked to requirement but not assigned to any AC)
  const unassignedTestCases = useMemo(() => {
    const assignedIds = new Set<string>();
    acceptanceCriteria.forEach(ac => {
      (ac.testCaseIds || []).forEach(id => assignedIds.add(id));
    });
    return linkedTestCases.filter(tc => !assignedIds.has(tc.id));
  }, [linkedTestCases, acceptanceCriteria]);

  // Filter available test cases
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

  // Get test cases available for linking to a specific AC
  const getAvailableForAC = (acId: string) => {
    const ac = acceptanceCriteria.find(a => a.id === acId);
    const alreadyLinkedIds = ac?.testCaseIds || [];
    return linkedTestCases.filter(tc =>
      !alreadyLinkedIds.includes(tc.id) &&
      (!acLinkSearchTerm || tc.title.toLowerCase().includes(acLinkSearchTerm.toLowerCase()))
    );
  };

  // Link test case to AC
  const handleLinkToAC = (acId: string, testCaseId: string) => {
    if (!formState || !formActions) return;
    const updated = formState.acceptanceCriteria.map(ac => {
      if (ac.id === acId) {
        const newTestCaseIds = [...(ac.testCaseIds || [])];
        if (!newTestCaseIds.includes(testCaseId)) {
          newTestCaseIds.push(testCaseId);
        }
        return { ...ac, testCaseIds: newTestCaseIds };
      }
      return ac;
    });
    formActions.setAcceptanceCriteria(updated);
    setAcLinkSearchTerm("");
  };

  // Unlink test case from AC
  const handleUnlinkFromAC = (acId: string, testCaseId: string) => {
    if (!formState || !formActions) return;
    const updated = formState.acceptanceCriteria.map(ac => {
      if (ac.id === acId) {
        return {
          ...ac,
          testCaseIds: (ac.testCaseIds || []).filter(id => id !== testCaseId)
        };
      }
      return ac;
    });
    formActions.setAcceptanceCriteria(updated);
  };

  // AI auto-link handler - shows results for confirmation
  const handleAutoLink = async () => {
    if (!linkedTestCases.length || !formState?.acceptanceCriteria.length || !formActions) return;

    setAutoLinking(true);
    try {
      const response = await fetch("/api/ai/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: requirementTitle || "",
          description: requirementDescription || "",
          fieldType: "autoLinkACTestCases",
          context: JSON.stringify({
            acceptanceCriteria: formState.acceptanceCriteria,
            linkedTestCases: linkedTestCases.map(tc => ({
              id: tc.id,
              title: tc.title,
              description: tc.description,
              userStory: tc.userStory,
              acceptanceCriteria: tc.acceptanceCriteria,
            })),
          }),
        }),
      });

      if (!response.ok) throw new Error("AI request failed");

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
        if (parsed.mappings && Array.isArray(parsed.mappings)) {
          // Build results with readable info for confirmation
          const results: AIAutoLinkMapping[] = parsed.mappings.map((mapping: { acId: string; testCaseIds: string[]; reason?: string }) => {
            const ac = formState.acceptanceCriteria.find(a => a.id === mapping.acId);
            const tcTitles = mapping.testCaseIds.map(id => {
              const tc = linkedTestCases.find(t => t.id === id);
              return tc?.title || id;
            });
            return {
              acId: mapping.acId,
              acDescription: ac?.description || mapping.acId,
              testCaseIds: mapping.testCaseIds,
              testCaseTitles: tcTitles,
              reason: mapping.reason || "",
            };
          }).filter((m: AIAutoLinkMapping) => m.testCaseIds.length > 0);

          if (results.length > 0) {
            setAutoLinkResults(results);
            setShowAutoLinkConfirm(true);
          }
        }
      }
    } catch (error) {
      console.error("Auto-link error:", error);
    } finally {
      setAutoLinking(false);
    }
  };

  // Apply the confirmed auto-link mappings
  const handleConfirmAutoLink = () => {
    if (!formState || !formActions || autoLinkResults.length === 0) return;

    const updated = [...formState.acceptanceCriteria];
    autoLinkResults.forEach(mapping => {
      const acIndex = updated.findIndex(ac => ac.id === mapping.acId);
      if (acIndex !== -1) {
        const existingIds = updated[acIndex].testCaseIds || [];
        const newIds = [...new Set([...existingIds, ...mapping.testCaseIds])];
        updated[acIndex] = { ...updated[acIndex], testCaseIds: newIds };
      }
    });
    formActions.setAcceptanceCriteria(updated);
    setAutoLinkResults([]);
    setShowAutoLinkConfirm(false);
  };

  // Cancel auto-link
  const handleCancelAutoLink = () => {
    setAutoLinkResults([]);
    setShowAutoLinkConfirm(false);
  };

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

  const handleViewClick = (testCaseId: string) => {
    if (onViewTestCase) {
      onViewTestCase(testCaseId);
    }
  };

  const toggleACExpanded = (acId: string) => {
    setExpandedACs(prev => {
      const next = new Set(prev);
      if (next.has(acId)) {
        next.delete(acId);
      } else {
        next.add(acId);
      }
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      PASSED: { bg: "bg-green-100", text: "text-green-700", label: "通过" },
      FAILED: { bg: "bg-red-100", text: "text-red-700", label: "失败" },
      BLOCKED: { bg: "bg-orange-100", text: "text-orange-700", label: "阻塞" },
      UNTESTED: { bg: "bg-zinc-100", text: "text-zinc-500", label: "未测试" },
    };
    const c = config[status] || config.UNTESTED;
    return <span className={`text-xs px-1.5 py-0.5 rounded ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Coverage Stats Card */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="text-2xl font-bold text-zinc-900">{testStats.total}</div>
          <div className="text-xs text-zinc-500">已关联用例</div>
        </div>
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="text-2xl font-bold text-zinc-900">{acStats.coverageRate}%</div>
          <div className="text-xs text-zinc-500">AC 覆盖率 ({acStats.covered}/{acStats.total})</div>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-700">{testStats.passed}</div>
          <div className="text-xs text-green-600">通过</div>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="text-2xl font-bold text-red-700">{testStats.failed}</div>
          <div className="text-xs text-red-600">失败</div>
        </div>
      </div>

      {/* AI Test Assistant */}
      <AITestAssistant
        linkedTestCases={linkedTestCases}
        availableTestCases={availableTestCases}
        acceptanceCriteria={acceptanceCriteria}
        isEditMode={isEditMode}
        projectId={projectId || ""}
        requirementId={requirementId}
        requirementTitle={requirementTitle}
        requirementDescription={requirementDescription}
        aiGenerating={aiGenerating}
        onAIGenerate={(fieldType) => {
          if (fieldType === "autoLinkACTestCases") {
            handleAutoLink();
          } else {
            onAIGenerate(fieldType);
          }
        }}
        onLinkTestCases={onLinkTestCases}
        onCreateTestCase={onCreateTestCase || (async () => null)}
        onViewTestCase={onViewTestCase}
        showAIMatchResults={showAIMatchResults}
        aiMatchedTestCases={aiMatchedTestCases}
        onCloseAIMatch={onCloseAIMatch}
        showTestCaseSuggestions={showTestCaseSuggestions}
        testCaseSuggestions={testCaseSuggestions}
        onCloseSuggestions={onCloseSuggestions}
        acCoverageRate={acStats.coverageRate}
      />

      {/* Manual Link Button */}
      {isEditMode && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowTestCaseSelector(!showTestCaseSelector)}
            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> 手动关联用例
          </button>
        </div>
      )}

      {/* Test Case Selector */}
      {showTestCaseSelector && (
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">选择要关联的测试用例</p>
            <span className="text-xs text-zinc-500">共 {availableTestCases.length} 个可选</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索用例..."
                value={testCaseSearchTerm}
                onChange={e => setTestCaseSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg"
              />
            </div>
            <select value={testCaseStatusFilter} onChange={e => setTestCaseStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-zinc-200 rounded-lg">
              <option value="ALL">所有状态</option>
              <option value="UNTESTED">未测试</option>
              <option value="PASSED">通过</option>
              <option value="FAILED">失败</option>
            </select>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-zinc-200 rounded-lg bg-white p-2">
            {filteredAvailableTestCases.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">没有可关联的测试用例</p>
            ) : (
              filteredAvailableTestCases.map(tc => (
                <label key={tc.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer">
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
                    className="w-4 h-4 rounded border-zinc-300"
                  />
                  <span className="text-sm text-zinc-900 truncate flex-1">{tc.title}</span>
                  {getStatusBadge(tc.status)}
                </label>
              ))
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
            <span className="text-sm text-zinc-500">已选择 {selectedTestCaseIds.length} 个</span>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-zinc-500">取消</button>
              <button
                onClick={handleLinkTestCases}
                disabled={selectedTestCaseIds.length === 0}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 text-white rounded-lg text-sm font-medium"
              >
                确认关联
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Auto-Link Confirmation Panel */}
      {showAutoLinkConfirm && autoLinkResults.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-800">AI 智能分配建议</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {autoLinkResults.length} 条映射
              </span>
            </div>
            <button onClick={handleCancelAutoLink} className="text-amber-400 hover:text-amber-600">
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-amber-700">AI 分析了用例内容，建议进行以下分配。请确认后应用：</p>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {autoLinkResults.map((mapping, index) => (
              <div key={mapping.acId} className="p-3 bg-white rounded-lg border border-amber-100">
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{mapping.acDescription}</p>
                    {mapping.reason && (
                      <p className="text-xs text-zinc-500 mt-0.5">{mapping.reason}</p>
                    )}
                  </div>
                </div>
                <div className="pl-8 space-y-1">
                  {mapping.testCaseTitles.map((title, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                      <FileText className="w-3 h-3 text-amber-400" />
                      <span className="truncate">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-amber-200">
            <span className="text-sm text-amber-600">
              共 {autoLinkResults.reduce((sum, m) => sum + m.testCaseIds.length, 0)} 个用例将被分配
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelAutoLink}
                className="px-3 py-1.5 text-sm text-amber-600"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAutoLink}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" /> 确认应用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: AC Coverage View */}
      {linkedTestCases.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
          <Link2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-400">暂无关联的测试用例</p>
          <p className="text-xs text-zinc-400 mt-1">点击上方「关联用例」按钮添加</p>
        </div>
      ) : acceptanceCriteria.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
          <Target className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-400">暂无验收标准</p>
          <p className="text-xs text-zinc-400 mt-1">请先在「验收标准」标签页定义 AC</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* AC Coverage Section */}
          <div className="space-y-3">
            <h4 className="text-zinc-900 font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              验收标准覆盖 ({acStats.covered}/{acStats.total})
            </h4>

            <div className="space-y-2">
              {acCoverage.map((item, index) => (
                <div key={item.ac.id} className="border border-zinc-200 rounded-xl overflow-hidden">
                  {/* AC Header */}
                  <div
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-50 ${
                      item.coverageStatus === 'covered' ? 'bg-green-50/50' :
                      item.coverageStatus === 'partial' ? 'bg-yellow-50/50' : 'bg-zinc-50/50'
                    }`}
                    onClick={() => toggleACExpanded(item.ac.id)}
                  >
                    {expandedACs.has(item.ac.id) ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.coverageStatus === 'covered' ? 'bg-green-500 text-white' :
                      item.coverageStatus === 'partial' ? 'bg-yellow-500 text-white' : 'bg-zinc-300 text-zinc-600'
                    }`}>
                      {item.coverageStatus === 'covered' ? '✓' : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-900 truncate">{item.ac.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.total > 0 ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.coverageStatus === 'covered' ? 'bg-green-100 text-green-700' :
                          item.coverageStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {item.passed}/{item.total} 通过
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> 未覆盖
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AC Content (expanded) */}
                  {expandedACs.has(item.ac.id) && (
                    <div className="border-t border-zinc-200 p-3 bg-white">
                      {item.linkedTestCases.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-zinc-400 mb-2">暂无关联用例</p>
                          {isEditMode && linkedTestCases.length > 0 && formState && formActions && (
                            <button
                              onClick={() => setLinkingToACId(item.ac.id)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              + 从已关联用例中选择
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {item.linkedTestCases.map(tc => (
                            <div key={tc.id} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg group">
                              <div
                                className={`flex items-center gap-2 flex-1 min-w-0 ${onViewTestCase ? "cursor-pointer" : ""}`}
                                onClick={() => handleViewClick(tc.id)}
                              >
                                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                <span className={`text-sm text-zinc-700 truncate ${onViewTestCase ? "group-hover:text-blue-600 group-hover:underline" : ""}`}>
                                  {tc.title}
                                </span>
                                {getStatusBadge(tc.status)}
                              </div>
                              <div className="flex items-center gap-1">
                                {onViewTestCase && (
                                  <button onClick={() => handleViewClick(tc.id)} className="p-1 text-zinc-400 hover:text-blue-600" title="查看详情">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {isEditMode && formState && formActions && (
                                  <button
                                    onClick={() => handleUnlinkFromAC(item.ac.id, tc.id)}
                                    className="p-1 text-zinc-400 hover:text-red-500"
                                    title="从此AC移除"
                                  >
                                    <XIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {isEditMode && linkedTestCases.length > item.linkedTestCases.length && formState && formActions && (
                            <button
                              onClick={() => setLinkingToACId(item.ac.id)}
                              className="w-full p-2 text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg border border-dashed border-zinc-300"
                            >
                              + 添加更多用例
                            </button>
                          )}
                        </div>
                      )}

                      {/* AC-level linking dropdown */}
                      {linkingToACId === item.ac.id && formState && formActions && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">选择要关联到此验收标准的用例</span>
                            <button onClick={() => { setLinkingToACId(null); setAcLinkSearchTerm(""); }} className="text-blue-400 hover:text-blue-600">
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="搜索用例..."
                            value={acLinkSearchTerm}
                            onChange={e => setAcLinkSearchTerm(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-blue-200 rounded-lg"
                          />
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {getAvailableForAC(item.ac.id).length === 0 ? (
                              <p className="text-sm text-blue-400 text-center py-2">没有可添加的用例</p>
                            ) : (
                              getAvailableForAC(item.ac.id).map(tc => (
                                <button
                                  key={tc.id}
                                  onClick={() => handleLinkToAC(item.ac.id, tc.id)}
                                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-blue-100 rounded-lg"
                                >
                                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="text-sm text-zinc-700 truncate flex-1">{tc.title}</span>
                                  {getStatusBadge(tc.status)}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned Test Cases Section */}
          {unassignedTestCases.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setUnassignedExpanded(!unassignedExpanded)}
                >
                  {unassignedExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                  <Inbox className="w-4 h-4 text-orange-500" />
                  <h4 className="text-zinc-900 font-medium">
                    未分配到 AC 的用例 ({unassignedTestCases.length})
                  </h4>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    需要分配
                  </span>
                </div>
                {/* AI Auto-link button */}
                {isEditMode && formState && formActions && acceptanceCriteria.length > 0 && (
                  <button
                    onClick={handleAutoLink}
                    disabled={autoLinking}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {autoLinking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {autoLinking ? "分析中..." : "AI 智能分配"}
                  </button>
                )}
              </div>

              {unassignedExpanded && (
                <div className="space-y-1 pl-6">
                  {unassignedTestCases.map(tc => (
                    <div key={tc.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg group">
                      <div
                        className={`flex items-center gap-2 flex-1 min-w-0 ${onViewTestCase ? "cursor-pointer" : ""}`}
                        onClick={() => handleViewClick(tc.id)}
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-400" />
                        <span className={`text-sm text-zinc-700 truncate ${onViewTestCase ? "group-hover:text-blue-600 group-hover:underline" : ""}`}>
                          {tc.title}
                        </span>
                        {getStatusBadge(tc.status)}
                      </div>
                      <div className="flex items-center gap-1">
                        {onViewTestCase && (
                          <button onClick={() => handleViewClick(tc.id)} className="p-1 text-zinc-400 hover:text-blue-600" title="查看详情">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isEditMode && (
                          <button onClick={() => onUnlinkTestCase(tc.id)} className="p-1 text-zinc-400 hover:text-red-500" title="取消关联">
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-orange-600 mt-2">
                    这些用例已关联到需求，但未分配到任何验收标准。请展开上方的 AC 并点击「添加更多用例」分配它们。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

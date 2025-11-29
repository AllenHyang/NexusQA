"use client";

import React, { useState, useMemo } from "react";
import { InternalRequirement, TestCase } from "@/types";
import {
  Grid3X3,
  Download,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  List,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

interface MatrixViewProps {
  requirements: InternalRequirement[];
  matrixData: {
    requirements: InternalRequirement[];
    testCases: TestCase[];
  };
  onExportMatrix: () => void;
  getTestCaseStatusLabel: (status: string) => string;
  PRIORITY_CONFIG: Record<string, { label: string; color: string }>;
  onTestCaseClick?: (testCaseId: string) => void;
}

type ViewMode = "summary" | "risk" | "detailed";
type RiskFilter = "all" | "uncovered" | "failed" | "blocked";

export function MatrixView({
  requirements,
  matrixData,
  onExportMatrix,
  getTestCaseStatusLabel,
  PRIORITY_CONFIG,
  onTestCaseClick,
}: MatrixViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedReqs, setExpandedReqs] = useState<Set<string>>(new Set());
  const [hideEmptyRows, setHideEmptyRows] = useState(true);

  // Calculate aggregated data for each requirement
  const requirementStats = useMemo(() => {
    return requirements.map(req => {
      const testCases = req.testCases || [];
      const total = testCases.length;
      const passed = testCases.filter(tc => tc.status === "PASSED").length;
      const failed = testCases.filter(tc => tc.status === "FAILED").length;
      const blocked = testCases.filter(tc => tc.status === "BLOCKED").length;
      const untested = testCases.filter(tc => tc.status === "UNTESTED").length;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      // Risk level calculation
      let riskLevel: "high" | "medium" | "low" | "none" = "none";
      if (total === 0) riskLevel = "high"; // No coverage
      else if (failed > 0) riskLevel = "high"; // Has failures
      else if (blocked > 0) riskLevel = "medium"; // Has blocked
      else if (untested > 0) riskLevel = "medium"; // Has untested
      else riskLevel = "low"; // All passed

      return {
        req,
        total,
        passed,
        failed,
        blocked,
        untested,
        passRate,
        riskLevel,
      };
    });
  }, [requirements]);

  // Filter requirements based on current filters
  const filteredStats = useMemo(() => {
    return requirementStats.filter(stat => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!stat.req.title.toLowerCase().includes(query) &&
            !stat.req.priority.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Risk filter
      if (riskFilter === "uncovered" && stat.total > 0) return false;
      if (riskFilter === "failed" && stat.failed === 0) return false;
      if (riskFilter === "blocked" && stat.blocked === 0) return false;

      // Hide empty rows filter (for detailed view)
      if (hideEmptyRows && viewMode === "detailed" && stat.total === 0) return false;

      return true;
    });
  }, [requirementStats, searchQuery, riskFilter, hideEmptyRows, viewMode]);

  // Summary statistics (calculated from filtered requirements)
  const summaryStats = useMemo(() => {
    const total = requirements.length;
    const covered = requirements.filter(r => (r.testCases?.length || 0) > 0).length;
    const uncovered = total - covered;
    const withFailures = requirementStats.filter(s => s.failed > 0).length;
    const withBlocked = requirementStats.filter(s => s.blocked > 0).length;
    const allPassed = requirementStats.filter(s => s.total > 0 && s.passed === s.total).length;
    // 进行中：有用例、没有失败、但还没全部通过（包含未测试或阻塞的）
    const inProgress = requirementStats.filter(s => s.total > 0 && s.failed === 0 && s.passed < s.total).length;
    const coverageRate = total > 0 ? (covered / total) * 100 : 0;

    return { total, covered, uncovered, withFailures, withBlocked, allPassed, inProgress, coverageRate };
  }, [requirements, requirementStats]);

  const toggleExpand = (reqId: string) => {
    const newSet = new Set(expandedReqs);
    if (newSet.has(reqId)) {
      newSet.delete(reqId);
    } else {
      newSet.add(reqId);
    }
    setExpandedReqs(newSet);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-zinc-100 text-zinc-500 border-zinc-200";
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "high": return "高风险";
      case "medium": return "中风险";
      case "low": return "低风险";
      default: return "无数据";
    }
  };

  // Empty state
  if (matrixData.testCases.length === 0 && requirements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm mb-6">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" /> 追溯矩阵
          </h3>
        </div>
        <div className="p-12 text-center">
          <Grid3X3 className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <p className="text-zinc-400">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm mb-6">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 bg-zinc-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" /> 追溯矩阵
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {summaryStats.total} 个需求 · {summaryStats.covered} 已覆盖 · {summaryStats.uncovered} 未覆盖
            </p>
          </div>
          <button
            onClick={onExportMatrix}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg hover:bg-zinc-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> 导出
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("summary")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "summary" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> 概览
            </button>
            <button
              onClick={() => setViewMode("risk")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "risk" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> 风险
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "detailed" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <List className="w-3.5 h-3.5" /> 详情
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索需求..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1.5 p-0.5 hover:bg-zinc-100 rounded"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
          </div>

          {/* Risk Filter */}
          {viewMode !== "summary" && (
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
              className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="all">全部</option>
              <option value="uncovered">未覆盖</option>
              <option value="failed">有失败</option>
              <option value="blocked">有阻塞</option>
            </select>
          )}

          {/* Hide Empty Toggle */}
          {viewMode === "detailed" && (
            <button
              onClick={() => setHideEmptyRows(!hideEmptyRows)}
              className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors ${
                hideEmptyRows
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {hideEmptyRows ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {hideEmptyRows ? "隐藏空行" : "显示全部"}
            </button>
          )}
        </div>
      </div>

      {/* Summary View - Dashboard Cards */}
      {viewMode === "summary" && (
        <div className="p-6">
          {/* Coverage Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100">
              <div className="text-2xl font-black text-blue-700">{summaryStats.coverageRate.toFixed(0)}%</div>
              <div className="text-xs text-blue-600 font-medium mt-1">覆盖率</div>
              <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${summaryStats.coverageRate}%` }} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-100">
              <div className="text-2xl font-black text-green-700">{summaryStats.allPassed}</div>
              <div className="text-xs text-green-600 font-medium mt-1">全部通过</div>
              <div className="text-[10px] text-green-500 mt-2">
                {summaryStats.total > 0 ? ((summaryStats.allPassed / summaryStats.total) * 100).toFixed(0) : 0}% 的需求
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-100">
              <div className="text-2xl font-black text-amber-700">{summaryStats.inProgress}</div>
              <div className="text-xs text-amber-600 font-medium mt-1">进行中</div>
              <div className="text-[10px] text-amber-500 mt-2">部分未测试或阻塞</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-100">
              <div className="text-2xl font-black text-orange-700">{summaryStats.withFailures}</div>
              <div className="text-xs text-orange-600 font-medium mt-1">有失败</div>
              <div className="text-[10px] text-orange-500 mt-2">需要关注和修复</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-100">
              <div className="text-2xl font-black text-red-700">{summaryStats.uncovered}</div>
              <div className="text-xs text-red-600 font-medium mt-1">未覆盖</div>
              <div className="text-[10px] text-red-500 mt-2">需要添加测试用例</div>
            </div>
          </div>

          {/* Coverage Breakdown by Priority */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-zinc-700 mb-3">按优先级分布</h4>
            <div className="space-y-2">
              {["P0", "P1", "P2", "P3"].map(priority => {
                const priorityReqs = requirementStats.filter(s => s.req.priority === priority);
                const total = priorityReqs.length;
                const covered = priorityReqs.filter(s => s.total > 0).length;
                const passed = priorityReqs.filter(s => s.total > 0 && s.passed === s.total).length;
                const failed = priorityReqs.filter(s => s.failed > 0).length;

                if (total === 0) return null;

                return (
                  <div key={priority} className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${PRIORITY_CONFIG[priority]?.color || "bg-zinc-400 text-white"}`}>
                      {priority}
                    </span>
                    <div className="flex-1">
                      <div className="flex h-6 rounded-lg overflow-hidden bg-zinc-100">
                        {passed > 0 && (
                          <div
                            className="bg-green-500 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ width: `${(passed / total) * 100}%` }}
                            title={`${passed} 全部通过`}
                          >
                            {passed > 0 && passed}
                          </div>
                        )}
                        {(covered - passed - failed) > 0 && (
                          <div
                            className="bg-blue-400 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ width: `${((covered - passed - failed) / total) * 100}%` }}
                            title={`${covered - passed - failed} 进行中`}
                          />
                        )}
                        {failed > 0 && (
                          <div
                            className="bg-red-500 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ width: `${(failed / total) * 100}%` }}
                            title={`${failed} 有失败`}
                          >
                            {failed > 0 && failed}
                          </div>
                        )}
                        {(total - covered) > 0 && (
                          <div
                            className="bg-zinc-300 flex items-center justify-center text-zinc-600 text-[10px] font-bold"
                            style={{ width: `${((total - covered) / total) * 100}%` }}
                            title={`${total - covered} 未覆盖`}
                          >
                            {(total - covered) > 0 && (total - covered)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 w-12 text-right">{total} 个</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setRiskFilter("uncovered"); setViewMode("risk"); }}
              className="flex-1 p-3 rounded-xl border border-zinc-200 hover:border-red-300 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-2 text-zinc-600 group-hover:text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">查看未覆盖需求</span>
                <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  {summaryStats.uncovered}
                </span>
              </div>
            </button>
            <button
              onClick={() => { setRiskFilter("failed"); setViewMode("risk"); }}
              className="flex-1 p-3 rounded-xl border border-zinc-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="flex items-center gap-2 text-zinc-600 group-hover:text-orange-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">查看失败用例</span>
                <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                  {summaryStats.withFailures}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Risk View - Focus on problems */}
      {viewMode === "risk" && (
        <div className="divide-y divide-zinc-100">
          {filteredStats.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-zinc-500">没有匹配的风险项</p>
              <p className="text-xs text-zinc-400 mt-1">
                {riskFilter === "uncovered" && "所有需求都已关联测试用例"}
                {riskFilter === "failed" && "没有失败的测试用例"}
                {riskFilter === "blocked" && "没有被阻塞的测试用例"}
              </p>
            </div>
          ) : (
            filteredStats.map(stat => (
              <div key={stat.req.id} className="hover:bg-zinc-50 transition-colors">
                <button
                  onClick={() => toggleExpand(stat.req.id)}
                  className="w-full p-4 text-left flex items-center gap-4"
                >
                  {/* Expand Icon */}
                  <div className="flex-shrink-0 text-zinc-400">
                    {stat.total > 0 ? (
                      expandedReqs.has(stat.req.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>

                  {/* Risk Badge */}
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg border flex-shrink-0 ${getRiskColor(stat.riskLevel)}`}>
                    {getRiskLabel(stat.riskLevel)}
                  </span>

                  {/* Priority */}
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex-shrink-0 ${PRIORITY_CONFIG[stat.req.priority]?.color || "bg-zinc-400 text-white"}`}>
                    {stat.req.priority}
                  </span>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 truncate">{stat.req.title}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    {stat.total === 0 ? (
                      <span className="text-red-500 font-medium">未覆盖</span>
                    ) : (
                      <>
                        {stat.passed > 0 && (
                          <span className="text-green-600 font-medium">{stat.passed} 通过</span>
                        )}
                        {stat.failed > 0 && (
                          <span className="text-red-600 font-medium">{stat.failed} 失败</span>
                        )}
                        {stat.blocked > 0 && (
                          <span className="text-yellow-600 font-medium">{stat.blocked} 阻塞</span>
                        )}
                        {stat.untested > 0 && (
                          <span className="text-zinc-500">{stat.untested} 未测</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {stat.total > 0 && (
                    <div className="w-24 flex-shrink-0">
                      <div className="flex h-2 rounded-full overflow-hidden bg-zinc-100">
                        {stat.passed > 0 && (
                          <div className="bg-green-500" style={{ width: `${(stat.passed / stat.total) * 100}%` }} />
                        )}
                        {stat.failed > 0 && (
                          <div className="bg-red-500" style={{ width: `${(stat.failed / stat.total) * 100}%` }} />
                        )}
                        {stat.blocked > 0 && (
                          <div className="bg-yellow-500" style={{ width: `${(stat.blocked / stat.total) * 100}%` }} />
                        )}
                        {stat.untested > 0 && (
                          <div className="bg-zinc-300" style={{ width: `${(stat.untested / stat.total) * 100}%` }} />
                        )}
                      </div>
                    </div>
                  )}
                </button>

                {/* Expanded Test Cases */}
                {expandedReqs.has(stat.req.id) && stat.total > 0 && (
                  <div className="px-4 pb-4 pl-16">
                    <div className="bg-zinc-50 rounded-xl p-3 space-y-1">
                      {stat.req.testCases?.map(tc => (
                        <div
                          key={tc.id}
                          className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white cursor-pointer group transition-colors"
                          onClick={() => onTestCaseClick?.(tc.id)}
                        >
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            tc.status === "PASSED" ? "bg-green-500" :
                            tc.status === "FAILED" ? "bg-red-500" :
                            tc.status === "BLOCKED" ? "bg-yellow-500" :
                            "bg-zinc-300"
                          }`} />
                          <span className="flex-1 text-zinc-700 truncate group-hover:text-zinc-900">{tc.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 flex-shrink-0" />
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                            tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                            tc.status === "BLOCKED" ? "bg-yellow-100 text-yellow-700" :
                            "bg-zinc-100 text-zinc-500"
                          }`}>
                            {getTestCaseStatusLabel(tc.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Detailed View - Compact Matrix with Expandable Rows */}
      {viewMode === "detailed" && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-zinc-50">
              <tr>
                <th className="sticky left-0 z-20 bg-zinc-50 px-4 py-3 text-left font-bold text-zinc-600 border-b border-r border-zinc-200 min-w-[280px]">
                  需求
                </th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[60px]">用例数</th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[60px]">
                  <span className="text-green-600">通过</span>
                </th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[60px]">
                  <span className="text-red-600">失败</span>
                </th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[60px]">
                  <span className="text-yellow-600">阻塞</span>
                </th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[60px]">
                  <span className="text-zinc-500">未测</span>
                </th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[100px]">通过率</th>
                <th className="px-3 py-3 text-center border-b border-zinc-200 min-w-[80px]">风险</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat, idx) => (
                <React.Fragment key={stat.req.id}>
                  {/* Main Row - Clickable */}
                  <tr
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"} ${stat.total > 0 ? "cursor-pointer hover:bg-blue-50/50 transition-colors" : ""}`}
                    onClick={() => stat.total > 0 && toggleExpand(stat.req.id)}
                  >
                    <td className={`sticky left-0 z-10 px-4 py-3 border-r border-zinc-100 ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"} ${stat.total > 0 && expandedReqs.has(stat.req.id) ? "!bg-blue-50" : ""} ${stat.total > 0 ? "group-hover:bg-blue-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        {/* Expand/Collapse Indicator */}
                        {stat.total > 0 ? (
                          <span className="text-zinc-400 flex-shrink-0">
                            {expandedReqs.has(stat.req.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </span>
                        ) : (
                          <span className="w-4 flex-shrink-0" />
                        )}
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex-shrink-0 ${PRIORITY_CONFIG[stat.req.priority]?.color || "bg-zinc-400 text-white"}`}>
                          {stat.req.priority}
                        </span>
                        <span className="font-medium text-zinc-900 truncate" title={stat.req.title}>
                          {stat.req.title}
                        </span>
                        {stat.total > 0 && (
                          <span className="text-[10px] text-zinc-400 ml-auto flex-shrink-0">
                            点击展开
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold">
                      {stat.total || <span className="text-zinc-300">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {stat.passed > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold">
                          {stat.passed}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {stat.failed > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold">
                          {stat.failed}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {stat.blocked > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                          {stat.blocked}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {stat.untested > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 font-bold">
                          {stat.untested}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {stat.total > 0 ? (
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-12 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${stat.passRate === 100 ? "bg-green-500" : stat.passRate > 50 ? "bg-blue-500" : "bg-red-500"}`}
                              style={{ width: `${stat.passRate}%` }}
                            />
                          </div>
                          <span className="text-zinc-600 font-medium">{stat.passRate.toFixed(0)}%</span>
                        </div>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded ${getRiskColor(stat.riskLevel)}`}>
                        {getRiskLabel(stat.riskLevel)}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedReqs.has(stat.req.id) && stat.total > 0 && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={8} className="px-4 py-3 border-b border-blue-100">
                        <div className="ml-6 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                          {/* Test Cases Header */}
                          <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-600">关联测试用例</span>
                            <span className="text-[10px] text-zinc-400">{stat.total} 个用例</span>
                          </div>
                          {/* Test Cases List */}
                          <div className="divide-y divide-zinc-50">
                            {stat.req.testCases?.map((tc, tcIdx) => (
                              <div
                                key={tc.id}
                                className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer group ${tcIdx % 2 === 1 ? "bg-zinc-50/50" : ""} hover:bg-blue-50 transition-colors`}
                                onClick={() => onTestCaseClick?.(tc.id)}
                              >
                                {/* Status Indicator */}
                                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  tc.status === "PASSED" ? "bg-green-500" :
                                  tc.status === "FAILED" ? "bg-red-500" :
                                  tc.status === "BLOCKED" ? "bg-yellow-500" :
                                  "bg-zinc-300"
                                }`} />

                                {/* Test Case Title */}
                                <span className="flex-1 text-sm text-zinc-700 truncate group-hover:text-zinc-900" title={tc.title}>
                                  {tc.title}
                                </span>

                                {/* Link Icon */}
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-blue-500 flex-shrink-0" />

                                {/* Priority */}
                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex-shrink-0 ${PRIORITY_CONFIG[tc.priority]?.color || "bg-zinc-400 text-white"}`}>
                                  {tc.priority}
                                </span>

                                {/* Status Badge */}
                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded flex-shrink-0 ${
                                  tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                                  tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                                  tc.status === "BLOCKED" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-zinc-100 text-zinc-500"
                                }`}>
                                  {getTestCaseStatusLabel(tc.status)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filteredStats.length === 0 && (
            <div className="p-12 text-center">
              <Filter className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">没有匹配的需求</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Legend */}
      <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium text-zinc-500">图例:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-zinc-600">通过</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-zinc-600">失败</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-zinc-600">阻塞</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-zinc-300" />
            <span className="text-zinc-600">未测</span>
          </div>
        </div>
        <span className="text-zinc-400">
          显示 {filteredStats.length} / {requirements.length} 个需求
        </span>
      </div>
    </div>
  );
}

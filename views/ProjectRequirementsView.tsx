import React, { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { InternalRequirement, Project, User, RequirementStatus, AcceptanceStatus, TestCase } from "@/types";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Link2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  TrendingUp,
  Layers,
  Eye,
  List,
  ArrowRight,
  X,
  Grid3X3,
  Download,
  Table,
} from "lucide-react";
import { RequirementModal } from "@/components/RequirementModal";

interface ProjectRequirementsViewProps {
  project: Project;
  currentUser: User;
}

const STATUS_CONFIG: Record<RequirementStatus, { label: string; labelZh: string; color: string; bgColor: string; icon: React.ElementType }> = {
  DRAFT: { label: "Draft", labelZh: "草稿", color: "text-zinc-500", bgColor: "bg-zinc-100", icon: FileText },
  PENDING_REVIEW: { label: "Pending Review", labelZh: "待评审", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock },
  APPROVED: { label: "Approved", labelZh: "已批准", color: "text-blue-700", bgColor: "bg-blue-100", icon: CheckCircle2 },
  IN_PROGRESS: { label: "In Progress", labelZh: "进行中", color: "text-orange-700", bgColor: "bg-orange-100", icon: AlertCircle },
  COMPLETED: { label: "Completed", labelZh: "已完成", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle2 },
};

const ACCEPTANCE_STATUS_CONFIG: Record<AcceptanceStatus, { label: string; labelZh: string; color: string }> = {
  PENDING: { label: "Pending", labelZh: "待验收", color: "bg-zinc-100 text-zinc-600" },
  ACCEPTED: { label: "Accepted", labelZh: "已通过", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", labelZh: "已拒绝", color: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  P0: { label: "P0", color: "bg-red-500 text-white" },
  P1: { label: "P1", color: "bg-orange-500 text-white" },
  P2: { label: "P2", color: "bg-blue-500 text-white" },
  P3: { label: "P3", color: "bg-zinc-400 text-white" },
};

const PAGE_SIZE = 10;

export function ProjectRequirementsView({ project, currentUser }: ProjectRequirementsViewProps) {
  const {
    requirements,
    loadRequirements,
    requirementsLoading,
    bulkDeleteRequirements,
    loadRequirement,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<InternalRequirement | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("ALL");
  const [selectedAcceptanceFilter, setSelectedAcceptanceFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "traceability" | "matrix">("list");
  const [selectedTraceRequirement, setSelectedTraceRequirement] = useState<InternalRequirement | null>(null);

  useEffect(() => {
    loadRequirements(project.id);
  }, [project.id, loadRequirements]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!requirements) return { total: 0, completed: 0, inProgress: 0, draft: 0, uncovered: 0, coverageRate: 0, passRate: 0 };
    const total = requirements.length;
    const completed = requirements.filter(r => r.status === "COMPLETED").length;
    const inProgress = requirements.filter(r => r.status === "IN_PROGRESS").length;
    const draft = requirements.filter(r => r.status === "DRAFT").length;
    const uncovered = requirements.filter(r => !r.testCases || r.testCases.length === 0).length;

    // Coverage: requirements with at least one test case
    const covered = requirements.filter(r => r.testCases && r.testCases.length > 0).length;
    const coverageRate = total > 0 ? (covered / total) * 100 : 0;

    // Pass rate: based on test case execution status
    let totalTestCases = 0;
    let passedTestCases = 0;
    requirements.forEach(r => {
      if (r.testCases) {
        r.testCases.forEach(tc => {
          totalTestCases++;
          if (tc.status === "PASSED") passedTestCases++;
        });
      }
    });
    const passRate = totalTestCases > 0 ? (passedTestCases / totalTestCases) * 100 : 0;

    return { total, completed, inProgress, draft, uncovered, coverageRate, passRate };
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    if (!requirements) return [];
    return requirements.filter(req => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.description && req.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatusFilter === "ALL" || req.status === selectedStatusFilter;
      const matchesPriority = selectedPriorityFilter === "ALL" || req.priority === selectedPriorityFilter;
      const matchesAcceptance = selectedAcceptanceFilter === "ALL" || req.acceptanceStatus === selectedAcceptanceFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAcceptance;
    });
  }, [requirements, searchQuery, selectedStatusFilter, selectedPriorityFilter, selectedAcceptanceFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRequirements.length / PAGE_SIZE);
  const paginatedRequirements = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequirements.slice(start, start + PAGE_SIZE);
  }, [filteredRequirements, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter, selectedPriorityFilter, selectedAcceptanceFilter]);

  const handleCreate = () => {
    setEditingRequirement(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (req: InternalRequirement) => {
    setEditingRequirement(req);
    setIsModalOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.length} 个需求吗？`)) {
      await bulkDeleteRequirements(selectedIds);
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedRequirements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRequirements.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const parseTags = (tagsStr: string): string[] => {
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  };

  const handleViewTrace = async (req: InternalRequirement) => {
    // Load full requirement data with test cases
    const fullReq = await loadRequirement(req.id);
    if (fullReq) {
      setSelectedTraceRequirement(fullReq);
      setViewMode("traceability");
    }
  };

  const getTestCaseStatusColor = (status: string) => {
    switch (status) {
      case "PASSED": return "bg-green-100 text-green-700 border-green-200";
      case "FAILED": return "bg-red-100 text-red-700 border-red-200";
      case "BLOCKED": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  const getTestCaseStatusLabel = (status: string) => {
    switch (status) {
      case "PASSED": return "通过";
      case "FAILED": return "失败";
      case "BLOCKED": return "阻塞";
      case "UNTESTED": return "未测试";
      default: return status;
    }
  };

  // Progress bar component
  const ProgressBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  // Build traceability matrix data
  const matrixData = useMemo(() => {
    // Collect all unique test cases across all requirements
    const allTestCases: TestCase[] = [];
    const testCaseMap = new Map<string, TestCase>();

    if (!requirements) return { requirements: [], testCases: allTestCases };

    requirements.forEach(req => {
      if (req.testCases) {
        req.testCases.forEach(tc => {
          if (!testCaseMap.has(tc.id)) {
            testCaseMap.set(tc.id, tc);
            allTestCases.push(tc);
          }
        });
      }
    });

    return { requirements, testCases: allTestCases };
  }, [requirements]);

  // Export traceability report as CSV
  const handleExportCSV = () => {
    const headers = ['需求ID', '需求标题', '优先级', '状态', '验收状态', '关联用例数', '覆盖率', '通过率', '关联用例'];

    const rows = requirements.map(req => {
      const testCases = req.testCases || [];
      const passedCount = testCases.filter(tc => tc.status === 'PASSED').length;
      const coverageRate = stats.total > 0 ? (testCases.length > 0 ? '已覆盖' : '未覆盖') : '-';
      const passRate = testCases.length > 0 ? `${((passedCount / testCases.length) * 100).toFixed(0)}%` : '-';

      return [
        req.id.slice(0, 8),
        `"${req.title.replace(/"/g, '""')}"`,
        req.priority,
        STATUS_CONFIG[req.status]?.labelZh || req.status,
        ACCEPTANCE_STATUS_CONFIG[req.acceptanceStatus]?.labelZh || req.acceptanceStatus,
        testCases.length.toString(),
        coverageRate,
        passRate,
        `"${testCases.map(tc => tc.title).join('; ').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name}-追溯报告-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export detailed traceability matrix
  const handleExportMatrix = () => {
    const { testCases } = matrixData;

    // Header row: empty cell + all test case titles
    const headers = ['需求 \\ 用例', ...testCases.map(tc => tc.title)];

    // Data rows: requirement title + coverage markers
    const rows = requirements.map(req => {
      const linkedIds = new Set(req.testCases?.map(tc => tc.id) || []);
      const cells = testCases.map(tc => {
        if (linkedIds.has(tc.id)) {
          const linkedTc = req.testCases?.find(t => t.id === tc.id);
          return linkedTc?.status === 'PASSED' ? '✓ 通过' :
                 linkedTc?.status === 'FAILED' ? '✗ 失败' :
                 linkedTc?.status === 'BLOCKED' ? '⚠ 阻塞' : '○ 关联';
        }
        return '';
      });
      return [`"${req.title.replace(/"/g, '""')}"`, ...cells.map(c => `"${c}"`)].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name}-追溯矩阵-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className={`p-8 pb-24 relative flex-1 overflow-y-auto ${viewMode === "matrix" ? "overflow-x-auto" : "max-w-7xl mx-auto"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">需求管理</h2>
          <p className="text-zinc-500">管理 {project.name} 的需求和验收标准</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-zinc-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <List className="w-3.5 h-3.5" /> 列表
            </button>
            <button
              onClick={() => setViewMode("traceability")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "traceability" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 追溯
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "matrix" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" /> 矩阵
            </button>
          </div>
          {/* Export Button */}
          <div className="relative group">
            <button className="px-3 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5 text-xs font-bold">
              <Download className="w-3.5 h-3.5" /> 导出
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 hidden group-hover:block">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" /> 追溯报告
              </button>
              <button
                onClick={handleExportMatrix}
                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 flex items-center gap-2"
              >
                <Table className="w-3.5 h-3.5" /> 追溯矩阵
              </button>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> 新建需求
          </button>
        </div>
      </div>

      {/* Statistics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-zinc-100 rounded-lg">
              <FileText className="w-4 h-4 text-zinc-600" />
            </div>
            <span className="text-xs font-medium text-zinc-500">总需求</span>
          </div>
          <div className="text-2xl font-black text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-medium text-zinc-500">已完成</span>
          </div>
          <div className="text-2xl font-black text-green-600">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-zinc-500">进行中</span>
          </div>
          <div className="text-2xl font-black text-orange-600">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-zinc-100 rounded-lg">
              <Clock className="w-4 h-4 text-zinc-500" />
            </div>
            <span className="text-xs font-medium text-zinc-500">草稿</span>
          </div>
          <div className="text-2xl font-black text-zinc-500">{stats.draft}</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs font-medium text-zinc-500">未覆盖</span>
          </div>
          <div className="text-2xl font-black text-red-500">{stats.uncovered}</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-zinc-700">覆盖率</span>
            </div>
            <span className="text-sm font-black text-blue-600">{stats.coverageRate.toFixed(0)}%</span>
          </div>
          <ProgressBar value={stats.coverageRate} color="bg-blue-500" />
          <p className="text-xs text-zinc-400 mt-2">已关联测试用例的需求占比</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-zinc-700">通过率</span>
            </div>
            <span className="text-sm font-black text-green-600">{stats.passRate.toFixed(0)}%</span>
          </div>
          <ProgressBar value={stats.passRate} color="bg-green-500" />
          <p className="text-xs text-zinc-400 mt-2">关联测试用例中通过的占比</p>
        </div>
      </div>

      {/* Traceability View */}
      {viewMode === "traceability" && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 需求追溯视图
            </h3>
            <p className="text-xs text-zinc-500 mt-1">查看需求到测试用例的完整追溯链路</p>
          </div>

          {selectedTraceRequirement ? (
            <div className="p-6">
              {/* Selected Requirement Detail */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${PRIORITY_CONFIG[selectedTraceRequirement.priority]?.color || "bg-zinc-400 text-white"}`}>
                      {selectedTraceRequirement.priority}
                    </span>
                    <h4 className="font-bold text-lg text-zinc-900">{selectedTraceRequirement.title}</h4>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_CONFIG[selectedTraceRequirement.status]?.bgColor} ${STATUS_CONFIG[selectedTraceRequirement.status]?.color}`}>
                      {STATUS_CONFIG[selectedTraceRequirement.status]?.labelZh}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTraceRequirement(null)}
                    className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedTraceRequirement.description && (
                  <p className="text-sm text-zinc-600 mb-4">{selectedTraceRequirement.description}</p>
                )}
              </div>

              {/* Traceability Flow */}
              <div className="relative">
                {/* Connection Lines Background */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-200" />

                {/* Requirement Node */}
                <div className="relative flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center z-10">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-xs font-bold text-blue-600 uppercase mb-1">需求</div>
                    <div className="font-bold text-zinc-900">{selectedTraceRequirement.title}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      <span>验收标准: {(() => {
                        try {
                          return JSON.parse(selectedTraceRequirement.acceptanceCriteria || "[]").length;
                        } catch { return 0; }
                      })()} 条</span>
                      <span>关联用例: {selectedTraceRequirement.testCases?.length || 0} 个</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="relative flex items-center gap-4 mb-6 ml-4">
                  <ArrowRight className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs text-zinc-400">关联的测试用例</span>
                </div>

                {/* Test Cases */}
                {selectedTraceRequirement.testCases && selectedTraceRequirement.testCases.length > 0 ? (
                  <div className="space-y-3 ml-8">
                    {selectedTraceRequirement.testCases.map((tc: TestCase) => (
                      <div key={tc.id} className="relative flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center z-10">
                          <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-4 border border-zinc-200 hover:border-zinc-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-zinc-400 uppercase mb-1">测试用例</div>
                              <div className="font-medium text-zinc-900">{tc.title}</div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getTestCaseStatusColor(tc.status)}`}>
                              {getTestCaseStatusLabel(tc.status)}
                            </span>
                          </div>
                          {tc.description && (
                            <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{tc.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
                            <span>优先级: {tc.priority}</span>
                            {tc.assignedToId && <span>已分配</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-8 p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-center">
                    <Link2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">暂无关联的测试用例</p>
                    <button
                      onClick={() => handleEdit(selectedTraceRequirement)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      去关联用例 →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* List Header */}
              <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <div className="w-12">优先级</div>
                <div className="flex-1">需求</div>
                <div className="w-24">状态</div>
                <div className="w-24">关联用例</div>
                <div className="w-24">覆盖情况</div>
              </div>

              {/* Requirements List */}
              {requirements.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>暂无需求</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {requirements.map(req => {
                    const statusConfig = STATUS_CONFIG[req.status];
                    const priorityConfig = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.P2;
                    const testCaseCount = req.testCases?.length || 0;
                    const passedCount = req.testCases?.filter(tc => tc.status === 'PASSED').length || 0;
                    const failedCount = req.testCases?.filter(tc => tc.status === 'FAILED').length || 0;

                    return (
                      <button
                        key={req.id}
                        onClick={() => handleViewTrace(req)}
                        className="w-full p-4 hover:bg-zinc-50 transition-colors flex items-center gap-4 text-left"
                      >
                        {/* Priority */}
                        <div className="w-12 flex-shrink-0">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-zinc-800 text-sm truncate">{req.title}</div>
                          {req.description && (
                            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{req.description}</p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="w-24 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.labelZh}
                          </span>
                        </div>

                        {/* Test Case Count */}
                        <div className="w-24 flex-shrink-0 text-xs">
                          <div className="flex items-center gap-1 text-zinc-500">
                            <Link2 className="w-3 h-3" />
                            <span>{testCaseCount} 用例</span>
                          </div>
                        </div>

                        {/* Coverage Info */}
                        <div className="w-24 flex-shrink-0">
                          {testCaseCount > 0 ? (
                            <div className="flex items-center gap-2 text-xs">
                              {passedCount > 0 && (
                                <span className="text-green-600 font-medium">{passedCount} 通过</span>
                              )}
                              {failedCount > 0 && (
                                <span className="text-red-600 font-medium">{failedCount} 失败</span>
                              )}
                              {passedCount === 0 && failedCount === 0 && (
                                <span className="text-zinc-400">未执行</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-red-500 font-medium">未覆盖</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Matrix View */}
      {viewMode === "matrix" && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm mb-6 min-w-fit">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between sticky left-0">
            <div>
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" /> 追溯矩阵
              </h3>
              <p className="text-xs text-zinc-500 mt-1">需求与测试用例的完整关联矩阵</p>
            </div>
            <button
              onClick={handleExportMatrix}
              className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-lg hover:bg-zinc-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> 导出矩阵
            </button>
          </div>

          {matrixData.testCases.length === 0 ? (
            <div className="p-12 text-center">
              <Grid3X3 className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400">暂无关联的测试用例</p>
              <p className="text-xs text-zinc-400 mt-1">请先在需求中关联测试用例</p>
            </div>
          ) : (
            <div className="overflow-visible">
              <table className="w-full text-xs table-auto">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="sticky left-0 bg-zinc-50 px-4 py-3 text-left font-bold text-zinc-600 border-b border-r border-zinc-200 min-w-[200px]">
                      需求 \ 用例
                    </th>
                    {matrixData.testCases.map(tc => (
                      <th key={tc.id} className="px-3 py-3 text-center font-medium text-zinc-600 border-b border-zinc-200 min-w-[100px] max-w-[150px]">
                        <div className="truncate" title={tc.title}>{tc.title}</div>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] ${
                          tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                          tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                          tc.status === "BLOCKED" ? "bg-yellow-100 text-yellow-700" :
                          "bg-zinc-100 text-zinc-500"
                        }`}>
                          {getTestCaseStatusLabel(tc.status)}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-bold text-zinc-600 border-b border-l border-zinc-200 min-w-[80px]">
                      覆盖
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req, rowIndex) => {
                    const linkedIds = new Set(req.testCases?.map(tc => tc.id) || []);
                    const linkedCount = linkedIds.size;
                    const passedCount = req.testCases?.filter(tc => tc.status === 'PASSED').length || 0;

                    return (
                      <tr key={req.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                        <td className="sticky left-0 bg-inherit px-4 py-3 border-r border-zinc-100">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${PRIORITY_CONFIG[req.priority]?.color || "bg-zinc-400 text-white"}`}>
                              {req.priority}
                            </span>
                            <span className="font-medium text-zinc-900 truncate max-w-[150px]" title={req.title}>
                              {req.title}
                            </span>
                          </div>
                        </td>
                        {matrixData.testCases.map(tc => {
                          const isLinked = linkedIds.has(tc.id);
                          const linkedTc = req.testCases?.find(t => t.id === tc.id);

                          return (
                            <td key={tc.id} className="px-3 py-3 text-center border-zinc-100">
                              {isLinked ? (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                  linkedTc?.status === 'PASSED' ? 'bg-green-100 text-green-600' :
                                  linkedTc?.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                                  linkedTc?.status === 'BLOCKED' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {linkedTc?.status === 'PASSED' ? '✓' :
                                   linkedTc?.status === 'FAILED' ? '✗' :
                                   linkedTc?.status === 'BLOCKED' ? '!' : '○'}
                                </span>
                              ) : (
                                <span className="text-zinc-200">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center border-l border-zinc-100">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold ${linkedCount > 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                              {linkedCount}/{matrixData.testCases.length}
                            </span>
                            {linkedCount > 0 && (
                              <span className="text-[10px] text-zinc-400">
                                {passedCount}/{linkedCount} 通过
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-100 font-bold">
                    <td className="sticky left-0 bg-zinc-100 px-4 py-3 border-t border-r border-zinc-200">
                      总计
                    </td>
                    {matrixData.testCases.map(tc => {
                      const linkedReqs = requirements.filter(req =>
                        req.testCases?.some(t => t.id === tc.id)
                      ).length;
                      return (
                        <td key={tc.id} className="px-3 py-3 text-center border-t border-zinc-200">
                          <span className={linkedReqs > 0 ? 'text-zinc-700' : 'text-zinc-400'}>
                            {linkedReqs}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center border-t border-l border-zinc-200">
                      <span className="text-zinc-700">
                        {stats.coverageRate.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Matrix Legend */}
          <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center gap-6 text-xs sticky left-0">
            <span className="font-medium text-zinc-500">图例：</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-[10px]">✓</span>
              <span className="text-zinc-600">通过</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px]">✗</span>
              <span className="text-zinc-600">失败</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-[10px]">!</span>
              <span className="text-zinc-600">阻塞</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px]">○</span>
              <span className="text-zinc-600">未测试</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-300">-</span>
              <span className="text-zinc-600">未关联</span>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-100 flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                placeholder="搜索需求..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
            >
              <option value="ALL">所有状态</option>
              {Object.entries(STATUS_CONFIG).map(([key, { labelZh }]) => (
                <option key={key} value={key}>{labelZh}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
            >
              <option value="ALL">所有优先级</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
              value={selectedAcceptanceFilter}
              onChange={e => setSelectedAcceptanceFilter(e.target.value)}
            >
              <option value="ALL">所有验收状态</option>
              {Object.entries(ACCEPTANCE_STATUS_CONFIG).map(([key, { labelZh }]) => (
                <option key={key} value={key}>{labelZh}</option>
              ))}
            </select>
          </div>

          {/* List Header */}
          {paginatedRequirements.length > 0 && (
            <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <div className="w-6 flex justify-center">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer"
                  checked={selectedIds.length === paginatedRequirements.length && paginatedRequirements.length > 0}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="w-12">优先级</div>
              <div className="flex-1">需求</div>
              <div className="w-24">状态</div>
              <div className="w-20">覆盖</div>
              <div className="w-16">验收</div>
              <div className="w-10"></div>
            </div>
          )}

          {/* Requirements List */}
          {requirementsLoading ? (
            <div className="p-12 text-center text-zinc-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
            </div>
          ) : paginatedRequirements.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{!requirements || requirements.length === 0 ? "暂无需求，点击上方按钮创建" : "没有匹配的需求"}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {paginatedRequirements.map((req) => {
                const statusConfig = STATUS_CONFIG[req.status];
                const acceptanceConfig = ACCEPTANCE_STATUS_CONFIG[req.acceptanceStatus];
                const priorityConfig = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.P2;
                const tags = parseTags(req.tags);
                const testCaseCount = req.testCases?.length || 0;

                return (
                  <div
                    key={req.id}
                    className={`p-4 hover:bg-zinc-50 transition-colors flex items-center gap-4 ${selectedIds.includes(req.id) ? 'bg-blue-50/30' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className="w-6 flex justify-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer"
                        checked={selectedIds.includes(req.id)}
                        onChange={() => toggleSelect(req.id)}
                      />
                    </div>

                    {/* Priority */}
                    <div className="w-12 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="flex-1 cursor-pointer" onClick={() => handleEdit(req)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-zinc-800 text-sm">{req.title}</span>
                      </div>
                      {req.description && (
                        <p className="text-xs text-zinc-500 line-clamp-1">{req.description}</p>
                      )}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-zinc-100 text-zinc-600 rounded font-medium">
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-[10px] text-zinc-400">+{tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-24 flex-shrink-0" onClick={() => handleEdit(req)}>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.labelZh}
                      </span>
                    </div>

                    {/* Coverage */}
                    <div className="w-20 flex-shrink-0 text-xs text-zinc-500" onClick={() => handleEdit(req)}>
                      <div className="flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        <span>{testCaseCount} 用例</span>
                      </div>
                    </div>

                    {/* Acceptance */}
                    <div className="w-16 flex-shrink-0" onClick={() => handleEdit(req)}>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${acceptanceConfig.color}`}>
                        {acceptanceConfig.labelZh}
                      </span>
                    </div>

                    {/* Trace Action */}
                    <div className="w-10 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTrace(req);
                        }}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                        title="查看追溯"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredRequirements.length > 0 && (
            <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="text-sm text-zinc-500">
                显示 {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredRequirements.length)} 共 {filteredRequirements.length} 条
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-zinc-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-zinc-900 text-white"
                        : "hover:bg-white border border-zinc-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-zinc-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in w-max max-w-[90vw] border border-zinc-200 bg-white">
          <div className="flex items-center gap-3 pr-6 border-r border-zinc-100">
            <div className="bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{selectedIds.length}</div>
            <span className="font-bold text-zinc-700 text-sm">已选择</span>
            <button onClick={() => setSelectedIds([])} className="text-xs text-zinc-400 hover:text-zinc-800 underline ml-1 font-medium">取消</button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 删除
            </button>
          </div>
        </div>
      )}

      {/* Requirement Modal */}
      {isModalOpen && (
        <RequirementModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRequirement(undefined);
          }}
          requirement={editingRequirement}
          projectId={project.id}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

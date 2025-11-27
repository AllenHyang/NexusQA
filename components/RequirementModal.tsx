import React, { useState, useEffect, useMemo } from "react";
import {
  InternalRequirement,
  RequirementStatus,
  AcceptanceCriteria,
  BusinessRule,
  DesignReference,
  RelatedRequirement,
  UserStory,
  User
} from "@/types";
import {
  XCircle,
  Save,
  Plus,
  Trash2,
  Link2,
  CheckCircle2,
  XCircle as XIcon,
  FileText,
  AlertCircle,
  Edit3,
  Eye,
  Clock,
  User as UserIcon,
  Activity,
  BarChart3,
  BookOpen,
  Users,
  Palette,
  GitBranch,
  Calendar,
  ExternalLink,
  Image,
  Figma,
  Link as LinkIcon,
  Code2,
  Target,
  Layers,
  Sparkles,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: InternalRequirement;
  projectId: string;
  currentUser: User;
}

const STATUS_OPTIONS: { value: RequirementStatus; label: string }[] = [
  { value: "DRAFT", label: "草稿" },
  { value: "PENDING_REVIEW", label: "待评审" },
  { value: "APPROVED", label: "已批准" },
  { value: "IN_PROGRESS", label: "进行中" },
  { value: "COMPLETED", label: "已完成" },
];

const PRIORITY_OPTIONS = [
  { value: "P0", label: "P0 - 紧急" },
  { value: "P1", label: "P1 - 高" },
  { value: "P2", label: "P2 - 中" },
  { value: "P3", label: "P3 - 低" },
];

const TARGET_USER_OPTIONS = [
  { value: "ADMIN", label: "管理员", icon: "👑" },
  { value: "PM", label: "产品经理", icon: "📋" },
  { value: "QA_LEAD", label: "测试负责人", icon: "🎯" },
  { value: "TESTER", label: "测试工程师", icon: "🧪" },
  { value: "DEVELOPER", label: "开发工程师", icon: "💻" },
];

const DESIGN_TYPE_OPTIONS = [
  { value: "image", label: "图片", icon: Image },
  { value: "link", label: "链接", icon: LinkIcon },
  { value: "figma", label: "Figma", icon: Figma },
];

const RELATION_TYPE_OPTIONS = [
  { value: "depends_on", label: "依赖于" },
  { value: "blocks", label: "阻塞" },
  { value: "related_to", label: "关联" },
];

type TabType = "BASIC" | "USER_STORY" | "DESIGN" | "ACCEPTANCE_CRITERIA" | "TEST_CASES" | "ACCEPTANCE";

export function RequirementModal({
  isOpen,
  onClose,
  requirement,
  projectId,
  currentUser
}: RequirementModalProps) {
  const {
    saveRequirement,
    testCases,
    linkTestCases,
    unlinkTestCase,
    acceptRequirement,
    rejectRequirement,
    loadRequirement,
    requirements
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>("BASIC");
  const [isEditMode, setIsEditMode] = useState(false);

  // Basic Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RequirementStatus>("DRAFT");
  const [priority, setPriority] = useState("P2");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // User Stories & Context State
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [targetUsers, setTargetUsers] = useState<string[]>([]);
  const [preconditions, setPreconditions] = useState("");

  // Planning State
  const [targetVersion, setTargetVersion] = useState("");
  const [estimatedEffort, setEstimatedEffort] = useState("");
  const [ownerId, setOwnerId] = useState("");

  // Business Rules State
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);

  // Design References State
  const [designReferences, setDesignReferences] = useState<DesignReference[]>([]);

  // Related Requirements State
  const [relatedRequirements, setRelatedRequirements] = useState<RelatedRequirement[]>([]);

  // Acceptance Criteria State
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriteria[]>([]);

  // Test Case Linking State
  const [showTestCaseSelector, setShowTestCaseSelector] = useState(false);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);

  // Memoize linked test cases to avoid dependency issues
  const linkedTestCases = useMemo(() => {
    return requirement?.testCases || [];
  }, [requirement?.testCases]);

  // Acceptance State
  const [acceptanceNotes, setAcceptanceNotes] = useState("");

  // AI Generation State
  const [aiGenerating, setAiGenerating] = useState<string | null>(null); // which field is generating
  const [aiError, setAiError] = useState<string | null>(null);
  const [showTestCaseSuggestions, setShowTestCaseSuggestions] = useState(false);
  const [testCaseSuggestions, setTestCaseSuggestions] = useState<{title: string; description: string; priority: string}[]>([]);

  // Other requirements in the same project (for relation linking)
  const otherRequirements = useMemo(() => {
    return requirements.filter(r => r.projectId === projectId && r.id !== requirement?.id);
  }, [requirements, projectId, requirement?.id]);

  useEffect(() => {
    if (requirement) {
      setTitle(requirement.title);
      setDescription(requirement.description || "");
      setStatus(requirement.status);
      setPriority(requirement.priority);

      // Parse JSON fields
      try { setTags(JSON.parse(requirement.tags)); } catch { setTags([]); }
      try { setAcceptanceCriteria(JSON.parse(requirement.acceptanceCriteria)); } catch { setAcceptanceCriteria([]); }
      try { setTargetUsers(JSON.parse(requirement.targetUsers)); } catch { setTargetUsers([]); }
      try { setBusinessRules(JSON.parse(requirement.businessRules)); } catch { setBusinessRules([]); }
      try { setDesignReferences(JSON.parse(requirement.designReferences)); } catch { setDesignReferences([]); }
      try { setRelatedRequirements(JSON.parse(requirement.relatedRequirements)); } catch { setRelatedRequirements([]); }
      try { setUserStories(JSON.parse(requirement.userStories)); } catch { setUserStories([]); }

      // Simple fields
      setPreconditions(requirement.preconditions || "");
      setTargetVersion(requirement.targetVersion || "");
      setEstimatedEffort(requirement.estimatedEffort || "");
      setOwnerId(requirement.ownerId || "");

      // Load full requirement data
      loadRequirement(requirement.id);
      setIsEditMode(false);
    } else {
      // Reset for new
      setTitle("");
      setDescription("");
      setStatus("DRAFT");
      setPriority("P2");
      setTags([]);
      setAcceptanceCriteria([]);
      setUserStories([]);
      setTargetUsers([]);
      setPreconditions("");
      setTargetVersion("");
      setEstimatedEffort("");
      setOwnerId("");
      setBusinessRules([]);
      setDesignReferences([]);
      setRelatedRequirements([]);
      setActiveTab("BASIC");
      setIsEditMode(true);
    }
    setAcceptanceNotes("");
  }, [requirement, isOpen, loadRequirement]);

  // Available test cases (from same project, not linked)
  const availableTestCases = useMemo(() => {
    const linkedIds = linkedTestCases.map(tc => tc.id);
    return testCases.filter(tc =>
      tc.projectId === projectId && !linkedIds.includes(tc.id)
    );
  }, [testCases, projectId, linkedTestCases]);

  // Calculate test execution stats
  const testStats = useMemo(() => {
    const total = linkedTestCases.length;
    const executed = linkedTestCases.filter(tc => tc.status !== 'UNTESTED').length;
    const passed = linkedTestCases.filter(tc => tc.status === 'PASSED').length;
    const failed = linkedTestCases.filter(tc => tc.status === 'FAILED').length;
    const blocked = linkedTestCases.filter(tc => tc.status === 'BLOCKED').length;

    const executionProgress = total > 0 ? (executed / total) * 100 : 0;
    const passRate = (passed + failed) > 0 ? (passed / (passed + failed)) * 100 : 0;

    return { total, executed, passed, failed, blocked, executionProgress, passRate };
  }, [linkedTestCases]);

  // Map AC to linked test cases (for coverage display)
  const acCoverage = useMemo(() => {
    return acceptanceCriteria.map(ac => {
      const linkedToAC = linkedTestCases.filter(tc =>
        ac.testCaseIds?.includes(tc.id)
      );
      const passed = linkedToAC.filter(tc => tc.status === 'PASSED').length;
      const failed = linkedToAC.filter(tc => tc.status === 'FAILED').length;
      const total = linkedToAC.length;

      let coverageStatus: 'covered' | 'partial' | 'uncovered' = 'uncovered';
      if (total > 0) {
        if (passed === total) {
          coverageStatus = 'covered';
        } else if (passed > 0 || failed > 0) {
          coverageStatus = 'partial';
        }
      }

      return { ac, linkedTestCases: linkedToAC, coverageStatus, passed, failed, total };
    });
  }, [acceptanceCriteria, linkedTestCases]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const data: Partial<InternalRequirement> = {
      id: requirement?.id,
      title,
      description,
      status,
      priority,
      tags: JSON.stringify(tags),
      acceptanceCriteria: JSON.stringify(acceptanceCriteria),
      userStories: JSON.stringify(userStories),
      targetUsers: JSON.stringify(targetUsers),
      preconditions: preconditions || null,
      targetVersion: targetVersion || null,
      estimatedEffort: estimatedEffort || null,
      ownerId: ownerId || null,
      businessRules: JSON.stringify(businessRules),
      designReferences: JSON.stringify(designReferences),
      relatedRequirements: JSON.stringify(relatedRequirements),
      projectId,
      authorId: requirement?.authorId || currentUser.id
    };

    await saveRequirement(data);
    onClose();
  };

  // Tag handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Business Rule handlers
  const handleAddBusinessRule = () => {
    const newRule: BusinessRule = {
      id: `br-${Date.now()}`,
      code: `BR-${String(businessRules.length + 1).padStart(3, '0')}`,
      description: ""
    };
    setBusinessRules([...businessRules, newRule]);
  };

  const handleUpdateBusinessRule = (index: number, field: keyof BusinessRule, value: string) => {
    const updated = [...businessRules];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessRules(updated);
  };

  const handleRemoveBusinessRule = (index: number) => {
    setBusinessRules(businessRules.filter((_, i) => i !== index));
  };

  // Design Reference handlers
  const handleAddDesignReference = () => {
    const newRef: DesignReference = {
      id: `dr-${Date.now()}`,
      type: "link",
      url: "",
      title: ""
    };
    setDesignReferences([...designReferences, newRef]);
  };

  const handleUpdateDesignReference = (index: number, field: keyof DesignReference, value: string) => {
    const updated = [...designReferences];
    updated[index] = { ...updated[index], [field]: value };
    setDesignReferences(updated);
  };

  const handleRemoveDesignReference = (index: number) => {
    setDesignReferences(designReferences.filter((_, i) => i !== index));
  };

  // Related Requirement handlers
  const handleAddRelatedRequirement = (reqId: string, type: RelatedRequirement['type']) => {
    if (relatedRequirements.some(r => r.id === reqId)) return;
    setRelatedRequirements([...relatedRequirements, { id: reqId, type }]);
  };

  const handleRemoveRelatedRequirement = (reqId: string) => {
    setRelatedRequirements(relatedRequirements.filter(r => r.id !== reqId));
  };

  // Acceptance Criteria handlers
  const handleAddAC = () => {
    const newAC: AcceptanceCriteria = {
      id: `ac-${Date.now()}`,
      description: "",
      testCaseIds: [],
      status: "PENDING"
    };
    setAcceptanceCriteria([...acceptanceCriteria, newAC]);
  };

  const handleUpdateAC = (index: number, field: keyof AcceptanceCriteria, value: string) => {
    const updated = [...acceptanceCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setAcceptanceCriteria(updated);
  };

  const handleRemoveAC = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  // Test Case handlers
  const handleLinkTestCases = async () => {
    if (!requirement || selectedTestCaseIds.length === 0) return;
    await linkTestCases(requirement.id, selectedTestCaseIds);
    setSelectedTestCaseIds([]);
    setShowTestCaseSelector(false);
  };

  const handleUnlinkTestCase = async (testCaseId: string) => {
    if (!requirement) return;
    await unlinkTestCase(requirement.id, testCaseId);
  };

  // Acceptance handlers
  const handleAccept = async () => {
    if (!requirement) return;
    await acceptRequirement(requirement.id, currentUser.id, acceptanceNotes);
    onClose();
  };

  const handleReject = async () => {
    if (!requirement || !acceptanceNotes.trim()) {
      alert("请填写拒绝原因");
      return;
    }
    await rejectRequirement(requirement.id, currentUser.id, acceptanceNotes);
    onClose();
  };

  const canAccept = currentUser.role === "ADMIN" || currentUser.role === "PM" || currentUser.role === "QA_LEAD";

  // AI Generation handler
  const handleAIGenerate = async (fieldType: string) => {
    if (!title.trim()) {
      setAiError("请先填写需求标题");
      return;
    }

    setAiGenerating(fieldType);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fieldType,
          context: preconditions || (userStories.length > 0 ? JSON.stringify(userStories) : ""),
        }),
      });

      if (!response.ok) {
        throw new Error("AI generation failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      // Handle different field types
      switch (fieldType) {
        case "userStory":
          // Parse user stories from text (each story is a paragraph)
          const storyLines = result.trim().split(/\n\n+/).filter(line => line.trim());
          const newStories: UserStory[] = storyLines.map((line, i) => {
            // Try to parse "作为...，我希望...，以便..." format
            const match = line.match(/作为(.+?)，我希望(.+?)，以便(.+)/);
            if (match) {
              return {
                id: `us-${Date.now()}-${i}`,
                role: match[1].trim(),
                goal: match[2].trim(),
                benefit: match[3].replace(/。$/, "").trim(),
              };
            }
            // Fallback: put the whole text in goal
            return {
              id: `us-${Date.now()}-${i}`,
              role: "用户",
              goal: line.trim(),
              benefit: "达成业务目标",
            };
          });
          setUserStories(prev => [...prev, ...newStories]);
          break;
        case "acceptanceCriteria":
          // Parse lines into AC items
          const acLines = result.trim().split("\n").filter(line => line.trim());
          const newACs = acLines.map((line, i) => ({
            id: `ac-${Date.now()}-${i}`,
            description: line.replace(/^[-•]\s*/, "").trim(),
            testCaseIds: [],
            status: "PENDING" as const,
          }));
          setAcceptanceCriteria(prev => [...prev, ...newACs]);
          break;
        case "businessRules":
          try {
            const rules = JSON.parse(result.trim());
            if (Array.isArray(rules)) {
              const newRules = rules.map((r, i) => ({
                id: `br-${Date.now()}-${i}`,
                code: r.code || `BR-${String(businessRules.length + i + 1).padStart(3, "0")}`,
                description: r.description,
              }));
              setBusinessRules(prev => [...prev, ...newRules]);
            }
          } catch {
            setAiError("无法解析业务规则，请重试");
          }
          break;
        case "preconditions":
          setPreconditions(result.trim());
          break;
        case "refineDescription":
          setDescription(result.trim());
          break;
        case "testCaseSuggestions":
          try {
            const suggestions = JSON.parse(result.trim());
            if (Array.isArray(suggestions)) {
              setTestCaseSuggestions(suggestions);
              setShowTestCaseSuggestions(true);
            }
          } catch {
            setAiError("无法解析测试用例建议，请重试");
          }
          break;
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setAiError("AI 生成失败，请稍后重试");
    } finally {
      setAiGenerating(null);
    }
  };

  // AI Button component
  const AIButton = ({ fieldType, label, className = "" }: { fieldType: string; label?: string; className?: string }) => (
    <button
      type="button"
      onClick={() => handleAIGenerate(fieldType)}
      disabled={aiGenerating !== null}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-all ${
        aiGenerating === fieldType
          ? "bg-purple-100 text-purple-600 cursor-wait"
          : "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 hover:from-purple-100 hover:to-blue-100 border border-purple-200"
      } ${className}`}
    >
      {aiGenerating === fieldType ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          生成中...
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3" />
          {label || "AI 生成"}
        </>
      )}
    </button>
  );

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode; showForNew?: boolean }[] = [
    { id: "BASIC", label: "基本信息", icon: <FileText className="w-3.5 h-3.5" />, showForNew: true },
    { id: "USER_STORY", label: "用户故事", icon: <BookOpen className="w-3.5 h-3.5" />, showForNew: true },
    { id: "DESIGN", label: "设计参考", icon: <Palette className="w-3.5 h-3.5" />, showForNew: true },
    { id: "ACCEPTANCE_CRITERIA", label: "验收标准", icon: <Target className="w-3.5 h-3.5" />, showForNew: true },
    { id: "TEST_CASES", label: "关联用例", icon: <Link2 className="w-3.5 h-3.5" /> },
    ...(canAccept ? [{ id: "ACCEPTANCE" as TabType, label: "验收", icon: <CheckCircle2 className="w-3.5 h-3.5" /> }] : [])
  ];

  const availableTabs = requirement ? tabs : tabs.filter(t => t.showForNew);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center flex-shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-zinc-900">
              {requirement ? (isEditMode ? "编辑需求" : "需求详情") : "新建需求"}
            </h3>
            {requirement && (
              <div className="flex bg-zinc-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setIsEditMode(false)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    !isEditMode
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Eye className="w-3 h-3" /> 查看
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    isEditMode
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> 编辑
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose}>
            <XCircle className="w-6 h-6 text-zinc-400 hover:text-zinc-600" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-zinc-100 bg-zinc-50/30">
          <div className="flex gap-1 overflow-x-auto">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* AI Error Banner */}
          {aiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{aiError}</span>
              </div>
              <button onClick={() => setAiError(null)} className="text-red-400 hover:text-red-600">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* BASIC INFO TAB */}
          {activeTab === "BASIC" && (
            <>
              {!isEditMode && requirement ? (
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="p-5 bg-gradient-to-br from-zinc-50 to-white rounded-xl border border-zinc-200 shadow-sm">
                    <h4 className="text-xl font-bold text-zinc-900 mb-4">{title || "无标题"}</h4>

                    {/* Status Badges */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        status === "DRAFT" ? "bg-zinc-100 text-zinc-600" :
                        status === "PENDING_REVIEW" ? "bg-yellow-100 text-yellow-700" :
                        status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                        status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {STATUS_OPTIONS.find(s => s.value === status)?.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        priority === "P0" ? "bg-red-500 text-white" :
                        priority === "P1" ? "bg-orange-500 text-white" :
                        priority === "P2" ? "bg-blue-500 text-white" :
                        "bg-zinc-400 text-white"
                      }`}>
                        {PRIORITY_OPTIONS.find(p => p.value === priority)?.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        requirement.acceptanceStatus === "ACCEPTED" ? "bg-green-100 text-green-700" :
                        requirement.acceptanceStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-zinc-100 text-zinc-600"
                      }`}>
                        {requirement.acceptanceStatus === "ACCEPTED" ? "已验收" :
                         requirement.acceptanceStatus === "REJECTED" ? "已拒绝" : "待验收"}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">标签</label>
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">暂无标签</span>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">需求描述</label>
                      {description ? (
                        <div className="p-3 bg-white rounded-lg border border-zinc-100">
                          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{description}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">暂无描述</span>
                      )}
                    </div>
                  </div>

                  {/* Planning Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-500 uppercase">目标版本</span>
                      </div>
                      <p className="text-sm text-zinc-900">{targetVersion || "-"}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-500 uppercase">预估工作量</span>
                      </div>
                      <p className="text-sm text-zinc-900">{estimatedEffort || "-"}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-500 uppercase">负责人</span>
                      </div>
                      <p className="text-sm text-zinc-900">
                        {requirement.owner?.name || ownerId || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Test Coverage Stats */}
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-zinc-500" />
                      <label className="text-xs font-bold text-zinc-500 uppercase">测试覆盖情况</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-white rounded-lg border border-zinc-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-500">执行进度</span>
                          <span className="text-sm font-bold text-zinc-900">
                            {testStats.executed}/{testStats.total}
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${testStats.executionProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-zinc-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-500">通过率</span>
                          <span className="text-sm font-bold text-zinc-900">
                            {testStats.passed}/{testStats.passed + testStats.failed}
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              testStats.passRate >= 80 ? "bg-green-500" :
                              testStats.passRate >= 50 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${testStats.passRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> 通过: {testStats.passed}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> 失败: {testStats.failed}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> 阻塞: {testStats.blocked}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-zinc-300" /> 未执行: {testStats.total - testStats.executed}
                      </span>
                    </div>
                  </div>

                  {/* Related Requirements */}
                  {relatedRequirements.length > 0 && (
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch className="w-4 h-4 text-zinc-500" />
                        <label className="text-xs font-bold text-zinc-500 uppercase">关联需求</label>
                      </div>
                      <div className="space-y-2">
                        {relatedRequirements.map(rel => {
                          const relReq = otherRequirements.find(r => r.id === rel.id);
                          return (
                            <div key={rel.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-200">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                rel.type === "depends_on" ? "bg-blue-100 text-blue-700" :
                                rel.type === "blocks" ? "bg-red-100 text-red-700" :
                                "bg-zinc-100 text-zinc-600"
                              }`}>
                                {RELATION_TYPE_OPTIONS.find(o => o.value === rel.type)?.label}
                              </span>
                              <span className="text-sm text-zinc-900">{relReq?.title || rel.id}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT MODE - BASIC */
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
                      需求标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="输入需求标题..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-zinc-500 uppercase">
                        需求描述
                      </label>
                      <AIButton fieldType="refineDescription" label="AI 优化" />
                    </div>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none min-h-[100px]"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="详细描述需求背景..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">状态</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
                        value={status}
                        onChange={e => setStatus(e.target.value as RequirementStatus)}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">优先级</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900"
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                      >
                        {PRIORITY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">目标版本</label>
                      <input
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none"
                        value={targetVersion}
                        onChange={e => setTargetVersion(e.target.value)}
                        placeholder="如: v1.0.0, Sprint 23"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">预估工作量</label>
                      <input
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none"
                        value={estimatedEffort}
                        onChange={e => setEstimatedEffort(e.target.value)}
                        placeholder="如: 3d, 5 story points"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">标签</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-sm">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)}>
                            <XIcon className="w-3 h-3 text-zinc-400 hover:text-red-500" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                        placeholder="输入标签后回车添加"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium"
                      >
                        添加
                      </button>
                    </div>
                  </div>

                  {/* Related Requirements */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">关联需求</label>
                    <div className="space-y-2 mb-2">
                      {relatedRequirements.map(rel => {
                        const relReq = otherRequirements.find(r => r.id === rel.id);
                        return (
                          <div key={rel.id} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                rel.type === "depends_on" ? "bg-blue-100 text-blue-700" :
                                rel.type === "blocks" ? "bg-red-100 text-red-700" :
                                "bg-zinc-100 text-zinc-600"
                              }`}>
                                {RELATION_TYPE_OPTIONS.find(o => o.value === rel.type)?.label}
                              </span>
                              <span className="text-sm text-zinc-900">{relReq?.title || rel.id}</span>
                            </div>
                            <button onClick={() => handleRemoveRelatedRequirement(rel.id)} className="p-1 text-zinc-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {otherRequirements.length > 0 && (
                      <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <p className="text-xs text-zinc-500 mb-2">选择要关联的需求：</p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {otherRequirements.filter(r => !relatedRequirements.some(rel => rel.id === r.id)).map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2 hover:bg-zinc-100 rounded">
                              <span className="text-sm text-zinc-700">{req.title}</span>
                              <div className="flex gap-1">
                                {RELATION_TYPE_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    onClick={() => handleAddRelatedRequirement(req.id, opt.value as RelatedRequirement['type'])}
                                    className="px-2 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded"
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* USER STORY TAB */}
          {activeTab === "USER_STORY" && (
            <>
              {!isEditMode && requirement ? (
                <div className="space-y-6">
                  {/* User Stories Card */}
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-zinc-900">用户故事</h4>
                      {userStories.length > 0 && (
                        <span className="text-xs text-zinc-400">({userStories.length})</span>
                      )}
                    </div>
                    {userStories.length > 0 ? (
                      <div className="space-y-3">
                        {userStories.map((story, index) => (
                          <div key={story.id} className="p-4 bg-white rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-blue-600">US-{index + 1}</span>
                            </div>
                            <p className="text-sm text-zinc-700 leading-relaxed">
                              <span className="text-zinc-500">作为</span>{" "}
                              <span className="font-medium text-blue-700">{story.role}</span>
                              <span className="text-zinc-500">，我希望</span>{" "}
                              <span className="font-medium text-zinc-900">{story.goal}</span>
                              <span className="text-zinc-500">，以便</span>{" "}
                              <span className="font-medium text-green-700">{story.benefit}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">暂无用户故事</p>
                    )}
                  </div>

                  {/* Target Users */}
                  <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-zinc-600" />
                      <h4 className="font-bold text-zinc-900">目标用户</h4>
                    </div>
                    {targetUsers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {targetUsers.map(userId => {
                          const user = TARGET_USER_OPTIONS.find(u => u.value === userId);
                          return (
                            <span key={userId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm">
                              <span>{user?.icon}</span>
                              <span className="text-zinc-700">{user?.label || userId}</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">暂未指定目标用户</p>
                    )}
                  </div>

                  {/* Preconditions */}
                  <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-zinc-600" />
                      <h4 className="font-bold text-zinc-900">前置条件</h4>
                    </div>
                    {preconditions ? (
                      <div className="p-4 bg-white rounded-lg border border-zinc-200">
                        <p className="text-sm text-zinc-700 whitespace-pre-wrap">{preconditions}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">暂无前置条件</p>
                    )}
                  </div>

                  {/* Business Rules */}
                  <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 className="w-5 h-5 text-zinc-600" />
                      <h4 className="font-bold text-zinc-900">业务规则</h4>
                      {businessRules.length > 0 && (
                        <span className="text-xs text-zinc-400">({businessRules.length})</span>
                      )}
                    </div>
                    {businessRules.length > 0 ? (
                      <div className="space-y-2">
                        {businessRules.map((rule) => (
                          <div key={rule.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-zinc-200">
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-mono">
                              {rule.code}
                            </span>
                            <p className="text-sm text-zinc-700 flex-1">{rule.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">暂无业务规则</p>
                    )}
                  </div>
                </div>
              ) : (
                /* EDIT MODE - USER STORY */
                <div className="space-y-5">
                  {/* User Stories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase">
                        用户故事
                      </label>
                      <div className="flex items-center gap-2">
                        <AIButton fieldType="userStory" label="AI 生成" />
                        <button
                          onClick={() => {
                            const newStory: UserStory = {
                              id: `us-${Date.now()}`,
                              role: "",
                              goal: "",
                              benefit: ""
                            };
                            setUserStories([...userStories, newStory]);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-3 h-3" /> 添加故事
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      使用 BDD 格式: 作为[用户角色]，我希望[目标]，以便[价值]
                    </p>

                    {userStories.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
                        <BookOpen className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                        <p className="text-zinc-400 text-sm">添加用户故事来描述不同角色的需求</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userStories.map((story, index) => (
                          <div key={story.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-600">US-{index + 1}</span>
                              <button
                                onClick={() => setUserStories(userStories.filter(s => s.id !== story.id))}
                                className="p-1 text-zinc-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 w-12 shrink-0">作为</span>
                                <input
                                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                                  value={story.role}
                                  onChange={e => {
                                    const updated = [...userStories];
                                    updated[index] = { ...story, role: e.target.value };
                                    setUserStories(updated);
                                  }}
                                  placeholder="用户角色，如：注册用户、管理员"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 w-12 shrink-0">我希望</span>
                                <input
                                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                                  value={story.goal}
                                  onChange={e => {
                                    const updated = [...userStories];
                                    updated[index] = { ...story, goal: e.target.value };
                                    setUserStories(updated);
                                  }}
                                  placeholder="功能目标，如：使用邮箱登录系统"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 w-12 shrink-0">以便</span>
                                <input
                                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                                  value={story.benefit}
                                  onChange={e => {
                                    const updated = [...userStories];
                                    updated[index] = { ...story, benefit: e.target.value };
                                    setUserStories(updated);
                                  }}
                                  placeholder="价值/原因，如：访问我的个人账户"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Target Users */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                      目标用户
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_USER_OPTIONS.map(user => (
                        <button
                          key={user.value}
                          onClick={() => {
                            if (targetUsers.includes(user.value)) {
                              setTargetUsers(targetUsers.filter(u => u !== user.value));
                            } else {
                              setTargetUsers([...targetUsers, user.value]);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                            targetUsers.includes(user.value)
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          }`}
                        >
                          <span>{user.icon}</span>
                          <span>{user.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preconditions */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-zinc-500 uppercase">
                        前置条件
                      </label>
                      <AIButton fieldType="preconditions" label="AI 生成" />
                    </div>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none min-h-[80px]"
                      value={preconditions}
                      onChange={e => setPreconditions(e.target.value)}
                      placeholder="描述此需求的前提条件或依赖..."
                    />
                  </div>

                  {/* Business Rules */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase">
                        业务规则
                      </label>
                      <div className="flex items-center gap-2">
                        <AIButton fieldType="businessRules" label="AI 生成" />
                        <button
                          onClick={handleAddBusinessRule}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-3 h-3" /> 添加规则
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {businessRules.length === 0 ? (
                        <p className="text-sm text-zinc-400 py-4 text-center border border-dashed border-zinc-200 rounded-lg">
                          暂无业务规则，点击上方按钮添加
                        </p>
                      ) : (
                        businessRules.map((rule, index) => (
                          <div key={rule.id} className="flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                            <input
                              className="w-24 px-2 py-1.5 rounded border border-zinc-200 bg-white text-zinc-900 text-xs font-mono"
                              value={rule.code}
                              onChange={e => handleUpdateBusinessRule(index, "code", e.target.value)}
                              placeholder="BR-001"
                            />
                            <textarea
                              className="flex-1 px-3 py-1.5 rounded border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none min-h-[40px]"
                              value={rule.description}
                              onChange={e => handleUpdateBusinessRule(index, "description", e.target.value)}
                              placeholder="描述业务规则..."
                            />
                            <button
                              onClick={() => handleRemoveBusinessRule(index)}
                              className="p-1.5 text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* DESIGN TAB */}
          {activeTab === "DESIGN" && (
            <>
              {!isEditMode && requirement ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-zinc-600" />
                    <h4 className="font-bold text-zinc-900">设计参考</h4>
                    {designReferences.length > 0 && (
                      <span className="text-xs text-zinc-400">({designReferences.length})</span>
                    )}
                  </div>

                  {designReferences.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
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
              ) : (
                /* EDIT MODE - DESIGN */
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-500 uppercase">
                      设计参考
                    </label>
                    <button
                      onClick={handleAddDesignReference}
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
                              onChange={e => handleUpdateDesignReference(index, "type", e.target.value)}
                            >
                              {DESIGN_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <input
                              className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                              value={ref.title}
                              onChange={e => handleUpdateDesignReference(index, "title", e.target.value)}
                              placeholder="标题"
                            />
                            <button
                              onClick={() => handleRemoveDesignReference(index)}
                              className="p-2 text-zinc-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                            value={ref.url}
                            onChange={e => handleUpdateDesignReference(index, "url", e.target.value)}
                            placeholder="URL 地址"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ACCEPTANCE CRITERIA TAB */}
          {activeTab === "ACCEPTANCE_CRITERIA" && (
            <>
              {!isEditMode && requirement ? (
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
              ) : (
                /* EDIT MODE - ACCEPTANCE CRITERIA */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-500 uppercase">
                      验收标准 (AC)
                    </label>
                    <div className="flex items-center gap-2">
                      <AIButton fieldType="acceptanceCriteria" label="AI 生成" />
                      <button
                        onClick={handleAddAC}
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
                                onChange={e => handleUpdateAC(index, "description", e.target.value)}
                                placeholder="描述具体可测的验收标准..."
                              />
                              <button
                                onClick={() => handleRemoveAC(index)}
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
              )}
            </>
          )}

          {/* TEST CASES TAB */}
          {activeTab === "TEST_CASES" && requirement && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-zinc-900 font-medium">已关联的测试用例</h4>
                <div className="flex items-center gap-2">
                  <AIButton fieldType="testCaseSuggestions" label="AI 推荐用例" />
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
                      onClick={() => setShowTestCaseSuggestions(false)}
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

              {showTestCaseSelector && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                  <p className="text-sm text-zinc-600">选择要关联的测试用例：</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {availableTestCases.length === 0 ? (
                      <p className="text-sm text-zinc-400 py-2">没有可关联的测试用例</p>
                    ) : (
                      availableTestCases.map(tc => (
                        <label
                          key={tc.id}
                          className="flex items-center gap-2 p-2 hover:bg-zinc-100 rounded cursor-pointer"
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
                            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
                          />
                          <span className="text-sm text-zinc-900">{tc.title}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            tc.status === "PASSED" ? "bg-green-100 text-green-700" :
                            tc.status === "FAILED" ? "bg-red-100 text-red-700" :
                            "bg-zinc-100 text-zinc-500"
                          }`}>
                            {tc.status}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowTestCaseSelector(false);
                        setSelectedTestCaseIds([]);
                      }}
                      className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleLinkTestCases}
                      disabled={selectedTestCaseIds.length === 0}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg text-sm font-medium"
                    >
                      确认关联 ({selectedTestCaseIds.length})
                    </button>
                  </div>
                </div>
              )}

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
                        onClick={() => handleUnlinkTestCase(tc.id)}
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
          )}

          {/* ACCEPTANCE TAB */}
          {activeTab === "ACCEPTANCE" && requirement && canAccept && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="text-sm text-zinc-500 mb-1">执行进度</div>
                  <div className="text-2xl font-bold text-zinc-900">
                    {testStats.executed}/{testStats.total}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {Math.round(testStats.executionProgress)}% 已执行
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="text-sm text-zinc-500 mb-1">通过率</div>
                  <div className={`text-2xl font-bold ${
                    testStats.passRate >= 80 ? "text-green-600" :
                    testStats.passRate >= 50 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {Math.round(testStats.passRate)}%
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {testStats.passed}/{testStats.passed + testStats.failed} 通过
                  </div>
                </div>
              </div>

              {testStats.failed > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      存在 {testStats.failed} 个失败的测试用例
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      建议修复后再进行验收，或在验收意见中说明原因
                    </p>
                  </div>
                </div>
              )}

              {testStats.total > 0 && testStats.executed < testStats.total && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      尚有 {testStats.total - testStats.executed} 个用例未执行
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      确定要在测试未完成的情况下验收吗？
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="text-sm text-zinc-500 mb-2">当前验收状态</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  requirement.acceptanceStatus === "ACCEPTED" ? "bg-green-100 text-green-700" :
                  requirement.acceptanceStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                  "bg-zinc-100 text-zinc-600"
                }`}>
                  {requirement.acceptanceStatus === "ACCEPTED" && <CheckCircle2 className="w-4 h-4" />}
                  {requirement.acceptanceStatus === "REJECTED" && <XIcon className="w-4 h-4" />}
                  {requirement.acceptanceStatus === "PENDING" && <AlertCircle className="w-4 h-4" />}
                  {requirement.acceptanceStatus === "ACCEPTED" ? "已通过" :
                   requirement.acceptanceStatus === "REJECTED" ? "已拒绝" : "待验收"}
                </div>
                {requirement.acceptedAt && (
                  <div className="text-xs text-zinc-400 mt-2">
                    验收时间: {new Date(requirement.acceptedAt).toLocaleString()}
                  </div>
                )}
                {requirement.acceptanceNotes && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-zinc-200 text-sm text-zinc-600">
                    {requirement.acceptanceNotes}
                  </div>
                )}
              </div>

              {requirement.acceptanceStatus === "PENDING" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">
                      验收意见
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none min-h-[80px]"
                      value={acceptanceNotes}
                      onChange={e => setAcceptanceNotes(e.target.value)}
                      placeholder="填写验收意见（拒绝时必填）..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium"
                    >
                      <XIcon className="w-4 h-4" />
                      验收不通过
                    </button>
                    <button
                      onClick={handleAccept}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      验收通过
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditMode && (
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 flex-shrink-0 bg-zinc-50/50">
            <button
              onClick={() => {
                if (requirement) {
                  setIsEditMode(false);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

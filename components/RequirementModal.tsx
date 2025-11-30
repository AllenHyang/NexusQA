import React, { useState, useEffect, useMemo } from "react";
import {
  InternalRequirement,
  RequirementStatus,
  AcceptanceCriteria,
  BusinessRule,
  DesignReference,
  RelatedRequirement,
  UserStory,
  User,
  RequirementReview
} from "@/types";
import {
  XCircle,
  Save,
  Link2,
  CheckCircle2,
  XCircle as XIcon,
  FileText,
  AlertCircle,
  Edit3,
  Eye,
  BookOpen,
  Palette,
  Target,
  MessageSquare,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { BasicInfoTab, UserStoryTab, DesignTab, AcceptanceCriteriaTab, TestCasesTab, ReviewTab, AcceptanceTab } from "./Requirement";

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: InternalRequirement;
  projectId: string;
  currentUser: User;
}

type TabType = "BASIC" | "USER_STORY" | "DESIGN" | "ACCEPTANCE_CRITERIA" | "TEST_CASES" | "REVIEW" | "ACCEPTANCE";

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
    requirements,
    selectedRequirement,
    submitForReview,
    approveReview,
    rejectReview,
    requestChanges,
    loadReviewHistory,
    performReviewAction
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>("BASIC");
  const [isEditMode, setIsEditMode] = useState(false);

  // Basic Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RequirementStatus>("DRAFT");
  const [priority, setPriority] = useState("P2");
  const [tags, setTags] = useState<string[]>([]);

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

  // Test Case Linking State (moved to TestCasesTab component)

  // Review State
  const [reviewHistory, setReviewHistory] = useState<RequirementReview[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Memoize linked test cases - prioritize selectedRequirement for real-time updates
  const linkedTestCases = useMemo(() => {
    // Use selectedRequirement.testCases if it matches current requirement (for real-time updates)
    if (selectedRequirement?.id === requirement?.id && selectedRequirement?.testCases) {
      return selectedRequirement.testCases;
    }
    return requirement?.testCases || [];
  }, [requirement?.id, requirement?.testCases, selectedRequirement?.id, selectedRequirement?.testCases]);

  // Memoize current status - prioritize selectedRequirement for real-time updates after review actions
  const currentStatus = useMemo(() => {
    // Use selectedRequirement.status if it matches current requirement (for real-time updates)
    if (selectedRequirement?.id === requirement?.id && selectedRequirement?.status) {
      return selectedRequirement.status;
    }
    return status;
  }, [requirement?.id, status, selectedRequirement?.id, selectedRequirement?.status]);

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

  // Load review history when switching to review tab
  const requirementId = requirement?.id;
  useEffect(() => {
    const fetchReviews = async () => {
      if (requirementId && isOpen && activeTab === "REVIEW") {
        const reviews = await loadReviewHistory(requirementId);
        setReviewHistory(reviews);
      }
    };
    fetchReviews();
  }, [requirementId, isOpen, activeTab, loadReviewHistory]);

  if (!isOpen) return null;

  // Form state object for passing to subcomponents
  const formState = {
    title,
    description,
    status,
    priority,
    tags,
    userStories,
    targetUsers,
    preconditions,
    targetVersion,
    estimatedEffort,
    ownerId,
    businessRules,
    designReferences,
    relatedRequirements,
    acceptanceCriteria,
  };

  // Form actions object for passing to subcomponents
  const formActions = {
    setTitle,
    setDescription,
    setStatus,
    setPriority,
    setTags,
    setUserStories,
    setTargetUsers,
    setPreconditions,
    setTargetVersion,
    setEstimatedEffort,
    setOwnerId,
    setBusinessRules,
    setDesignReferences,
    setRelatedRequirements,
    setAcceptanceCriteria,
  };

  // Helper to refresh reviews
  const refreshReviews = async () => {
    if (requirement) {
      const reviews = await loadReviewHistory(requirement.id);
      setReviewHistory(reviews);
    }
  };

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

  // Review handlers
  const canReview = currentUser.role === "ADMIN" || currentUser.role === "PM" || currentUser.role === "QA_LEAD";
  const isAuthor = requirement?.authorId === currentUser.id;

  const handleSubmitForReview = async () => {
    if (!requirement) return;
    setReviewLoading(true);
    setReviewError(null);
    const result = await submitForReview(requirement.id, currentUser.id);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "提交评审失败");
    } else {
      refreshReviews();
    }
  };

  const handleApproveReview = async () => {
    if (!requirement) return;
    setReviewLoading(true);
    setReviewError(null);
    const result = await approveReview(requirement.id, currentUser.id, reviewComment);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "批准失败");
    } else {
      setReviewComment("");
      refreshReviews();
    }
  };

  const handleRejectReview = async () => {
    if (!requirement) return;
    if (!reviewComment.trim()) {
      setReviewError("请填写拒绝原因");
      return;
    }
    setReviewLoading(true);
    setReviewError(null);
    const result = await rejectReview(requirement.id, currentUser.id, reviewComment);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "拒绝失败");
    } else {
      setReviewComment("");
      refreshReviews();
    }
  };

  const handleRequestChanges = async () => {
    if (!requirement) return;
    if (!reviewComment.trim()) {
      setReviewError("请填写修改意见");
      return;
    }
    setReviewLoading(true);
    setReviewError(null);
    const result = await requestChanges(requirement.id, currentUser.id, reviewComment);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "操作失败");
    } else {
      setReviewComment("");
      refreshReviews();
    }
  };

  const handleStartImplementation = async () => {
    if (!requirement) return;
    setReviewLoading(true);
    setReviewError(null);
    const result = await performReviewAction(requirement.id, "START", currentUser.id);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "操作失败");
    } else {
      refreshReviews();
    }
  };

  const handleCompleteImplementation = async () => {
    if (!requirement) return;
    setReviewLoading(true);
    setReviewError(null);
    const result = await performReviewAction(requirement.id, "COMPLETE", currentUser.id);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "操作失败");
    } else {
      refreshReviews();
    }
  };

  const handleReopen = async () => {
    if (!requirement) return;
    setReviewLoading(true);
    setReviewError(null);
    const result = await performReviewAction(requirement.id, "REOPEN", currentUser.id, reviewComment);
    setReviewLoading(false);
    if (!result.success) {
      setReviewError(result.error || "操作失败");
    } else {
      setReviewComment("");
      refreshReviews();
    }
  };

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


  // Tab configuration
  const tabs: { id: TabType; label: string; icon: React.ReactNode; showForNew?: boolean }[] = [
    { id: "BASIC", label: "基本信息", icon: <FileText className="w-3.5 h-3.5" />, showForNew: true },
    { id: "USER_STORY", label: "用户故事", icon: <BookOpen className="w-3.5 h-3.5" />, showForNew: true },
    { id: "DESIGN", label: "设计参考", icon: <Palette className="w-3.5 h-3.5" />, showForNew: true },
    { id: "ACCEPTANCE_CRITERIA", label: "验收标准", icon: <Target className="w-3.5 h-3.5" />, showForNew: true },
    { id: "TEST_CASES", label: "关联用例", icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: "REVIEW", label: "评审", icon: <MessageSquare className="w-3.5 h-3.5" /> },
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
            <BasicInfoTab
              isEditMode={isEditMode}
              requirement={requirement}
              formState={formState}
              formActions={formActions}
              currentUser={currentUser}
              projectId={projectId}
              linkedTestCases={linkedTestCases}
              otherRequirements={otherRequirements}
              aiGenerating={aiGenerating}
              onAIGenerate={handleAIGenerate}
            />
          )}

          {/* USER STORY TAB */}
          {activeTab === "USER_STORY" && (
            <UserStoryTab
              isEditMode={isEditMode}
              requirement={requirement}
              formState={formState}
              formActions={formActions}
              currentUser={currentUser}
              projectId={projectId}
              aiGenerating={aiGenerating}
              onAIGenerate={handleAIGenerate}
            />
          )}

          {/* DESIGN TAB */}
          {activeTab === "DESIGN" && (
            <DesignTab
              isEditMode={isEditMode}
              requirement={requirement}
              formState={formState}
              formActions={formActions}
              currentUser={currentUser}
              projectId={projectId}
              onAddDesignReference={handleAddDesignReference}
              onUpdateDesignReference={handleUpdateDesignReference}
              onRemoveDesignReference={handleRemoveDesignReference}
            />
          )}

          {/* ACCEPTANCE CRITERIA TAB */}
          {activeTab === "ACCEPTANCE_CRITERIA" && (
            <AcceptanceCriteriaTab
              isEditMode={isEditMode}
              requirement={requirement}
              formState={formState}
              formActions={formActions}
              currentUser={currentUser}
              projectId={projectId}
              acCoverage={acCoverage}
              linkedTestCases={linkedTestCases}
              aiGenerating={aiGenerating}
              onAIGenerate={handleAIGenerate}
              onAddAC={handleAddAC}
              onUpdateAC={handleUpdateAC}
              onRemoveAC={handleRemoveAC}
            />
          )}

          {/* TEST CASES TAB */}
          {activeTab === "TEST_CASES" && requirement && (
            <TestCasesTab
              linkedTestCases={linkedTestCases}
              availableTestCases={availableTestCases}
              aiGenerating={aiGenerating}
              showTestCaseSuggestions={showTestCaseSuggestions}
              testCaseSuggestions={testCaseSuggestions}
              onAIGenerate={handleAIGenerate}
              onCloseSuggestions={() => setShowTestCaseSuggestions(false)}
              onLinkTestCases={async (ids) => {
                if (requirement) {
                  await linkTestCases(requirement.id, ids);
                  await loadRequirement(requirement.id);
                }
              }}
              onUnlinkTestCase={handleUnlinkTestCase}
            />
          )}

          {/* REVIEW TAB */}
          {activeTab === "REVIEW" && requirement && (
            <ReviewTab
              requirement={requirement}
              status={currentStatus}
              currentUser={currentUser}
              isAuthor={isAuthor}
              canReview={canReview}
              reviewHistory={reviewHistory}
              reviewComment={reviewComment}
              reviewLoading={reviewLoading}
              reviewError={reviewError}
              onReviewCommentChange={setReviewComment}
              onSubmitForReview={handleSubmitForReview}
              onApproveReview={handleApproveReview}
              onRejectReview={handleRejectReview}
              onRequestChanges={handleRequestChanges}
              onStartImplementation={handleStartImplementation}
              onCompleteImplementation={handleCompleteImplementation}
              onReopen={handleReopen}
            />
          )}

          {/* ACCEPTANCE TAB */}
          {activeTab === "ACCEPTANCE" && requirement && canAccept && (
            <AcceptanceTab
              requirement={requirement}
              testStats={testStats}
              acceptanceNotes={acceptanceNotes}
              onAcceptanceNotesChange={setAcceptanceNotes}
              onAccept={handleAccept}
              onReject={handleReject}
            />
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

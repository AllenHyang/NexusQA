import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { BasicInfoTab, UserStoryTab, DesignTab, AcceptanceCriteriaTab, TestCasesTab, ReviewTab, AcceptanceTab } from "./Requirement";

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: InternalRequirement;
  projectId: string;
  currentUser: User;
  initialTab?: TabType;
}

type TabType = "BASIC" | "USER_STORY" | "DESIGN" | "ACCEPTANCE_CRITERIA" | "TEST_CASES" | "REVIEW" | "ACCEPTANCE";

export function RequirementModal({
  isOpen,
  onClose,
  requirement,
  projectId,
  currentUser,
  initialTab
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
    performReviewAction,
    users
  } = useAppStore();

  // Handler to open test case detail page in new tab
  const handleViewTestCase = useCallback((testCaseId: string) => {
    window.open(`/project/${projectId}/case/${testCaseId}`, '_blank');
  }, [projectId]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "BASIC");
  const [isEditMode, setIsEditMode] = useState(false);

  // Update active tab when initialTab changes (e.g., from notification click)
  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

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
  const [reviewerId, setReviewerId] = useState("");

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

  // AI Smart Match State
  const [showAIMatchResults, setShowAIMatchResults] = useState(false);
  const [aiMatchedTestCases, setAiMatchedTestCases] = useState<{id: string; title: string; reason: string; score: number}[]>([]);

  // AC Link Prompt State
  const [showACLinkPrompt, setShowACLinkPrompt] = useState(false);
  const [prevLinkedCount, setPrevLinkedCount] = useState(0);

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
      setReviewerId(requirement.reviewerId || "");

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
      setReviewerId("");
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

  // Detect when test cases are newly linked and prompt for AC linking
  useEffect(() => {
    const currentCount = linkedTestCases.length;
    const hasAC = acceptanceCriteria.length > 0;
    const hasUncoveredAC = acCoverage.some(item => item.total === 0);

    // If linked count increased and there are ACs that need linking
    if (currentCount > prevLinkedCount && hasAC && hasUncoveredAC && isEditMode) {
      setShowACLinkPrompt(true);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setShowACLinkPrompt(false), 5000);
    }
    setPrevLinkedCount(currentCount);
  }, [linkedTestCases.length, acceptanceCriteria.length, acCoverage, isEditMode, prevLinkedCount]);

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
    reviewerId,
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
    setReviewerId,
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
      reviewerId: reviewerId || null,
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

  // Helper to extract JSON from AI responses (may be wrapped in markdown code blocks)
  const extractJSON = (text: string): string => {
    const trimmed = text.trim();
    // Try to extract from markdown code block
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // Try to extract JSON array
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }
    // Try to extract JSON object
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }
    return trimmed;
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
      // Build context based on field type
      let context = preconditions || (userStories.length > 0 ? JSON.stringify(userStories) : "");

      // For test case suggestions, include existing test cases for deduplication
      if (fieldType === "testCaseSuggestions") {
        context = JSON.stringify({
          acceptanceCriteria: acceptanceCriteria.map(ac => ac.description),
          existingTestCases: linkedTestCases.map(tc => ({
            title: tc.title,
            description: tc.description,
          })),
        });
      }

      const response = await fetch("/api/ai/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fieldType,
          context,
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
            const jsonStr = extractJSON(result);
            const rules = JSON.parse(jsonStr);
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
            const jsonStr = extractJSON(result);
            const suggestions = JSON.parse(jsonStr);
            if (Array.isArray(suggestions)) {
              setTestCaseSuggestions(suggestions);
              setShowTestCaseSuggestions(true);
            }
          } catch {
            setAiError("无法解析测试用例建议，请重试");
          }
          break;
        case "aiSmartMatch":
          try {
            const jsonStr = extractJSON(result);
            const matches = JSON.parse(jsonStr);
            if (Array.isArray(matches)) {
              setAiMatchedTestCases(matches);
              setShowAIMatchResults(true);
            }
          } catch {
            setAiError("无法解析匹配结果，请重试");
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

  // AI Smart Match handler - analyze available test cases
  const handleAISmartMatch = async () => {
    if (!title.trim()) {
      setAiError("请先填写需求标题");
      return;
    }

    if (availableTestCases.length === 0) {
      setAiError("没有可用的测试用例进行匹配");
      return;
    }

    setAiGenerating("aiSmartMatch");
    setAiError(null);

    try {
      const response = await fetch("/api/ai/requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fieldType: "aiSmartMatch",
          context: JSON.stringify({
            acceptanceCriteria,
            userStories,
            availableTestCases: availableTestCases.map(tc => ({
              id: tc.id,
              title: tc.title,
              description: tc.description,
              userStory: tc.userStory,
              acceptanceCriteria: tc.acceptanceCriteria,
            })),
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("AI matching failed");
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

      try {
        const jsonStr = extractJSON(result);
        const matches = JSON.parse(jsonStr);
        if (Array.isArray(matches)) {
          setAiMatchedTestCases(matches);
          setShowAIMatchResults(true);
        }
      } catch {
        setAiError("无法解析匹配结果，请重试");
      }
    } catch (error) {
      console.error("AI smart match error:", error);
      setAiError("AI 匹配失败，请稍后重试");
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh]">
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

        {/* Content - Responsive min-height to prevent layout shift when switching tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[50vh] sm:min-h-[400px]">
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
              users={users}
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
              acceptanceCriteria={acceptanceCriteria}
              acCoverage={acCoverage}
              testStats={testStats}
              aiGenerating={aiGenerating}
              showTestCaseSuggestions={showTestCaseSuggestions}
              testCaseSuggestions={testCaseSuggestions}
              showAIMatchResults={showAIMatchResults}
              aiMatchedTestCases={aiMatchedTestCases}
              isEditMode={isEditMode}
              formState={formState}
              formActions={formActions}
              requirementTitle={requirement?.title}
              requirementDescription={requirement?.description ?? undefined}
              projectId={projectId}
              requirementId={requirement?.id}
              onAIGenerate={(fieldType) => {
                if (fieldType === "aiSmartMatch") {
                  handleAISmartMatch();
                } else {
                  handleAIGenerate(fieldType);
                }
              }}
              onCloseSuggestions={() => setShowTestCaseSuggestions(false)}
              onCloseAIMatch={() => setShowAIMatchResults(false)}
              onLinkTestCases={async (ids) => {
                if (requirement) {
                  await linkTestCases(requirement.id, ids);
                  await loadRequirement(requirement.id);
                }
              }}
              onUnlinkTestCase={handleUnlinkTestCase}
              onViewTestCase={handleViewTestCase}
              onCreateTestCase={async (suggestion) => {
                // Create test case from AI suggestion
                try {
                  const response = await fetch("/api/testcases", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: suggestion.title,
                      description: suggestion.description,
                      priority: suggestion.priority === "HIGH" ? "P1" : suggestion.priority === "MEDIUM" ? "P2" : "P3",
                      projectId,
                      status: "UNTESTED",
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to create test case");
                  const created = await response.json();
                  // Link to current requirement
                  if (requirement && created.id) {
                    await linkTestCases(requirement.id, [created.id]);
                    await loadRequirement(requirement.id);
                  }
                  return created;
                } catch (error) {
                  console.error("Create test case error:", error);
                  return null;
                }
              }}
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
              reviewerId={reviewerId}
              onReviewerIdChange={setReviewerId}
              users={users}
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

        {/* AC Link Prompt Toast */}
        {showACLinkPrompt && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 px-4 py-3 bg-violet-600 text-white rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                检测到有未覆盖的验收标准，建议使用 AI 自动关联
              </span>
              <button
                onClick={() => {
                  setShowACLinkPrompt(false);
                  setActiveTab("ACCEPTANCE_CRITERIA");
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
              >
                前往关联
              </button>
              <button
                onClick={() => setShowACLinkPrompt(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

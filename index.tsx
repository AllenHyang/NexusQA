import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import "./app/globals.css";
import { 
  User, Project, TestCase, TestStatus, ExecutionRecord, TestSuite 
} from "./types";
import { generateTestSteps, generateImage, generateAvatar } from "./api";
import { NewProjectModal } from "./components/NewProjectModal";
import { TestCaseModal } from "./components/TestCaseModal";
import { HistoryModal } from "./components/HistoryModal";

import { LoginView } from "./views/LoginView";
import { DashboardView } from "./views/DashboardView";
import { ProjectListView } from "./views/ProjectListView";
import { ProjectDetailView } from "./views/ProjectDetailView";
import { SettingsView } from "./views/SettingsView";
import { TestCaseDetailView } from "./views/TestCaseDetailView";
import { MainLayout } from "./layouts/MainLayout";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

// --- Mock Data ---
const MOCK_USERS: User[] = [
  { id: "u1", name: "Sarah Jenkins", role: "ADMIN", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "u2", name: "David Chen", role: "QA_LEAD", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { id: "u3", name: "Emily Rodriguez", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
  { id: "u4", name: "Michael Chang", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
];

// Helper to get date relative to today
const daysFromNow = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "星链支付钱包",
    description: "安全移动支付网关集成及用户钱包管理系统（支持 iOS 和 Android）。",
    createdAt: new Date().toISOString(),
    repositoryUrl: "https://github.com/xinglian/wallet-mobile",
    startDate: daysFromNow(-15),
    dueDate: daysFromNow(15)
  },
  {
    id: "p2",
    name: "阿尔法流数据分析平台",
    description: "面向企业客户的实时数据可视化仪表盘，具备基于角色的访问控制。",
    createdAt: new Date().toISOString(),
    repositoryUrl: "https://github.com/xinglian/analytics-fe",
    startDate: daysFromNow(-30),
    dueDate: daysFromNow(5)
  },
  {
    id: "p3",
    name: "智能物流客户关系管理",
    description: "内部工具，用于管理供应链物流、司机路线规划和库存跟踪。",
    createdAt: new Date().toISOString(),
    startDate: daysFromNow(-5),
    dueDate: daysFromNow(45)
  },
  {
    id: "p4",
    name: "企业级协作平台",
    description: "为大型团队设计的安全高效的内部沟通与协作工具。",
    createdAt: new Date().toISOString(),
    startDate: daysFromNow(-20),
    dueDate: daysFromNow(20)
  },
  {
    id: "p5",
    name: "智能家居控制中心",
    description: "统一管理智能家居设备的平台，支持多种协议和语音控制。",
    createdAt: new Date().toISOString(),
    startDate: daysFromNow(-10),
    dueDate: daysFromNow(30)
  }
];

const INITIAL_TEST_CASES: TestCase[] = [
  {
    id: "tc-101",
    projectId: "p1",
    title: "Biometric Login",
    description: "Ensure users can log in using FaceID/TouchID after initial setup.",
    userStory: "As a mobile app user, I want to log in using biometrics, so that I can access my account quickly without typing a password.",
    requirementId: "AUTH-204",
    tags: ["Smoke", "Mobile", "Auth"],
    preconditions: "App installed, User registered, Biometrics enabled on device.",
    status: "PASSED",
    priority: "HIGH",
    authorId: "u2",
    assignedToId: "u3",
    steps: [
      { id: "s1", action: "Launch the application", expected: "Login screen appears with 'Login with FaceID' prompt" },
      { id: "s2", action: "Tap on biometric icon", expected: "System biometric prompt appears" },
      { id: "s3", action: "Authenticate successfully", expected: "User is redirected to Dashboard" }
    ],
    history: [
      { id: "h1", date: new Date(Date.now() - 86400000).toISOString(), status: "PASSED", executedBy: "Emily Rodriguez", notes: "Works seamlessly on iPhone 14.", environment: "iOS 17.2" }
    ]
  },
  {
    id: "tc-102",
    projectId: "p1",
    title: "Transaction History",
    description: "Verify that transaction list loads 20 items per page.",
    userStory: "As a user, I want to view my past transactions in pages, so that the app remains responsive.",
    requirementId: "WALLET-105",
    tags: ["UI/UX", "Performance"],
    preconditions: "User has > 50 transactions.",
    status: "FAILED",
    priority: "MEDIUM",
    authorId: "u2",
    assignedToId: "u4",
    steps: [
      { id: "s1", action: "Navigate to Wallet tab", expected: "Recent transactions list is visible" },
      { id: "s2", action: "Scroll to bottom", expected: "Loading spinner appears and next 20 items load" }
    ],
    history: [
      { id: "h2", date: new Date(Date.now() - 172800000).toISOString(), status: "FAILED", executedBy: "Michael Chang", notes: "Infinite scroll broken, loads duplicate items.", bugId: "JIRA-885", environment: "Android 14", evidence: "https://files.nexusqa.com/screenshot-err-1.png" }
    ]
  },
  {
    id: "tc-103",
    projectId: "p2",
    title: "Data Export CSV",
    description: "Check if CSV export functionality works for large datasets (>10k rows).",
    userStory: "As an admin, I want to export analytics data to CSV, so that I can perform offline analysis.",
    requirementId: "REP-003",
    tags: ["Backend", "Reports"],
    preconditions: "Logged in as Admin, Data exists.",
    status: "UNTESTED",
    priority: "LOW",
    authorId: "u2",
    assignedToId: "u3",
    steps: [
      { id: "s1", action: "Go to Reports section", expected: "Reports table loaded" },
      { id: "s2", action: "Click Export CSV", expected: "Download starts immediately" }
    ],
    history: []
  }
];

const compressImage = (base64Str: string, maxWidth: number = 128): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scaleSize = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            } else {
                resolve(base64Str);
            }
        };
        img.onerror = () => resolve(base64Str);
    });
};

// --- Route Wrappers ---

const ProjectDetailRoute = ({ 
  projects, testCases, suites, currentUser, users, searchQuery, jiraUrl,
  setEditCase, setShowCaseModal, handleDeleteCase, handleBulkDelete, handleBulkStatusUpdate, handleBulkMove, setHistoryViewCase,
  handleCreateSuite, handleRenameSuite, handleDeleteSuite
}: any) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p: Project) => p.id === projectId);
  const projectCases = testCases.filter((tc: TestCase) => tc.projectId === projectId);
  const projectSuites = suites.filter((s: TestSuite) => s.projectId === projectId);

  if (!project) return <Navigate to="/" replace />;

  return (
    <ProjectDetailView 
        project={project}
        testCases={projectCases}
        suites={projectSuites}
        currentUser={currentUser}
        users={users}
        searchQuery={searchQuery}
        defectTrackerUrl={jiraUrl}
        onExport={() => alert("Exporting feature coming soon!")}
        onCreateCase={() => { setEditCase({ projectId: project.id }); setShowCaseModal(true); }}
        onEditCase={(tc: TestCase) => { setEditCase(tc); setShowCaseModal(true); }}
        onDeleteCase={handleDeleteCase}
        onDuplicateCase={(tc: TestCase) => {
            const dupe = { ...tc, id: undefined, title: `${tc.title} (Copy)`, status: "UNTESTED", history: [] };
            setEditCase(dupe);
            setShowCaseModal(true);
        }}
        onViewHistory={(tc: TestCase) => setHistoryViewCase(tc)}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkMove={handleBulkMove}
        onViewCaseDetails={(pid: string, tid: string) => navigate(`/project/${pid}/case/${tid}`)}
        
        onCreateSuite={(parentId: string | null, name: string) => handleCreateSuite(projectId!, parentId, name)}
        onRenameSuite={handleRenameSuite}
        onDeleteSuite={handleDeleteSuite}
    />
  );
};

const TestCaseDetailRoute = ({ 
  projects, testCases, users, currentUser, 
  setEditCase, setShowCaseModal, handleDeleteCase 
}: any) => {
  const { projectId, testCaseId } = useParams();
  const navigate = useNavigate();
  
  return (
    <TestCaseDetailView
        projectId={projectId!}
        testCaseId={testCaseId!}
        testCases={testCases}
        users={users}
        projects={projects}
        currentUser={currentUser}
        onBack={() => navigate(`/project/${projectId}`)}
        onEdit={(tc: TestCase) => { setEditCase(tc); setShowCaseModal(true); }}
        onRunTest={(tc: TestCase) => { setEditCase(tc); setShowCaseModal(true); }}
        onDelete={(id: string) => { 
             handleDeleteCase(id); 
             navigate(`/project/${projectId}`);
        }}
    />
  );
};

function App() {
  const { t } = useLanguage();
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  // --- State ---
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]); // Suites State
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Config State
  const [jiraUrl, setJiraUrl] = useState("");

  // Modal States
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [historyViewCase, setHistoryViewCase] = useState<TestCase | null>(null);
  
  // Edit/Execution State
  const [editCase, setEditCase] = useState<Partial<TestCase>>({});
  
  // Execution Form State
  const [executionNote, setExecutionNote] = useState(""); 
  const [executionBugId, setExecutionBugId] = useState(""); 
  const [executionEnv, setExecutionEnv] = useState("QA");
  const [executionEvidence, setExecutionEvidence] = useState("");

  // --- Initialization ---
  useEffect(() => {
    // Avatar Generation
    const initAvatars = async () => {
        const storedUsers = localStorage.getItem("nexus_users_v2");
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            const usersToProcess = [...users];
            let updated = false;
            for (let i = 0; i < usersToProcess.length; i++) {
                const u = usersToProcess[i];
                if (u.avatar.includes("dicebear")) {
                    try {
                       const cacheKey = `avatar_cache_${u.name}`;
                       const cachedAvatar = localStorage.getItem(cacheKey);
                       if (cachedAvatar) {
                           usersToProcess[i] = { ...u, avatar: cachedAvatar };
                           updated = true;
                           continue; 
                       }
                       if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
                       const rawAvatar = await generateAvatar(u.name, u.role);
                       if (rawAvatar) {
                           const optimizedAvatar = await compressImage(rawAvatar);
                           usersToProcess[i] = { ...u, avatar: optimizedAvatar };
                           updated = true;
                           try {
                               localStorage.setItem(cacheKey, optimizedAvatar);
                           } catch (e) {
                               console.warn("Storage quota exceeded", u.name);
                           }
                           setUsers([...usersToProcess]); 
                       }
                    } catch (e) {
                        console.warn("Skipping avatar", u.name);
                    }
                }
            }
            if (updated) {
                try {
                    localStorage.setItem("nexus_users_v2", JSON.stringify(usersToProcess));
                } catch (e) {}
            }
        }
    };
    initAvatars();

    const storedCases = localStorage.getItem("gemini_test_cases");
    if (storedCases) {
      const parsed = JSON.parse(storedCases);
      if (parsed.length === 0) setTestCases(INITIAL_TEST_CASES); 
      else setTestCases(parsed);
    } else {
      setTestCases(INITIAL_TEST_CASES);
    }

    const storedSuites = localStorage.getItem("gemini_suites");
    if (storedSuites) setSuites(JSON.parse(storedSuites));
    
    const storedProjects = localStorage.getItem("gemini_projects");
    if (storedProjects) setProjects(JSON.parse(storedProjects));
    else generateInitialCovers();

    const storedJiraUrl = localStorage.getItem("gemini_jira_url");
    if (storedJiraUrl) setJiraUrl(storedJiraUrl);
  }, []);

  useEffect(() => { localStorage.setItem("gemini_test_cases", JSON.stringify(testCases)); }, [testCases]);
  useEffect(() => { localStorage.setItem("gemini_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("gemini_suites", JSON.stringify(suites)); }, [suites]);
  useEffect(() => { localStorage.setItem("gemini_jira_url", jiraUrl); }, [jiraUrl]);

  const generateInitialCovers = async () => {
      const projs = [...INITIAL_PROJECTS];
      let updated = false;
      for (let i = 0; i < projs.length; i++) {
          if (!projs[i].coverImage) {
              try {
                  if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
                  const cover = await generateImage(projs[i].description, "project");
                  if (cover) {
                      projs[i].coverImage = cover;
                      updated = true;
                      setProjects([...projs]);
                  }
              } catch(e) {}
          }
      }
      if (updated) localStorage.setItem("gemini_projects", JSON.stringify(projs));
  };

  // --- Handlers ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    setLoadingAI(true);
    let cover = editingProject?.coverImage;
    if (!cover) cover = await generateImage(data.description || data.name || "project", "project") || undefined;

    if (editingProject) {
        setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...data, coverImage: cover } as Project : p));
    } else {
        const newProject: Project = {
            id: `p-${Date.now()}`,
            name: data.name!,
            description: data.description || "",
            createdAt: new Date().toISOString(),
            coverImage: cover,
            repositoryUrl: data.repositoryUrl,
            startDate: data.startDate,
            dueDate: data.dueDate
        };
        setProjects([newProject, ...projects]);
    }
    setLoadingAI(false);
    setShowNewProjectModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
      if (confirm("Are you sure? All test cases in this project will be deleted.")) {
          setProjects(projects.filter(p => p.id !== id));
          setTestCases(testCases.filter(tc => tc.projectId !== id));
      }
  };

  const handleSaveTestCase = () => {
      if (!editCase.title || !editCase.projectId) return;
      
      if (editCase.id) {
          setTestCases(testCases.map(tc => tc.id === editCase.id ? { ...tc, ...editCase } as TestCase : tc));
      } else {
          const newCase: TestCase = {
              ...editCase,
              id: `tc-${Date.now()}`,
              status: "UNTESTED",
              priority: editCase.priority || "MEDIUM",
              authorId: currentUser!.id,
              history: []
          } as TestCase;
          setTestCases([newCase, ...testCases]);
      }
      setShowCaseModal(false);
      setEditCase({});
  };

  const handleDeleteCase = (id: string) => {
      if(confirm("Delete this test case?")) {
          setTestCases(testCases.filter(tc => tc.id !== id));
      }
  };
  
  const handleBulkDelete = (ids: string[]) => {
      if(confirm(`Delete ${ids.length} test cases?`)) {
          setTestCases(testCases.filter(tc => !ids.includes(tc.id)));
      }
  };

  const handleBulkStatusUpdate = (ids: string[], status: TestStatus) => {
      const timestamp = new Date().toISOString();
      setTestCases(testCases.map(tc => {
          if (ids.includes(tc.id)) {
              return {
                  ...tc,
                  status: status,
                  history: [...(tc.history || []), {
                      id: `ex-${Date.now()}-${Math.random()}`,
                      date: timestamp,
                      status: status,
                      executedBy: currentUser!.name,
                      notes: "Bulk status update",
                  }]
              };
          }
          return tc;
      }));
  };

  const handleBulkMove = (ids: string[], targetSuiteId: string | null) => {
      setTestCases(testCases.map(tc => {
          if (ids.includes(tc.id)) {
              return { ...tc, suiteId: targetSuiteId || undefined };
          }
          return tc;
      }));
  };

  const handleGenerateSteps = async () => {
      setLoadingAI(true);
      const steps = await generateTestSteps(editCase.title || "", editCase.description || "");
      setEditCase({ ...editCase, steps });
      setLoadingAI(false);
  };
  
  const handleGenerateMockup = async () => {
      setLoadingAI(true);
      const img = await generateImage(editCase.title + " " + editCase.userStory, "reference");
      if (img) setEditCase({ ...editCase, visualReference: img });
      setLoadingAI(false);
  };

  const handleExecute = (status: TestStatus) => {
      if (!editCase.id) return;
      const updatedCase = {
          ...editCase,
          status,
          history: [...(editCase.history || []), {
              id: `ex-${Date.now()}`,
              date: new Date().toISOString(),
              status,
              executedBy: currentUser!.name,
              notes: executionNote,
              bugId: status === "FAILED" ? executionBugId : undefined,
              environment: executionEnv,
              evidence: executionEvidence
          }]
      } as TestCase;

      setTestCases(testCases.map(tc => tc.id === updatedCase.id ? updatedCase : tc));
      setExecutionNote("");
      setExecutionBugId("");
      setExecutionEnv("QA");
      setExecutionEvidence("");
      setShowCaseModal(false);
  };

  // --- Suite Handlers ---
  const handleCreateSuite = (projectId: string, parentId: string | null, name: string) => {
      const newSuite: TestSuite = {
          id: `suite-${Date.now()}`,
          projectId,
          name,
          parentId,
          createdAt: new Date().toISOString()
      };
      setSuites([...suites, newSuite]);
  };

  const handleRenameSuite = (id: string, name: string) => {
      setSuites(suites.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleDeleteSuite = (id: string) => {
      if (confirm("Delete this suite? Test cases inside will be moved to root.")) {
          // Move cases to root
          setTestCases(testCases.map(tc => tc.suiteId === id ? { ...tc, suiteId: undefined } : tc));
          setSuites(suites.filter(s => s.id !== id));
      }
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={!currentUser ? <LoginView users={users} onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route element={currentUser ? <MainLayout 
            currentUser={currentUser} 
            projects={projects} 
            onLogout={handleLogout} 
            t={t}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
        /> : <Navigate to="/login" />}>
            
            <Route path="/" element={<DashboardView 
                testCases={testCases}
                projects={projects}
                currentUser={currentUser!}
                searchQuery={searchQuery}
                onNewProject={() => { setEditingProject(null); setShowNewProjectModal(true); }}
                onProjectClick={(id) => navigate(`/project/${id}`)}
                onDeleteProject={handleDeleteProject}
                onEditProject={(p) => { setEditingProject(p); setShowNewProjectModal(true); }}
            />} />
            
            <Route path="/projects" element={<ProjectListView 
                projects={projects}
                testCases={testCases}
                currentUser={currentUser!}
                searchQuery={searchQuery}
                onNewProject={() => { setEditingProject(null); setShowNewProjectModal(true); }}
                onProjectClick={(id) => navigate(`/project/${id}`)}
                onDeleteProject={handleDeleteProject}
                onEditProject={(p) => { setEditingProject(p); setShowNewProjectModal(true); }}
            />} />

            <Route path="/project/:projectId" element={
                <ProjectDetailRoute 
                    projects={projects} 
                    testCases={testCases}
                    suites={suites}
                    currentUser={currentUser} 
                    users={users} 
                    searchQuery={searchQuery} 
                    jiraUrl={jiraUrl}
                    setEditCase={setEditCase}
                    setShowCaseModal={setShowCaseModal}
                    handleDeleteCase={handleDeleteCase}
                    handleBulkDelete={handleBulkDelete}
                    handleBulkStatusUpdate={handleBulkStatusUpdate}
                    handleBulkMove={handleBulkMove}
                    setHistoryViewCase={setHistoryViewCase}
                    handleCreateSuite={handleCreateSuite}
                    handleRenameSuite={handleRenameSuite}
                    handleDeleteSuite={handleDeleteSuite}
                />
            } />

            <Route path="/project/:projectId/case/:testCaseId" element={
                <TestCaseDetailRoute 
                    projects={projects} 
                    testCases={testCases} 
                    users={users} 
                    currentUser={currentUser}
                    setEditCase={setEditCase}
                    setShowCaseModal={setShowCaseModal}
                    handleDeleteCase={handleDeleteCase}
                />
            } />

            <Route path="/settings" element={
                <SettingsView currentUser={currentUser!} jiraUrl={jiraUrl} setJiraUrl={setJiraUrl} />
            } />
        </Route>
      </Routes>

      {/* Global Modals */}
      {showNewProjectModal && (
          <NewProjectModal 
            onClose={() => setShowNewProjectModal(false)}
            onSubmit={handleCreateProject}
            loadingAI={loadingAI}
            initialData={editingProject}
          />
      )}

      {showCaseModal && (
          <TestCaseModal 
            editCase={editCase}
            setEditCase={setEditCase}
            onClose={() => setShowCaseModal(false)}
            onSave={handleSaveTestCase}
            loadingAI={loadingAI}
            onGenerateSteps={handleGenerateSteps}
            onGenerateImage={handleGenerateMockup}
            currentUser={currentUser!}
            executionNote={executionNote}
            setExecutionNote={setExecutionNote}
            executionBugId={executionBugId}
            setExecutionBugId={setExecutionBugId}
            executionEnv={executionEnv}
            setExecutionEnv={setExecutionEnv}
            executionEvidence={executionEvidence}
            setExecutionEvidence={setExecutionEvidence}
            onExecute={handleExecute}
            suites={suites}
          />
      )}
      
      {historyViewCase && (
          <HistoryModal 
            testCase={historyViewCase}
            onClose={() => setHistoryViewCase(null)}
            defectTrackerUrl={jiraUrl}
          />
      )}
    </>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <LanguageProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </LanguageProvider>
);
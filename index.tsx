import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { 
  User, Project, TestCase, TestStatus, ExecutionRecord, Priority 
} from "./types";
import { generateTestSteps, generateImage, generateAvatar } from "./api";
import { SidebarItem } from "./components/ui";
import { NewProjectModal } from "./components/NewProjectModal";
import { TestCaseModal } from "./components/TestCaseModal";
import { HistoryModal } from "./components/HistoryModal";

import { LoginView } from "./views/LoginView";
import { DashboardView } from "./views/DashboardView";
import { ProjectListView } from "./views/ProjectListView";
import { ProjectDetailView } from "./views/ProjectDetailView";
import { SettingsView } from "./views/SettingsView";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext"; // Added and moved to top level

import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Settings,
  LogOut,
  Sparkles,
  Search,
  Menu,
  Command
} from "lucide-react";

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

function App() {
  const { t } = useLanguage(); // Correctly placed inside the App component
  // --- State ---
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  
  const [view, setView] = useState<"DASHBOARD" | "PROJECTS" | "PROJECT" | "SETTINGS">("DASHBOARD");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    // Avatar Generation - Sequential to respect rate limits
    const initAvatars = async () => {
        const storedUsers = localStorage.getItem("nexus_users_v2");
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            // Clone users for processing
            const usersToProcess = [...users];
            let updated = false;
            
            for (let i = 0; i < usersToProcess.length; i++) {
                const u = usersToProcess[i];
                // Only generate if it's a placeholder avatar
                if (u.avatar.includes("dicebear")) {
                    try {
                       // Check local cache first to avoid re-generation and quota issues
                       const cacheKey = `avatar_cache_${u.name}`;
                       const cachedAvatar = localStorage.getItem(cacheKey);
                       
                       if (cachedAvatar) {
                           usersToProcess[i] = { ...u, avatar: cachedAvatar };
                           updated = true;
                           continue; 
                       }

                       // Artificial delay to prevent quota limits
                       if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
                       
                       const avatar = await generateAvatar(u.name, u.role);
                       if (avatar) {
                           usersToProcess[i] = { ...u, avatar };
                           updated = true;
                           try {
                               localStorage.setItem(cacheKey, avatar);
                           } catch (e) {
                               console.warn("Storage quota exceeded, could not cache avatar for", u.name);
                           }
                           // Incrementally update state to show progress
                           setUsers([...usersToProcess]); 
                       }
                    } catch (e) {
                        console.warn("Skipping avatar generation due to quota/error for", u.name);
                    }
                }
            }
            
            if (updated) {
                try {
                    localStorage.setItem("nexus_users_v2", JSON.stringify(usersToProcess));
                } catch (e) {
                     console.warn("Storage quota exceeded, could not save full user list.");
                }
            }
        }
    };
    initAvatars();

    const storedCases = localStorage.getItem("gemini_test_cases");
    if (storedCases) {
      const parsed = JSON.parse(storedCases);
      if (parsed.length === 0) {
         setTestCases(INITIAL_TEST_CASES); 
      } else {
         setTestCases(parsed);
      }
    } else {
      setTestCases(INITIAL_TEST_CASES);
    }
    
    const storedProjects = localStorage.getItem("gemini_projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      generateInitialCovers();
    }

    const storedJiraUrl = localStorage.getItem("gemini_jira_url");
    if (storedJiraUrl) setJiraUrl(storedJiraUrl);
  }, []);

  useEffect(() => {
    localStorage.setItem("gemini_test_cases", JSON.stringify(testCases));
  }, [testCases]);

  useEffect(() => {
    localStorage.setItem("gemini_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("gemini_jira_url", jiraUrl);
  }, [jiraUrl]);

  const generateInitialCovers = async () => {
      const projs = [...INITIAL_PROJECTS];
      let updated = false;
      for (let i = 0; i < projs.length; i++) {
          if (!projs[i].coverImage) {
              try {
                  // Artificial delay to prevent quota limits
                  if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));
                  const cover = await generateImage(projs[i].description, "project");
                  if (cover) {
                      projs[i].coverImage = cover;
                      updated = true;
                      setProjects([...projs]); // Incremental update
                  }
              } catch(e) {
                  console.warn("Skipping cover generation for", projs[i].name);
              }
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
    setView("DASHBOARD");
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    setLoadingAI(true);
    let cover = editingProject?.coverImage;
    
    if (!cover) {
        // Only generate if new or no cover exists
        cover = await generateImage(data.description || data.name || "project", "project") || undefined;
    }

    if (editingProject) {
        // Update
        setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...data, coverImage: cover } as Project : p));
    } else {
        // Create
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
          if (selectedProjectId === id) {
              setSelectedProjectId(null);
              setView("DASHBOARD");
          }
      }
  };

  const handleSaveTestCase = () => {
      if (!editCase.title || !editCase.projectId) return;
      
      if (editCase.id) {
          // Update
          setTestCases(testCases.map(tc => tc.id === editCase.id ? { ...tc, ...editCase } as TestCase : tc));
      } else {
          // Create
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
              const newRecord: ExecutionRecord = {
                  id: `ex-${Date.now()}-${Math.random()}`,
                  date: timestamp,
                  status: status,
                  executedBy: currentUser!.name,
                  notes: "Bulk status update",
              };
              return {
                  ...tc,
                  status: status,
                  history: [...(tc.history || []), newRecord]
              };
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
      
      const newRecord: ExecutionRecord = {
          id: `ex-${Date.now()}`,
          date: new Date().toISOString(),
          status,
          executedBy: currentUser!.name,
          notes: executionNote,
          bugId: status === "FAILED" ? executionBugId : undefined,
          environment: executionEnv,
          evidence: executionEvidence
      };

      const updatedCase = {
          ...editCase,
          status,
          history: [...(editCase.history || []), newRecord]
      } as TestCase;

      setTestCases(testCases.map(tc => tc.id === updatedCase.id ? updatedCase : tc));
      
      // Reset form
      setExecutionNote("");
      setExecutionBugId("");
      setExecutionEnv("QA");
      setExecutionEvidence("");
      setShowCaseModal(false);
  };

  // --- View Routing ---
  
  if (!currentUser) {
    return <LoginView users={users} onLogin={handleLogin} />;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectCases = testCases.filter(tc => tc.projectId === selectedProjectId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F0E9] text-[#18181B]">
      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? "w-64" : "w-20"} 
        bg-[#FFFFFF] border-r border-zinc-200 flex flex-col transition-all duration-300 z-20 shadow-sm
      `}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-center">
            {isSidebarOpen ? (
                <h1 className="text-2xl font-black tracking-tighter text-zinc-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    Nexus
                </h1>
            ) : (
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md">
                    <Briefcase className="w-5 h-5" />
                </div>
            )}
        </div>

        {/* Nav Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label={t("app.dashboard")} 
            active={view === "DASHBOARD"} 
            collapsed={!isSidebarOpen}
            onClick={() => { setView("DASHBOARD"); setSelectedProjectId(null); }}
          />
          <SidebarItem 
            icon={<Briefcase className="w-5 h-5" />} 
            label={t("app.projects")} 
            active={view === "PROJECTS" || view === "PROJECT"} 
            collapsed={!isSidebarOpen}
            onClick={() => { setView("PROJECTS"); setSelectedProjectId(null); }}
          />
          
          <div className="my-4 border-t border-zinc-100"></div>
          
          {/* Quick Project Access */}
          {isSidebarOpen && <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t("app.recent")}</p>}
          {projects.slice(0, 5).map(p => (
             <SidebarItem
                key={p.id}
                icon={<div className="w-2 h-2 rounded-full bg-yellow-400"></div>}
                label={p.name}
                active={selectedProjectId === p.id}
                collapsed={!isSidebarOpen}
                onClick={() => { setSelectedProjectId(p.id); setView("PROJECT"); }}
             />
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
            <div className={`flex items-center ${!isSidebarOpen ? 'justify-center' : 'gap-3'}`}>
                <img src={currentUser.avatar} className="w-9 h-9 rounded-full border border-zinc-200 shadow-sm" alt="Profile" />
                {isSidebarOpen && (
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-zinc-800 truncate">{currentUser.name}</p>
                        <p className="text-[10px] font-medium text-zinc-500 truncate">{t(`role.${currentUser.role}` as any)}</p>
                    </div>
                )}
            </div>
            {isSidebarOpen && (
                <div className="flex gap-1 mt-3">
                    <button onClick={() => setView("SETTINGS")} className="flex-1 p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors" title={t("app.settings")}>
                        <Settings className="w-4 h-4 mx-auto" />
                    </button>
                    <button onClick={handleLogout} className="flex-1 p-1.5 rounded-lg hover:bg-red-100 text-zinc-500 hover:text-red-500 transition-colors" title={t("app.logout")}>
                        <LogOut className="w-4 h-4 mx-auto" />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {/* Top Bar */}
         <header className="h-16 px-8 flex items-center justify-between bg-[#F2F0E9] z-10">
             <div className="flex items-center gap-4">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-600">
                     <Menu className="w-5 h-5" />
                 </button>
                 {/* Search Bar */}
                 <div className="relative group hidden md:block">
                     <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                     <input 
                        type="text" 
                        placeholder={t("app.search")} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full bg-white border border-zinc-200 text-sm w-64 focus:w-80 transition-all outline-none focus:ring-2 focus:ring-zinc-900/5 shadow-sm text-zinc-800 placeholder-zinc-400"
                     />
                     <div className="absolute right-3 top-2.5 flex items-center gap-1 pointer-events-none">
                        <span className="text-[10px] font-bold text-zinc-300 border border-zinc-200 rounded px-1">⌘ K</span>
                     </div>
                 </div>
             </div>
             
             <div className="flex items-center gap-3">
                 <div className="h-8 px-3 rounded-full bg-white border border-zinc-200 flex items-center gap-2 shadow-sm">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-xs font-bold text-zinc-600">{t("app.system_online")}</span>
                 </div>
             </div>
         </header>

         {/* View Content */}
         <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
            {view === "DASHBOARD" && (
                <DashboardView 
                    testCases={testCases}
                    projects={projects}
                    currentUser={currentUser}
                    searchQuery={searchQuery}
                    onNewProject={() => { setEditingProject(null); setShowNewProjectModal(true); }}
                    onProjectClick={(id) => { setSelectedProjectId(id); setView("PROJECT"); }}
                    onDeleteProject={handleDeleteProject}
                    onEditProject={(p) => { setEditingProject(p); setShowNewProjectModal(true); }}
                />
            )}

            {view === "PROJECTS" && (
                <ProjectListView 
                    projects={projects}
                    testCases={testCases}
                    currentUser={currentUser}
                    searchQuery={searchQuery}
                    onNewProject={() => { setEditingProject(null); setShowNewProjectModal(true); }}
                    onProjectClick={(id) => { setSelectedProjectId(id); setView("PROJECT"); }}
                    onDeleteProject={handleDeleteProject}
                    onEditProject={(p) => { setEditingProject(p); setShowNewProjectModal(true); }}
                />
            )}
            
            {view === "PROJECT" && selectedProject && (
                <ProjectDetailView 
                    project={selectedProject}
                    testCases={projectCases}
                    currentUser={currentUser}
                    users={users}
                    searchQuery={searchQuery}
                    defectTrackerUrl={jiraUrl}
                    onExport={() => alert("Exporting feature coming soon!")}
                    onCreateCase={() => { setEditCase({ projectId: selectedProject.id }); setShowCaseModal(true); }}
                    onEditCase={(tc) => { setEditCase(tc); setShowCaseModal(true); }}
                    onDeleteCase={handleDeleteCase}
                    onDuplicateCase={(tc) => {
                        const dupe = { ...tc, id: undefined, title: `${tc.title} (Copy)`, status: "UNTESTED", history: [] };
                        setEditCase(dupe);
                        setShowCaseModal(true);
                    }}
                    onViewHistory={(tc) => setHistoryViewCase(tc)}
                    onBulkDelete={handleBulkDelete}
                    onBulkStatusUpdate={handleBulkStatusUpdate}
                />
            )}

            {view === "SETTINGS" && (
                <SettingsView 
                    currentUser={currentUser} 
                    jiraUrl={jiraUrl}
                    setJiraUrl={setJiraUrl}
                />
            )}
         </main>
      </div>

      {/* Modals */}
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
            currentUser={currentUser}
            executionNote={executionNote}
            setExecutionNote={setExecutionNote}
            executionBugId={executionBugId}
            setExecutionBugId={setExecutionBugId}
            executionEnv={executionEnv}
            setExecutionEnv={setExecutionEnv}
            executionEvidence={executionEvidence}
            setExecutionEvidence={setExecutionEvidence}
            onExecute={handleExecute}
          />
      )}
      
      {historyViewCase && (
          <HistoryModal 
            testCase={historyViewCase}
            onClose={() => setHistoryViewCase(null)}
            defectTrackerUrl={jiraUrl}
          />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
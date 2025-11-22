"use client";

import React, { useState, useEffect } from "react";
import { User, Project, TestCase, TestStatus, ExecutionRecord, TestSuite } from "@/types";
import { generateTestSteps, generateImage, generateAvatar } from "@/api";
import { NewProjectModal } from "@/components/NewProjectModal";
import { TestCaseModal } from "@/components/TestCaseModal";
import { HistoryModal } from "@/components/HistoryModal";

import { LoginView } from "@/views/LoginView";
import { DashboardView } from "@/views/DashboardView";
import { ProjectListView } from "@/views/ProjectListView";
import { ProjectDetailView } from "@/views/ProjectDetailView";
import { SettingsView } from "@/views/SettingsView";
import { TestCaseDetailView } from "@/views/TestCaseDetailView";
import { MainLayout } from "@/layouts/MainLayout";

import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";

// --- Mock Data for Users (Still Client-Side for now) ---
const MOCK_USERS: User[] = [
  { id: "u1", name: "Sarah Jenkins", role: "ADMIN", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "u2", name: "David Chen", role: "QA_LEAD", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { id: "u3", name: "Emily Rodriguez", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
  { id: "u4", name: "Michael Chang", role: "TESTER", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
];

// Helper for image compression (Client-Side)
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

export default function Home() {
  // We use Client-Side Routing inside this single Next.js Page for migration speed.
  // In a full Next.js app, these would be separate pages in `app/`.
  return (
    <LanguageProvider>
        {/* Suppress hydration warning for now as we are doing full client-side rendering */}
        <div suppressHydrationWarning>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </div>
    </LanguageProvider>
  );
}

function AppShell() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // --- State ---
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
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

  // --- Data Fetching (API) ---
  useEffect(() => {
      fetchData();
      
      // Load Users (Avatars) - Keep local for now or move to API later
      // ... (Avatar logic omitted for brevity, assuming MOCK_USERS works)
  }, []);

  const fetchData = async () => {
      try {
          const [pRes, tcRes, sRes] = await Promise.all([
              fetch('/api/projects'),
              fetch('/api/testcases'),
              fetch('/api/suites')
          ]);
          
          const pData = await pRes.json();
          const tcData = await tcRes.json();
          const sData = await sRes.json();

          setProjects(pData);
          setTestCases(tcData);
          setSuites(sData);
      } catch (error) {
          console.error("Failed to fetch data:", error);
      }
  };

  // --- Handlers (API) ---

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  const handleCreateProject = async (data: Partial<Project>) => {
    setLoadingAI(true);
    let cover = editingProject?.coverImage;
    
    // If no cover, try to generate one (Client-side AI call, or move to Server later)
    if (!cover) {
        cover = await generateImage(data.description || data.name || "project", "project") || undefined;
    }

    const payload = { ...data, coverImage: cover };

    try {
        if (editingProject) {
            // UPDATE (TODO: Add PUT endpoint or handle in POST)
            // For now, we'll just simulate or add PUT. Let's use POST for create.
            // We need a PUT endpoint for projects.
            // Let's just update local state for now if editing, or implement PUT.
            // Assuming we strictly follow API:
            // await fetch(`/api/projects/${editingProject.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            // Since I didn't create dynamic route for projects yet, let's focus on CREATE.
            console.warn("Edit Project API not implemented yet");
        } else {
            // CREATE
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newProject = await res.json();
                setProjects([newProject, ...projects]);
            }
        }
    } catch (e) {
        console.error("Error creating project", e);
    }
    
    setLoadingAI(false);
    setShowNewProjectModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string) => {
      if (confirm("Are you sure? All test cases in this project will be deleted.")) {
          // TODO: Implement DELETE API
          setProjects(projects.filter(p => p.id !== id));
      }
  };

  const handleSaveTestCase = async () => {
      if (!editCase.title || !editCase.projectId) return;
      
      try {
          const res = await fetch('/api/testcases', {
              method: 'POST', // Handles both Create (new ID) and Update (existing ID)
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(editCase)
          });
          
          if (res.ok) {
              const savedCase = await res.json();
              if (editCase.id) {
                  setTestCases(testCases.map(tc => tc.id === savedCase.id ? savedCase : tc));
              } else {
                  setTestCases([savedCase, ...testCases]);
              }
          }
      } catch (e) {
          console.error("Error saving test case", e);
      }
      
      setShowCaseModal(false);
      setEditCase({});
  };

  const handleDeleteTestCase = async (id: string) => {
      if(confirm("Delete this test case?")) {
          await fetch(`/api/testcases?id=${id}`, { method: 'DELETE' });
          setTestCases(testCases.filter(tc => tc.id !== id));
      }
  };
  
  const handleBulkDelete = async (ids: string[]) => {
      if(confirm(`Delete ${ids.length} test cases?`)) {
          await fetch(`/api/testcases?ids=${ids.join(',')}`, { method: 'DELETE' });
          setTestCases(testCases.filter(tc => !ids.includes(tc.id)));
      }
  };

  const handleBulkStatusUpdate = async (ids: string[], status: TestStatus) => {
      const timestamp = new Date().toISOString();
      // Optimistic Update
      const updates = { status }; // Simplified history for bulk
      
      await fetch('/api/testcases', { 
          method: 'PUT', 
          body: JSON.stringify({ ids, updates }) 
      });

      setTestCases(testCases.map(tc => {
          if (ids.includes(tc.id)) {
              return { ...tc, status };
          }
          return tc;
      }));
  };

  const handleBulkMove = async (ids: string[], targetSuiteId: string | null) => {
      await fetch('/api/testcases', {
          method: 'PUT',
          body: JSON.stringify({ ids, updates: { suiteId: targetSuiteId || undefined } })
      });
      
      setTestCases(testCases.map(tc => {
          if (ids.includes(tc.id)) {
              return { ...tc, suiteId: targetSuiteId || undefined };
          }
          return tc;
      }));
  };

  // Suite Handlers
  const handleCreateSuite = async (projectId: string, parentId: string | null, name: string) => {
      const res = await fetch('/api/suites', {
          method: 'POST',
          body: JSON.stringify({ projectId, parentId, name })
      });
      if (res.ok) {
          const newSuite = await res.json();
          setSuites([...suites, newSuite]);
      }
  };

  const handleRenameSuite = async (id: string, name: string) => {
      await fetch('/api/suites', { method: 'PUT', body: JSON.stringify({ id, name }) });
      setSuites(suites.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleDeleteSuite = async (id: string) => {
      if (confirm("Delete this suite?")) {
          await fetch(`/api/suites?id=${id}`, { method: 'DELETE' });
          setSuites(suites.filter(s => s.id !== id));
          // Refresh test cases to update their suiteId (server logic should handle clearing it, or we do it locally)
          fetchData(); 
      }
  };

  // AI & Execution
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

  const handleExecute = async (status: TestStatus) => {
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

      // Save via API
      await fetch('/api/testcases', {
          method: 'POST',
          body: JSON.stringify(updatedCase)
      });

      setTestCases(testCases.map(tc => tc.id === updatedCase.id ? updatedCase : tc));
      
      setExecutionNote("");
      setExecutionBugId("");
      setExecutionEnv("QA");
      setExecutionEvidence("");
      setShowCaseModal(false);
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
                    handleDeleteCase={handleDeleteTestCase}
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
                    handleDeleteCase={handleDeleteTestCase}
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

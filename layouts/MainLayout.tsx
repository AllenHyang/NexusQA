"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarItem } from "@/components/ui";
import { LayoutDashboard, Briefcase, Menu, LogOut, Search, Settings, X, Users } from "lucide-react";
import { User, Project } from "@/types";
import { APP_VERSION } from "@/lib/version";
import { useUI } from "@/contexts/UIContext";
import { NotificationBell } from "@/components/NotificationBell";

interface MainLayoutProps {
    currentUser: User;
    projects: Project[];
    onLogout: () => void;
    t: (key: string) => string;
    children: React.ReactNode;
}

export function MainLayout({ currentUser, projects, onLogout, t, children }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop collapse state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile drawer state
    const pathname = usePathname();
    const router = useRouter();
    const { searchQuery, setSearchQuery } = useUI();

    // Auto-close mobile menu on navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Handle Toggle Logic
    const toggleSidebar = () => {
        if (window.innerWidth >= 768) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#F2F0E9] text-[#18181B]">
            
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 
                bg-[#FFFFFF] border-r border-zinc-200 flex flex-col transition-all duration-300 shadow-xl md:shadow-sm
                ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}
                ${isSidebarOpen ? "md:w-64" : "md:w-20"}
            `}>
                {/* Logo Area */}
                <div className="p-6 flex items-center justify-between md:justify-center relative">
                    {(isSidebarOpen || isMobileMenuOpen) ? (
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
                    
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 text-zinc-400 hover:text-zinc-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarItem 
                        icon={<LayoutDashboard className="w-5 h-5" />} 
                        label={t("app.dashboard")} 
                        active={pathname === "/"} 
                        collapsed={!isSidebarOpen && !isMobileMenuOpen}
                        onClick={() => router.push("/")}
                    />
                    <SidebarItem
                        icon={<Briefcase className="w-5 h-5" />}
                        label={t("app.projects")}
                        active={pathname?.startsWith("/projects") || pathname?.startsWith("/project/")}
                        collapsed={!isSidebarOpen && !isMobileMenuOpen}
                        onClick={() => router.push("/projects")}
                    />
                    <SidebarItem
                        icon={<Users className="w-5 h-5" />}
                        label={t("app.users")}
                        active={pathname === "/users"}
                        collapsed={!isSidebarOpen && !isMobileMenuOpen}
                        onClick={() => router.push("/users")}
                    />

                    <div className="my-4 border-t border-zinc-100"></div>
                    
                    {/* Quick Project Access */}
                    {(isSidebarOpen || isMobileMenuOpen) && <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em] mb-3">{t("app.recent")}</p>}
                    {projects.slice(0, 5).map(p => (
                        <SidebarItem 
                            key={p.id}
                            icon={<div className="w-2 h-2 rounded-full bg-yellow-400"></div>}
                            label={p.name}
                            collapsed={!isSidebarOpen && !isMobileMenuOpen}
                            active={pathname === `/project/${p.id}`}
                            onClick={() => router.push(`/project/${p.id}`)}
                        />
                    ))}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-zinc-100">
                    <div
                        onClick={() => router.push("/settings")}
                        className={`flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group ${(!isSidebarOpen && !isMobileMenuOpen) && "justify-center"}`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentUser.avatar} className="w-9 h-9 rounded-full border border-zinc-200 shadow-sm flex-shrink-0" alt="User" />
                        {(isSidebarOpen || isMobileMenuOpen) && (
                            <div className="flex-1 min-w-0 mr-1">
                                <p className="text-sm font-bold text-zinc-900 truncate">{currentUser.name}</p>
                                <p className="text-xs text-zinc-500 truncate capitalize">{currentUser.role.replace('_', ' ').toLowerCase()}</p>
                            </div>
                        )}
                        {(isSidebarOpen || isMobileMenuOpen) && (
                            <div className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors flex-shrink-0">
                                <Settings className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onLogout}
                        className={`mt-2 w-full flex items-center ${(isSidebarOpen || isMobileMenuOpen) ? "px-3" : "justify-center"} py-3 md:py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors`}
                    >
                        <LogOut className={`w-4 h-4 ${(isSidebarOpen || isMobileMenuOpen) && "mr-2"}`} />
                        {(isSidebarOpen || isMobileMenuOpen) && "Sign Out"}
                    </button>
                    {/* Version */}
                    <div className={`mt-3 pt-3 border-t border-zinc-100 text-center ${(!isSidebarOpen && !isMobileMenuOpen) && "hidden"}`}>
                        <span className="text-[10px] font-medium text-zinc-400">v{APP_VERSION}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F2F0E9] relative transition-all duration-300">
                 {/* Top Header */}
                 <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10 gap-4">
                     <div className="flex items-center gap-4 flex-1">
                         <button 
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors shrink-0 active:scale-95"
                         >
                             <Menu className="w-6 h-6 md:w-5 md:h-5" />
                         </button>
                         <div className="relative group flex-1 max-w-96">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                             <input 
                                type="text" 
                                placeholder={t("app.search_placeholder")} 
                                className="w-full pl-10 pr-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 hidden sm:flex">
                                <span className="text-[10px] font-bold text-zinc-300 border border-zinc-200 rounded px-1">⌘ K</span>
                             </div>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-3 shrink-0">
                         <NotificationBell
                             userId={currentUser.id}
                             onNotificationClick={(notification) => {
                                 if (notification.projectId && notification.requirementId) {
                                     // 跳转到需求详情的基本信息 Tab（评论在各 Tab 下方）
                                     router.push(`/project/${notification.projectId}?selected=${notification.requirementId}&openTab=BASIC`);
                                 }
                             }}
                         />
                         <div className="h-8 px-3 rounded-full bg-white border border-zinc-200 flex items-center gap-2 shadow-sm">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="hidden sm:inline text-xs font-bold text-zinc-600">{t("app.system_online")}</span>
                             <span className="sm:hidden text-xs font-bold text-zinc-600">Online</span>
                         </div>
                     </div>
                 </header>

                 {/* View Content */}
                 <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                    {children}
                 </main>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarItem } from "@/components/ui";
import { LayoutDashboard, Briefcase, Menu, LogOut, Search, Settings } from "lucide-react";
import { User, Project } from "@/types";
import { useUI } from "@/contexts/UIContext";

interface MainLayoutProps {
    currentUser: User;
    projects: Project[];
    onLogout: () => void;
    t: (key: string) => string;
    children: React.ReactNode;
}

export function MainLayout({ currentUser, projects, onLogout, t, children }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const { searchQuery, setSearchQuery } = useUI();

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
                        active={pathname === "/"} 
                        collapsed={!isSidebarOpen}
                        onClick={() => router.push("/")}
                    />
                    <SidebarItem 
                        icon={<Briefcase className="w-5 h-5" />} 
                        label={t("app.projects")} 
                        active={pathname?.startsWith("/projects") || pathname?.startsWith("/project/")} 
                        collapsed={!isSidebarOpen}
                        onClick={() => router.push("/projects")}
                    />
                    
                    <div className="my-4 border-t border-zinc-100"></div>
                    
                    {/* Quick Project Access */}
                    {isSidebarOpen && <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t("app.recent")}</p>}
                    {projects.slice(0, 5).map(p => (
                        <SidebarItem 
                            key={p.id}
                            icon={<div className="w-2 h-2 rounded-full bg-yellow-400"></div>}
                            label={p.name}
                            collapsed={!isSidebarOpen}
                            active={pathname === `/project/${p.id}`}
                            onClick={() => router.push(`/project/${p.id}`)}
                        />
                    ))}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-zinc-100">
                    <div 
                        onClick={() => router.push("/settings")}
                        className={`flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group ${!isSidebarOpen && "justify-center"}`}
                    >
                        <img src={currentUser.avatar} className="w-9 h-9 rounded-full border border-zinc-200 shadow-sm" alt="User" />
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 truncate">{currentUser.name}</p>
                                <p className="text-xs text-zinc-500 truncate capitalize">{currentUser.role.replace('_', ' ').toLowerCase()}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <div className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                                <Settings className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onLogout}
                        className={`mt-2 w-full flex items-center ${isSidebarOpen ? "px-3" : "justify-center"} py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors`}
                    >
                        <LogOut className={`w-4 h-4 ${isSidebarOpen && "mr-2"}`} />
                        {isSidebarOpen && "Sign Out"}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F2F0E9] relative">
                 {/* Top Header */}
                 <header className="h-16 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10">
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                         >
                             <Menu className="w-5 h-5" />
                         </button>
                         <div className="relative group w-96">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                             <input 
                                type="text" 
                                placeholder={t("app.search_placeholder")} 
                                className="w-full pl-10 pr-4 py-2 bg-zinc-100/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                             />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
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
                 <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                    {children}
                 </main>
            </div>
        </div>
    );
}

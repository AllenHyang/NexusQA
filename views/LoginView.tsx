import React from "react";
import { User } from "../types";
import { Briefcase, User as UserIcon, ArrowRight, Sparkles } from "lucide-react";

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

export function LoginView({ users, onLogin }: LoginViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-[#F2F0E9]">
      
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-200/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 items-center relative z-10">
        
        {/* Left Side: Brand */}
        <div className="text-center lg:text-left space-y-6">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 shadow-xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-5xl lg:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9]">
             Nexus<span className="text-yellow-500">QA</span>
           </h1>
           <p className="text-zinc-500 text-lg font-medium max-w-md leading-relaxed">
             Next-generation test management powered by generative AI. Simple, clean, and intelligent.
           </p>
           
           <div className="flex gap-3 pt-4 justify-center lg:justify-start">
              <div className="px-4 py-2 rounded-full bg-white border border-zinc-200 text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center shadow-sm">
                 <Sparkles className="w-3 h-3 mr-2 text-yellow-500" /> Gemini 2.5
              </div>
           </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="bento-card p-10 rounded-[3rem] bg-white shadow-2xl border border-white/50">
           <div className="mb-8">
              <h2 className="text-2xl font-bold text-zinc-900">Select Account</h2>
              <p className="text-zinc-400 text-sm mt-1">Choose a profile to enter the dashboard.</p>
           </div>

           <div className="space-y-3">
              {users.map((user, idx) => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="w-full group relative overflow-hidden p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:shadow-lg hover:border-zinc-200 transition-all duration-300 text-left flex items-center"
                  style={{ animation: `fade-in-up 0.5s ease-out ${idx * 0.1}s backwards` }}
                >
                  <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform" />
                  </div>
                  
                  <div className="ml-4 flex-1">
                     <div className="text-base font-bold text-zinc-800">{user.name}</div>
                     <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-yellow-600 transition-colors">{user.role.replace("_", " ")}</div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center transition-all transform group-hover:translate-x-0 opacity-0 group-hover:opacity-100 -translate-x-4">
                      <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
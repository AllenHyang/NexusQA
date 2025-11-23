import React from "react";
import { TestStep } from "@/types";
import { Plus, Sparkles, XCircle } from "lucide-react";
import { AILoader } from "../ui";

interface TestStepListProps {
  steps: TestStep[];
  onUpdateSteps: (steps: TestStep[]) => void;
  onGenerate: () => void;
  loadingAI: boolean;
  hasTitle: boolean;
}

export function TestStepList({ steps, onUpdateSteps, onGenerate, loadingAI, hasTitle }: TestStepListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Test Steps</label>
        <button 
          onClick={onGenerate}
          disabled={loadingAI || !hasTitle}
          className="text-xs bg-zinc-900 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-black transition-all flex items-center font-bold disabled:opacity-50 disabled:cursor-not-allowed group transform hover:-translate-y-0.5">
          {loadingAI ? <AILoader /> : <Sparkles className="w-3.5 h-3.5 mr-1.5 group-hover:text-yellow-400 transition-colors" />}
          <span className="ml-1">{steps && steps.length > 0 ? "Regenerate with AI" : "Generate with AI"}</span>
        </button>
      </div>
      <div className="space-y-3">
        {steps?.map((step, idx) => (
          <div key={step.id || idx} className="flex items-start p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm group hover:border-zinc-300 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300" style={{animationDelay: `${idx * 50}ms`}}>
            <span className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-bold mr-4 flex-shrink-0 mt-0.5 group-hover:bg-zinc-900 group-hover:text-white transition-all">{idx + 1}</span>
            <div className="flex-1">
              <p className="font-bold text-zinc-800 text-sm leading-relaxed">{step.action}</p>
              <p className="text-zinc-500 mt-1.5 text-xs font-medium bg-zinc-50 p-2 rounded-lg inline-block border border-zinc-100">Expect: {step.expected}</p>
            </div>
            <button onClick={() => {
              const newSteps = steps.filter((_, i) => i !== idx);
              onUpdateSteps(newSteps);
            }} className="text-zinc-300 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-all"><XCircle className="w-5 h-5"/></button>
          </div>
        ))}
        <button 
          onClick={() => {
            const newStep: TestStep = { id: Date.now().toString(), action: "New Action", expected: "Expected Result" };
            onUpdateSteps([...(steps || []), newStep]);
          }}
          className="w-full py-4 flex items-center justify-center border-2 border-zinc-200 border-dashed rounded-2xl text-sm text-zinc-400 hover:bg-zinc-50 hover:border-zinc-400 hover:text-zinc-600 transition-all font-bold group">
          <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Add Manual Step
        </button>
      </div>
    </div>
  );
}

import { TestStep } from "@/types";
import { Plus, Sparkles, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { AILoader } from "../ui";

interface TestStepListProps {
  steps: TestStep[];
  onUpdateSteps: (steps: TestStep[]) => void;
  onGenerate: () => void;
  loadingAI: boolean;
  hasTitle: boolean;
  onFeedback: (stepId: string, feedback: 'up' | 'down') => void; // New prop
}

export function TestStepList({ steps, onUpdateSteps, onGenerate, loadingAI, hasTitle, onFeedback }: TestStepListProps) {
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
            <div className="flex-1 grid grid-cols-1 gap-2">
              <input 
                type="text"
                value={step.action}
                onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[idx] = { ...step, action: e.target.value };
                    onUpdateSteps(newSteps);
                }}
                className="w-full font-bold text-zinc-800 text-sm leading-relaxed bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 outline-none transition-all placeholder-zinc-300"
                placeholder="e.g. Click login button"
              />
              <input 
                type="text"
                value={step.expected}
                onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[idx] = { ...step, expected: e.target.value };
                    onUpdateSteps(newSteps);
                }}
                className="w-full text-zinc-500 text-xs font-medium bg-zinc-50 p-2 rounded-lg border border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-100 outline-none transition-all placeholder-zinc-300"
                placeholder="e.g. User is redirected"
              />
            </div>
            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback(step.id, 'up'); }}
                className={`p-1 rounded-md transition-colors ${step.feedback === 'up' ? 'bg-green-100 text-green-600' : 'text-zinc-400 hover:bg-zinc-100 hover:text-green-500'}`}
                title="Good result"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onFeedback(step.id, 'down'); }}
                className={`p-1 rounded-md transition-colors ${step.feedback === 'down' ? 'bg-red-100 text-red-600' : 'text-zinc-400 hover:bg-zinc-100 hover:text-red-500'}`}
                title="Bad result"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const newSteps = steps.filter((_, i) => i !== idx);
                onUpdateSteps(newSteps);
              }} className="text-zinc-300 hover:text-red-500"><XCircle className="w-5 h-5"/></button>
            </div>
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

import React, { useState } from 'react';
import { TestPlan } from '@/types';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, BarChart3, Copy } from 'lucide-react'; // Import Copy icon
import { ProgressBar } from './ui';

interface PlanListProps {
  projectId: string;
  plans: TestPlan[];
  onCreatePlan: (data: Partial<TestPlan>) => void;
  onDuplicatePlan: (planId: string) => void; // Added onDuplicatePlan prop
}

export function PlanList({ projectId, plans, onCreatePlan, onDuplicatePlan }: PlanListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const handleCreate = () => {
      if (!newPlanName.trim()) return;
      onCreatePlan({ name: newPlanName, projectId });
      setNewPlanName("");
      setIsCreating(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-zinc-900">Test Plans</h3>
            <button 
                onClick={() => setIsCreating(true)}
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black"
            >
                <Plus className="w-4 h-4 mr-2" /> New Plan
            </button>
        </div>

        {isCreating && (
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm animate-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Plan Name</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        placeholder="e.g. Release 1.0 Regression"
                        className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none"
                        autoFocus
                    />
                    <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg">Cancel</button>
                    <button onClick={handleCreate} className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg">Create</button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => (
                <div 
                    key={plan.id}
                    onClick={() => router.push(`/project/${projectId}/plans/${plan.id}`)}
                    className="group bg-white p-5 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">{plan.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1 font-medium">{plan.status}</p>
                        </div>
                        <div className="flex items-center gap-2"> {/* New div to hold multiple actions */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDuplicatePlan(plan.id); }} // Prevent navigation
                                className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                title="Duplicate Plan"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                            <div className="bg-zinc-50 p-2 rounded-lg text-zinc-400">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                         {/* Progress placeholder - logic to be added later based on runs */}
                        <div className="flex justify-between text-xs font-bold text-zinc-500">
                            <span>Progress</span>
                            <span>{plan._count?.runs || 0} cases</span>
                        </div>
                        <ProgressBar progress={0} height="h-2" /> 
                        
                        <div className="flex items-center text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-50">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {new Date(plan.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
            {plans.length === 0 && !isCreating && (
                <div className="col-span-full text-center py-12 text-zinc-400 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                    <p className="font-bold">No test plans yet.</p>
                    <button onClick={() => setIsCreating(true)} className="text-sm text-blue-600 hover:underline mt-2">Create your first plan</button>
                </div>
            )}
        </div>
    </div>
  );
}
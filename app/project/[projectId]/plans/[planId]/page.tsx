"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Calendar, Search, Plus, Trash2, Copy, Eye } from "lucide-react"; 
import { StatusBadge, PriorityBadge, ProgressBar } from "@/components/ui";
import { TestStatus } from "@/types";

export default function PlanDetailPage() {
  const params = useParams();
  const planId = params.planId as string;
  const projectId = params.projectId as string;
  const router = useRouter();
  const { currentPlan, fetchPlan, updateRunStatus, addCasesToPlan, removeCaseFromPlan, testCases, duplicateTestPlan } = useAppStore(); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestStatus | "ALL">("ALL");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [addModalSearch, setAddModalSearch] = useState("");

  useEffect(() => {
    if (planId) {
        fetchPlan(planId);
    }
  }, [planId, fetchPlan]);

  if (!currentPlan) return <div className="flex h-screen items-center justify-center text-zinc-400">Loading plan...</div>;

  const runs = currentPlan.runs || [];
  
  const total = runs.length;
  const passed = runs.filter(r => r.status === "PASSED").length;
  const failed = runs.filter(r => r.status === "FAILED").length;
  const blocked = runs.filter(r => r.status === "BLOCKED").length;
  const progress = total > 0 ? Math.round((passed / total) * 100) : 0;

  const filteredRuns = runs.filter(r => {
      const matchesSearch = r.testCase?.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (runId: string, status: TestStatus) => {
      await updateRunStatus(runId, status);
  };

  const handleAddCases = async () => {
      if (selectedCaseIds.length > 0) {
          await addCasesToPlan(planId, selectedCaseIds);
          setShowAddModal(false);
          setSelectedCaseIds([]);
      }
  };

  const handleDuplicate = async () => {
      if (!currentPlan) return;
      if (confirm(`Are you sure you want to duplicate "${currentPlan.name}"?`)) {
          await duplicateTestPlan(currentPlan.id);
          router.push(`/project/${projectId}/plans`); 
      }
  };

  const existingCaseIds = new Set(runs.map(r => r.testCaseId));
  const availableCases = testCases.filter(tc => 
      tc.projectId === projectId && 
      !existingCaseIds.has(tc.id) &&
      tc.title.toLowerCase().includes(addModalSearch.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 px-6 pb-6 border-b border-zinc-200 bg-[#F2F0E9]">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <button 
                    onClick={() => router.push(`/project/${projectId}/plans`)} 
                    className="mr-4 p-2 rounded-xl hover:bg-white/50 text-zinc-500 hover:text-zinc-900 transition-colors"
                    aria-label="Back to plans list"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{currentPlan.name}</h1>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 mt-1">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> {currentPlan.startDate ? new Date(currentPlan.startDate).toLocaleDateString() : 'No start date'}</span>
                        {currentPlan.status && <span className="bg-zinc-200 px-2 py-0.5 rounded text-zinc-600 uppercase text-[10px]">{currentPlan.status}</span>}
                    </div>
                </div>
            </div>
            
            {/* Duplicate Button */}
            <button
                onClick={handleDuplicate}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold flex items-center hover:bg-black transition-colors shadow-sm"
                title="Duplicate Plan"
            >
                <Copy className="w-4 h-4 mr-2" /> Duplicate
            </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1 max-w-xl">
                 <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
                    <span>Overall Progress</span>
                    <span>{progress}% ({passed}/{total})</span>
                </div>
                <ProgressBar progress={progress} height="h-3" className="bg-zinc-200" />
            </div>
            
            <div className="flex gap-4">
                 <div className="glass-panel px-4 py-2 bg-white/50 rounded-xl border border-zinc-200/50 flex items-center gap-3">
                     <CheckCircle2 className="w-4 h-4 text-green-500" />
                     <span className="text-sm font-bold text-zinc-700">{passed} Pass</span>
                 </div>
                 <div className="glass-panel px-4 py-2 bg-white/50 rounded-xl border border-zinc-200/50 flex items-center gap-3">
                     <XCircle className="w-4 h-4 text-red-500" />
                     <span className="text-sm font-bold text-zinc-700">{failed} Fail</span>
                 </div>
                 <div className="glass-panel px-4 py-2 bg-white/50 rounded-xl border border-zinc-200/50 flex items-center gap-3">
                     <AlertCircle className="w-4 h-4 text-orange-500" />
                     <span className="text-sm font-bold text-zinc-700">{blocked} Block</span>
                 </div>
            </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-10">
         <div className="flex items-center gap-4 flex-1">
             <div className="relative max-w-xs w-full">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input 
                    type="text" 
                    placeholder="Search cases..." 
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
             </div>
             <div className="h-6 w-px bg-zinc-200"></div>
             <div className="flex gap-2">
                 {(["ALL", "UNTESTED", "PASSED", "FAILED"] as const).map(status => (
                     <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === status ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                     >
                         {status}
                     </button>
                 ))}
             </div>
         </div>
         <button 
            onClick={() => setShowAddModal(true)}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black transition-colors shadow-sm ml-4"
         >
             <Plus className="w-4 h-4 mr-2" /> Add Cases
         </button>
      </div>

      {/* Run List */}
      <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 sticky top-0">
                      <tr>
                          <th className="px-6 py-3 font-bold text-zinc-400">Test Case</th>
                          <th className="px-6 py-3 font-bold text-zinc-400">Priority</th>
                          <th className="px-6 py-3 font-bold text-zinc-400">Status</th>
                          <th className="px-6 py-3 font-bold text-zinc-400">Executed By</th>
                          <th className="px-6 py-3 font-bold text-zinc-400 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                      {filteredRuns.map(run => {
                          const snapshot = run.snapshot ? JSON.parse(run.snapshot) : null;
                          const displayCase = snapshot || run.testCase || { title: "Unknown Case", priority: "MEDIUM" };
                          const isSnapshot = !!run.snapshot;

                          return (
                          <tr key={run.id} className="hover:bg-zinc-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <button
                                          onClick={() => router.push(`/project/${projectId}/case/${run.testCaseId}`)}
                                          className="font-bold text-zinc-700 hover:text-blue-600 hover:underline transition-colors text-left"
                                          title="View test case details"
                                      >
                                          {displayCase.title}
                                      </button>
                                      {isSnapshot && (
                                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/50" title="This run is locked to a specific version of the test case">
                                              SNAPSHOT
                                          </span>
                                      )}
                                  </div>
                                  {run.notes && <div className="text-xs text-zinc-400 mt-1 italic">{run.notes}</div>}
                              </td>
                              <td className="px-6 py-4">
                                  <PriorityBadge priority={displayCase.priority || "MEDIUM"} />
                              </td>
                              <td className="px-6 py-4">
                                  <StatusBadge status={run.status} />
                              </td>
                              <td className="px-6 py-4">
                                  {run.executedBy ? (
                                      <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                                            {run.executedBy.charAt(0)}
                                          </div>
                                          <span className="text-xs font-medium text-zinc-600">{run.executedBy}</span>
                                      </div>
                                  ) : <span className="text-zinc-300">-</span>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2 items-center">
                                      <button
                                        onClick={() => handleStatusUpdate(run.id, "PASSED")}
                                        className={`p-1.5 rounded-lg hover:bg-green-50 text-zinc-300 hover:text-green-600 transition-colors ${run.status === "PASSED" ? "text-green-600 bg-green-50 ring-1 ring-green-200" : ""}`}
                                        title="Mark as Passed"
                                      >
                                          <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(run.id, "FAILED")}
                                        className={`p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-600 transition-colors ${run.status === "FAILED" ? "text-red-600 bg-red-50 ring-1 ring-red-200" : ""}`}
                                        title="Mark as Failed"
                                      >
                                          <XCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(run.id, "BLOCKED")}
                                        className={`p-1.5 rounded-lg hover:bg-orange-50 text-zinc-300 hover:text-orange-600 transition-colors ${run.status === "BLOCKED" ? "text-orange-600 bg-orange-50 ring-1 ring-orange-200" : ""}`}
                                        title="Mark as Blocked"
                                      >
                                          <AlertCircle className="w-4 h-4" />
                                      </button>

                                      <div className="w-px h-4 bg-zinc-200 mx-1"></div>

                                      <button
                                          onClick={() => router.push(`/project/${projectId}/case/${run.testCaseId}`)}
                                          className="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-300 hover:text-blue-600 transition-colors"
                                          title="View Details"
                                      >
                                          <Eye className="w-4 h-4" />
                                      </button>

                                      <button
                                          onClick={() => {
                                              if(confirm("Remove this case from the plan? Results will be lost.")) {
                                                  removeCaseFromPlan(planId, run.testCaseId);
                                              }
                                          }}
                                          className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                          title="Remove from Plan"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                          );
                      })}
                      {filteredRuns.length === 0 && (
                          <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">
                                  No test runs found matching criteria.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Add Cases Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 border border-zinc-200 flex flex-col max-h-[80vh]">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-zinc-900">Add Cases to Plan</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600"><XCircle className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="mb-4">
                      <input 
                          type="text" 
                          placeholder="Search cases to add..." 
                          className="w-full px-4 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none"
                          value={addModalSearch}
                          onChange={(e) => setAddModalSearch(e.target.value)}
                      />
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar border border-zinc-100 rounded-xl mb-4">
                      {availableCases.length === 0 ? (
                          <div className="p-8 text-center text-zinc-400 text-sm">No available cases found.</div>
                      ) : (
                          <table className="w-full text-left text-sm">
                              <thead className="bg-zinc-50 sticky top-0">
                                  <tr>
                                      <th className="px-4 py-2 w-10">
                                          <input 
                                              type="checkbox" 
                                              checked={selectedCaseIds.length === availableCases.length && availableCases.length > 0}
                                              onChange={() => {
                                                  if (selectedCaseIds.length === availableCases.length) {
                                                      setSelectedCaseIds([]);
                                                  } else {
                                                      setSelectedCaseIds(availableCases.map(c => c.id));
                                                  }
                                              }}
                                              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800"
                                          />
                                      </th>
                                      <th className="px-4 py-2 font-bold text-zinc-400">Test Case</th>
                                      <th className="px-4 py-2 font-bold text-zinc-400 w-24">Priority</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-50">
                                  {availableCases.map(tc => (
                                      <tr key={tc.id} className="hover:bg-zinc-50 cursor-pointer" onClick={() => {
                                          if (selectedCaseIds.includes(tc.id)) {
                                              setSelectedCaseIds(selectedCaseIds.filter(id => id !== tc.id));
                                          } else {
                                              setSelectedCaseIds([...selectedCaseIds, tc.id]);
                                          }
                                      }}>
                                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                              <input 
                                                  type="checkbox" 
                                                  checked={selectedCaseIds.includes(tc.id)}
                                                  onChange={() => {
                                                      if (selectedCaseIds.includes(tc.id)) {
                                                          setSelectedCaseIds(selectedCaseIds.filter(id => id !== tc.id));
                                                      } else {
                                                          setSelectedCaseIds([...selectedCaseIds, tc.id]);
                                                      }
                                                  }}
                                                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800"
                                              />
                                          </td>
                                          <td className="px-4 py-3 font-medium text-zinc-700">{tc.title}</td>
                                          <td className="px-4 py-3"><PriorityBadge priority={tc.priority} /></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                      <button 
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleAddCases}
                        disabled={selectedCaseIds.length === 0}
                        className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Add Selected ({selectedCaseIds.length})
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
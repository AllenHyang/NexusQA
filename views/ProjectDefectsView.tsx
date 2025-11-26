import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Defect, Project, User, Priority, DefectStatus } from "@/types";
import { Plus, Bug, Search, ArrowUp, ArrowDown, Trash2, CheckCircle2, XCircle, User as UserIcon } from "lucide-react";
import { DefectModal } from "@/components/DefectModal";

interface ProjectDefectsViewProps {
  project: Project;
  currentUser: User;
}

export function ProjectDefectsView({ project, currentUser }: ProjectDefectsViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { defects, loadDefects, users, bulkDeleteDefects, bulkUpdateDefects, saveDefect } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | undefined>(undefined);
  const [preventAutoOpen, setPreventAutoOpen] = useState(false); // Prevents modal from auto-opening after close
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>("ALL");
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>("ALL");
  const [sortCriteria, setSortCriteria] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Bulk Selection State
  const [selectedDefectIds, setSelectedDefectIds] = useState<string[]>([]);
  const [showBulkAssignDropdown, setShowBulkAssignDropdown] = useState(false);

  useEffect(() => {
    loadDefects(project.id);
  }, [project.id, loadDefects]);

  // Handle URL param to open specific defect
  useEffect(() => {
    const defectIdFromUrl = searchParams.get('defectId');
    if (defectIdFromUrl && defects.length > 0 && !preventAutoOpen) {
      const defectToOpen = defects.find(d => d.id === defectIdFromUrl);
      if (defectToOpen) {
        setEditingDefect(defectToOpen);
        setIsModalOpen(true);
      }
    }
    // Reset preventAutoOpen when URL changes to a new defectId
    if (!defectIdFromUrl) {
      setPreventAutoOpen(false);
    }
  }, [searchParams, defects, preventAutoOpen]);

  const sortedAndFilteredDefects = useMemo(() => {
    const currentDefects = defects.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (d.externalIssueId && d.externalIssueId.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatusFilter === "ALL" || d.status === selectedStatusFilter;
      const matchesSeverity = selectedSeverityFilter === "ALL" || d.severity === selectedSeverityFilter;
      const matchesAssignee = selectedAssigneeFilter === "ALL" || 
                              (selectedAssigneeFilter === "UNASSIGNED" ? !d.assigneeId : d.assigneeId === selectedAssigneeFilter);

      return matchesSearch && matchesStatus && matchesSeverity && matchesAssignee;
    });

    // Apply sorting
    currentDefects.sort((a, b) => {
      let compareValue = 0;
      if (sortCriteria === "createdAt") {
        compareValue = new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
      } else if (sortCriteria === "severity") {
        const severityOrder = { "CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
        compareValue = severityOrder[a.severity as Priority] - severityOrder[b.severity as Priority];
      } else if (sortCriteria === "status") {
        compareValue = a.status.localeCompare(b.status);
      } else if (sortCriteria === "title") {
        compareValue = a.title.localeCompare(b.title);
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return currentDefects;
  }, [defects, searchQuery, selectedStatusFilter, selectedSeverityFilter, selectedAssigneeFilter, sortCriteria, sortOrder]);


  const handleEdit = (defect: Defect) => {
      setEditingDefect(defect);
      setIsModalOpen(true);
  };

  const handleCreate = () => {
      setEditingDefect(undefined);
      setIsModalOpen(true);
  };

  const handleSave = async (defect: Partial<Defect>) => {
      await saveDefect(defect);
      handleCloseModal();
  };

  const handleCloseModal = useCallback(() => {
      setIsModalOpen(false);
      setEditingDefect(undefined);
      // Prevent auto-reopening from URL param while we clear it
      setPreventAutoOpen(true);
      // Clear the defectId from URL if present
      const currentDefectId = searchParams.get('defectId');
      if (currentDefectId) {
          // Remove defectId param from URL but keep tab param
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.delete('defectId');
          const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
          router.replace(newUrl);
      }
  }, [searchParams, pathname, router]);
  
  // Selection Handlers
  const toggleSelectAll = () => {
      if (selectedDefectIds.length === sortedAndFilteredDefects.length && sortedAndFilteredDefects.length > 0) {
          setSelectedDefectIds([]);
      } else {
          setSelectedDefectIds(sortedAndFilteredDefects.map(d => d.id));
      }
  };

  const toggleSelect = (id: string) => {
      if (selectedDefectIds.includes(id)) {
          setSelectedDefectIds(selectedDefectIds.filter(i => i !== id));
      } else {
          setSelectedDefectIds([...selectedDefectIds, id]);
      }
  };

  // Bulk Action Handlers
  const handleBulkDelete = async () => {
      if (confirm(`Are you sure you want to delete ${selectedDefectIds.length} defects?`)) {
          await bulkDeleteDefects(selectedDefectIds);
          setSelectedDefectIds([]);
      }
  };

  const handleBulkStatusUpdate = async (status: DefectStatus) => {
      await bulkUpdateDefects(selectedDefectIds, { status });
      setSelectedDefectIds([]);
  };

  const handleBulkAssign = async (assigneeId: string | null) => {
      await bulkUpdateDefects(selectedDefectIds, { assigneeId: assigneeId || undefined }); // handle unassign
      setSelectedDefectIds([]);
      setShowBulkAssignDropdown(false);
  };

  const statusOptions: DefectStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  const severityOptions: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const sortCriteriaOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "severity", label: "Severity" },
    { value: "status", label: "Status" },
    { value: "title", label: "Title" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
       <div className="flex items-center justify-between mb-8">
           <div>
               <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Defects</h2>
               <p className="text-zinc-500">Manage internal and external defects for {project.name}</p>
           </div>
           <button 
             onClick={handleCreate}
             className="bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-black transition-colors"
           >
               <Plus className="w-4 h-4 mr-2" /> New Defect
           </button>
       </div>

       <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-24">
           {/* Toolbar */}
           <div className="p-4 border-b border-zinc-100 flex gap-4 flex-wrap">
               <div className="relative flex-1 min-w-[200px]">
                   <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                   <input 
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      placeholder="Search defects..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
               </div>
               
               <select
                   className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
                   value={selectedStatusFilter}
                   onChange={e => setSelectedStatusFilter(e.target.value)}
               >
                   <option value="ALL">All Statuses</option>
                   {statusOptions.map(status => (
                       <option key={status} value={status}>{status}</option>
                   ))}
               </select>

               <select
                   className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
                   value={selectedSeverityFilter}
                   onChange={e => setSelectedSeverityFilter(e.target.value)}
               >
                   <option value="ALL">All Severities</option>
                   {severityOptions.map(severity => (
                       <option key={severity} value={severity}>{severity}</option>
                   ))}
               </select>

               <select
                   className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
                   value={selectedAssigneeFilter}
                   onChange={e => setSelectedAssigneeFilter(e.target.value)}
               >
                   <option value="ALL">All Assignees</option>
                   <option value="UNASSIGNED">Unassigned</option>
                   {users.map(user => (
                       <option key={user.id} value={user.id}>{user.name || user.email}</option>
                   ))}
               </select>

               <select
                   className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium bg-white"
                   value={sortCriteria}
                   onChange={e => setSortCriteria(e.target.value)}
               >
                   {sortCriteriaOptions.map(option => (
                       <option key={option.value} value={option.value}>{option.label}</option>
                   ))}
               </select>
               <button
                   className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium"
                   onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
               >
                   {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
               </button>

           </div>

           {/* Defect List Header with Select All */}
           {sortedAndFilteredDefects.length > 0 && (
               <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                   <div className="w-6 flex justify-center">
                       <input 
                           type="checkbox"
                           className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer"
                           checked={selectedDefectIds.length === sortedAndFilteredDefects.length && sortedAndFilteredDefects.length > 0}
                           onChange={toggleSelectAll}
                       />
                   </div>
                   <div className="w-16">Severity</div>
                   <div className="flex-1">Title</div>
                   <div className="w-32">Assignee</div>
                   <div className="w-24">Status</div>
               </div>
           )}

           {sortedAndFilteredDefects.length === 0 ? (
               <div className="p-12 text-center text-zinc-400">
                   <Bug className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   <p>No defects found.</p>
               </div>
           ) : (
               <div className="divide-y divide-zinc-50">
                   {sortedAndFilteredDefects.map(defect => (
                       <div 
                         key={defect.id} 
                         className={`p-4 hover:bg-zinc-50 transition-colors flex items-center gap-4 ${selectedDefectIds.includes(defect.id) ? 'bg-blue-50/30' : ''}`}
                       >
                           <div className="w-6 flex justify-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                               <input 
                                   type="checkbox"
                                   className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-800 cursor-pointer"
                                   checked={selectedDefectIds.includes(defect.id)}
                                   onChange={() => toggleSelect(defect.id)}
                               />
                           </div>
                           
                           <div className="w-16 flex-shrink-0" onClick={() => handleEdit(defect)}>
                               <div className={`w-2 h-2 rounded-full mx-auto ${
                                   defect.severity === 'CRITICAL' ? 'bg-red-600' :
                                   defect.severity === 'HIGH' ? 'bg-orange-500' :
                                   defect.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                               }`} />
                           </div>
                           
                           <div className="flex-1 cursor-pointer" onClick={() => handleEdit(defect)}>
                               <div className="flex items-center gap-2 mb-1">
                                   <span className="font-bold text-zinc-800 text-sm">{defect.title}</span>
                                   {defect.externalIssueId && (
                                       <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">
                                           {defect.externalIssueId}
                                       </span>
                                   )}
                               </div>
                               <p className="text-xs text-zinc-500 line-clamp-1">{defect.description || "No description"}</p>
                           </div>

                           <div className="w-32 text-xs text-zinc-500 flex-shrink-0" onClick={() => handleEdit(defect)}>
                               {defect.assigneeId ? (
                                   users.find(u => u.id === defect.assigneeId)?.name || "Unknown User"
                               ) : (
                                   <span className="italic text-zinc-400">Unassigned</span>
                               )}
                           </div>

                           <div className="w-24 flex-shrink-0 text-right" onClick={() => handleEdit(defect)}>
                               <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                                   defect.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                                   defect.status === 'CLOSED' ? 'bg-zinc-100 text-zinc-500' : 'bg-blue-100 text-blue-700'
                               }`}>
                                   {defect.status}
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>

       {/* Floating Bulk Action Bar */}
       {selectedDefectIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in w-max max-w-[90vw] border border-zinc-200 bg-white">
             <div className="flex items-center gap-3 pr-6 border-r border-zinc-100">
                 <div className="bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{selectedDefectIds.length}</div>
                 <span className="font-bold text-zinc-700 text-sm">Selected</span>
                 <button onClick={() => setSelectedDefectIds([])} className="text-xs text-zinc-400 hover:text-zinc-800 underline ml-1 font-medium">Clear</button>
             </div>
             
             <div className="flex items-center gap-2">
                 <button 
                  onClick={() => handleBulkStatusUpdate("OPEN")}
                  className="flex items-center px-3 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 text-xs font-bold transition-colors"
                 >
                     <Bug className="w-3.5 h-3.5 mr-1.5" /> Open
                 </button>
                 <button 
                  onClick={() => handleBulkStatusUpdate("RESOLVED")}
                  className="flex items-center px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors"
                 >
                     <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Resolve
                 </button>
                 <button 
                  onClick={() => handleBulkStatusUpdate("CLOSED")}
                  className="flex items-center px-3 py-2 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold transition-colors"
                 >
                     <XCircle className="w-3.5 h-3.5 mr-1.5" /> Close
                 </button>

                 <div className="relative">
                     <button 
                      onClick={() => setShowBulkAssignDropdown(!showBulkAssignDropdown)}
                      className="flex items-center px-3 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors"
                     >
                         <UserIcon className="w-3.5 h-3.5 mr-1.5" /> Assign
                     </button>
                     {showBulkAssignDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowBulkAssignDropdown(false)}></div>
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar">
                                <button
                                    onClick={() => handleBulkAssign(null)}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 mb-1"
                                >
                                    Unassigned
                                </button>
                                {users.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleBulkAssign(u.id)}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 mb-1 flex items-center"
                                    >
                                        {u.name}
                                    </button>
                                ))}
                            </div>
                        </>
                     )}
                 </div>

                 <div className="w-px h-6 bg-zinc-200 mx-2"></div>
                 <button 
                  onClick={handleBulkDelete}
                  className="flex items-center px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors"
                 >
                     <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                 </button>
             </div>
          </div>
       )}
       
       <DefectModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         onSave={handleSave}
         initialData={editingDefect}
         projectId={project.id}
         currentUser={currentUser}
       />
    </div>
  );
}

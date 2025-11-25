import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Defect, Project, User } from "@/types";
import { Plus, Bug, Filter, Search } from "lucide-react";
import { DefectModal } from "@/components/DefectModal";

interface ProjectDefectsViewProps {
  project: Project;
  currentUser: User;
}

export function ProjectDefectsView({ project, currentUser }: ProjectDefectsViewProps) {
  const { defects, loadDefects, saveDefect } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDefects(project.id);
  }, [project.id, loadDefects]);

  const filteredDefects = defects.filter(d => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.externalIssueId && d.externalIssueId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
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

       <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
           {/* Toolbar */}
           <div className="p-4 border-b border-zinc-100 flex gap-4">
               <div className="relative flex-1">
                   <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                   <input 
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      placeholder="Search defects..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
               </div>
               <button className="px-3 py-2 border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 flex items-center text-sm font-medium">
                   <Filter className="w-4 h-4 mr-2" /> Filter
               </button>
           </div>

           {filteredDefects.length === 0 ? (
               <div className="p-12 text-center text-zinc-400">
                   <Bug className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   <p>No defects found.</p>
               </div>
           ) : (
               <div className="divide-y divide-zinc-50">
                   {filteredDefects.map(defect => (
                       <div 
                         key={defect.id} 
                         onClick={() => handleEdit(defect)}
                         className="p-4 hover:bg-zinc-50 cursor-pointer transition-colors flex items-center gap-4"
                       >
                           <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                               defect.severity === 'CRITICAL' ? 'bg-red-600' :
                               defect.severity === 'HIGH' ? 'bg-orange-500' :
                               defect.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                           }`} />
                           <div className="flex-1">
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
                           <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                               defect.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                               defect.status === 'CLOSED' ? 'bg-zinc-100 text-zinc-500' : 'bg-blue-100 text-blue-700'
                           }`}>
                               {defect.status}
                           </span>
                       </div>
                   ))}
               </div>
           )}
       </div>
       
       <DefectModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         initialData={editingDefect}
         projectId={project.id}
         currentUser={currentUser}
       />
    </div>
  );
}

import React, { useState } from "react";
import { TestSuite } from "../types";
import { Folder, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Tooltip } from "./ui";

interface FolderTreeProps {
    suites: TestSuite[];
    selectedSuiteId: string | null;
    onSelect: (id: string | null) => void;
    onCreate: (parentId: string | null, name: string) => void;
    onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void;
}

interface FolderItemProps {
    suite: TestSuite;
    level?: number;
    isSelected: boolean;
    onSelect: (id: string | null) => void;
    children?: React.ReactNode;
    onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void;
}

const FolderItem = ({ 
    suite, 
    level = 0, 
    isSelected, 
    onSelect, 
    children,
    onRename,
    onDelete
}: FolderItemProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(suite.name);
    const [showActions, setShowActions] = useState(false);

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (editName.trim()) {
            onRename(suite.id, editName);
            setIsEditing(false);
        }
    };

    return (
        <div className="select-none">
            <div 
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors group relative
                    ${isSelected ? "bg-zinc-100 text-zinc-900 font-bold" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"}
                `}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
                onClick={() => onSelect(suite.id)}
            >
                <div 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    {children && React.Children.count(children) > 0 ? (
                        isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                    ) : <div className="w-3.5 h-3.5" />}
                </div>

                <Folder className={`w-4 h-4 ${isSelected ? "text-yellow-500 fill-yellow-500" : "text-zinc-400"}`} />
                
                {isEditing ? (
                    <form onSubmit={handleRename} className="flex-1">
                        <input 
                            autoFocus
                            type="text" 
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={() => setIsEditing(false)}
                            className="w-full bg-white border border-zinc-300 rounded px-1.5 py-0.5 text-xs focus:ring-2 focus:ring-zinc-900 outline-none"
                            onClick={e => e.stopPropagation()}
                        />
                    </form>
                ) : (
                    <span className="flex-1 truncate">{suite.name}</span>
                )}

                {/* Hover Actions */}
                {!isEditing && (
                    <div className="relative">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                            className={`p-1 rounded-md hover:bg-zinc-200 text-zinc-400 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                         </button>
                         
                         {showActions && (
                             <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowActions(false); }}></div>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-zinc-200 shadow-xl rounded-xl p-1 z-20 flex flex-col">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowActions(false); }}
                                        className="flex items-center px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg text-left"
                                    >
                                        <Edit2 className="w-3 h-3 mr-2" /> Rename
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(suite.id); setShowActions(false); }}
                                        className="flex items-center px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-left"
                                    >
                                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                                    </button>
                                </div>
                             </>
                         )}
                    </div>
                )}
            </div>
            
            {isExpanded && children && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export function FolderTree({ suites, selectedSuiteId, onSelect, onCreate, onRename, onDelete }: FolderTreeProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Transform flat list to tree (currently only 1 level depth supported for UI simplicity, but data model supports infinite)
    // For this MVP, we'll stick to a flat list or 1-level nesting if possible. 
    // Let's do a simple flat hierarchy rendered visually for now to ensure stability.
    
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            onCreate(null, newFolderName);
            setNewFolderName("");
            setIsCreating(false);
        }
    };

    return (
        <div className="w-full md:w-64 flex flex-col bg-zinc-50/50 h-auto max-h-[50vh] md:max-h-full md:h-full">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em]">Test Suites</span>
                <Tooltip content="New Folder">
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                <div 
                    onClick={() => onSelect(null)}
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors mb-2
                        ${selectedSuiteId === null ? "bg-white shadow-sm ring-1 ring-zinc-200 text-zinc-900 font-bold" : "text-zinc-600 hover:bg-zinc-100/80"}
                    `}
                >
                    <Folder className={`w-4 h-4 ${selectedSuiteId === null ? "text-zinc-900" : "text-zinc-400"}`} />
                    <span className="flex-1">All Cases</span>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreate} className="px-2 mb-2 animate-in slide-in-from-top-2 fade-in">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-zinc-200 shadow-sm">
                            <Folder className="w-4 h-4 text-zinc-300" />
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Suite Name..."
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onBlur={() => !newFolderName && setIsCreating(false)}
                                className="w-full text-sm outline-none placeholder:text-zinc-300"
                            />
                        </div>
                    </form>
                )}

                {suites.map(suite => (
                    <FolderItem 
                        key={suite.id} 
                        suite={suite} 
                        isSelected={selectedSuiteId === suite.id} 
                        onSelect={onSelect}
                        onRename={onRename}
                        onDelete={onDelete}
                    />
                ))}
                
                {suites.length === 0 && !isCreating && (
                    <div className="text-center py-8 px-4">
                        <p className="text-xs text-zinc-400 mb-2">No suites created.</p>
                        <button onClick={() => setIsCreating(true)} className="text-xs font-bold text-blue-600 hover:underline">
                            Create your first suite
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
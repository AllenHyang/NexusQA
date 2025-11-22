import React, { useEffect, useState } from "react";
import { TestStatus, Priority, Project, TestCase } from "../types";
import { CheckSquare, ImageIcon, Check, XCircle, Pencil, Trash2, Activity, ArrowRight } from "lucide-react";

export const StatusBadge = ({ status }: { status: TestStatus }) => {
  const colors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-500 border-zinc-200",
    PASSED: "bg-green-100 text-green-700 border-green-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
    BLOCKED: "bg-orange-100 text-orange-700 border-orange-200",
    UNTESTED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.DRAFT}`}>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    LOW: "text-zinc-400",
    MEDIUM: "text-blue-500",
    HIGH: "text-orange-500",
    CRITICAL: "text-red-600 font-black",
  };
  return <span className={`text-[10px] uppercase tracking-widest font-bold ${colors[priority]}`}>{priority}</span>;
};

export const TagBadge: React.FC<{ label: string, onRemove?: () => void }> = ({ label, onRemove }) => (
    <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-zinc-600 border border-zinc-200 mr-2 mb-1 shadow-sm">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-2 hover:text-red-500 transition-colors">
            <XCircle className="w-3 h-3" />
        </button>
      )}
    </span>
);

export const AILoader = () => (
  <svg className="w-4 h-4 animate-spin text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface AnimatedEmptyStateProps {
    icon: any;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function AnimatedEmptyState({ icon: Icon, title, description, action }: AnimatedEmptyStateProps) {
    return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
             <div className="relative mb-8 group cursor-default">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                <div className="relative w-20 h-20 bg-white rounded-3xl border border-zinc-100 flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
                    <Icon className="w-8 h-8 text-zinc-400 group-hover:text-yellow-500 transition-colors" />
                </div>
             </div>
             
             <h3 className="text-2xl font-bold text-zinc-800 mb-2 tracking-tight">{title}</h3>
             <p className="text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed font-medium">{description}</p>
             
             {action && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     {action}
                 </div>
             )}
        </div>
    )
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ data, size = 160, strokeWidth = 20 }: DonutChartProps) {
  const [ready, setReady] = useState(false);
  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    setTimeout(() => setReady(true), 100);
  }, []);

  let accumulatedPercent = 0;

  if (total === 0) {
    return (
       <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
          <span className="text-xs text-zinc-400 font-bold uppercase">No Data</span>
       </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 drop-shadow-lg">
        {data.map((item, index) => {
          const percent = item.value / total;
          const finalDashArray = `${circumference * percent} ${circumference}`;
          const initialDashArray = `0 ${circumference}`;

          accumulatedPercent += percent;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={ready ? finalDashArray : initialDashArray}
              strokeDashoffset={-1 * circumference * (accumulatedPercent - percent)} 
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-black text-zinc-800 animate-in zoom-in duration-500 delay-300 tracking-tighter">{total}</span>
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">Tests</span>
      </div>
    </div>
  );
}

interface ProjectCardProps {
    project: Project;
    testCases: TestCase[];
    onClick: () => void;
    onDelete: (id: string) => void;
    onEdit?: (project: Project) => void;
    showActions: boolean;
    index?: number; 
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, testCases, onClick, onDelete, onEdit, showActions }) => {
    const passedCount = testCases.filter(tc => tc.status === "PASSED").length;
    const totalCount = testCases.length;
    const progress = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

    return (
        <div 
            onClick={onClick}
            className="group relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl bg-white border border-zinc-100 h-[320px] flex flex-col justify-between p-6"
        >
            <div className="relative z-10 flex justify-between items-start">
                <div className="bg-zinc-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-zinc-500 tracking-wide">
                         {new Date(project.createdAt).getFullYear()}
                    </span>
                </div>
                {showActions && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <button onClick={(e) => { e.stopPropagation(); onEdit?.(project); }} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-4 flex-1 flex items-center justify-center">
                {project.coverImage ? (
                     <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white ring-1 ring-zinc-100 transform group-hover:scale-110 transition-transform duration-500">
                        <img src={project.coverImage} className="w-full h-full object-cover" alt="Cover" />
                     </div>
                ) : (
                    <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-4 text-center">
                <h3 className="text-xl font-black text-zinc-800 tracking-tight leading-none mb-3 line-clamp-1">{project.name}</h3>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
                    <div 
                        className="h-full bg-yellow-400 transition-all duration-1000 ease-out rounded-full" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    <span>{Math.round(progress)}% Done</span>
                    <span>{totalCount} Tests</span>
                </div>
            </div>
        </div>
    );
};

export function SidebarItem({ icon, label, active, collapsed, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 mb-1 group relative
                ${active ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"}
                ${collapsed ? "justify-center" : ""}
            `}
        >
            <div className={`relative z-10 transition-colors duration-300 ${active ? "text-white" : "text-zinc-400 group-hover:text-zinc-800"}`}>{icon}</div>
            {!collapsed && <span className="ml-3 text-sm font-bold relative z-10 tracking-wide">{label}</span>}
        </button>
    );
}

export function StatCard({ title, value, icon, color }: any) {
    // Using simplified coloring for light mode clean look
    return (
        <div className="bento-card p-6 rounded-[2rem] flex flex-col justify-between h-full min-h-[140px] bg-white">
            <div className="flex justify-between items-start">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{title}</p>
                <div className={`p-2 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-zinc-800 transition-colors`}>
                    {React.cloneElement(icon, { className: "w-5 h-5" })}
                </div>
            </div>
            <div>
                <p className="text-4xl font-black text-zinc-900 tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

export function Modal({ onClose, title, children }: any) {
    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white border border-zinc-100 rounded-[2rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-400 shadow-2xl">
                <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-bold text-zinc-800 text-lg tracking-tight">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-1.5 hover:bg-zinc-200 transition-colors text-zinc-400 hover:text-zinc-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
}
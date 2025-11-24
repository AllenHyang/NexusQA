import React, { useEffect, useState } from "react";
import { TestStatus, Priority, Project, TestCase, ReviewStatus } from "../types";
import { CheckSquare, ImageIcon, Check, XCircle, Pencil, Trash2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const StatusBadge = ({ status, reviewStatus }: { status: TestStatus; reviewStatus?: ReviewStatus; }) => {
  const statusColors: Record<TestStatus, string> = {
    DRAFT: "bg-zinc-100 text-zinc-500 border-zinc-200",
    PASSED: "bg-green-100 text-green-700 border-green-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
    BLOCKED: "bg-orange-100 text-orange-700 border-orange-200",
    SKIPPED: "bg-gray-100 text-gray-500 border-gray-200 italic",
    UNTESTED: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const reviewColors: Record<ReviewStatus, { badge: string; icon: React.ElementType }> = {
    PENDING: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
    APPROVED: { badge: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
    CHANGES_REQUESTED: { badge: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  };

  const currentStatusColors = statusColors[status] || statusColors.DRAFT;
  const currentReviewColors = reviewStatus ? reviewColors[reviewStatus] : null;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${currentStatusColors}`}>
        {status}
      </span>
      {reviewStatus && currentReviewColors && (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${currentReviewColors.badge}`}>
          <currentReviewColors.icon className="w-3 h-3 mr-1" /> {reviewStatus}
        </span>
      )}
    </div>
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

export const ProgressBar = ({ 
  progress, 
  height = "h-2", 
  color = "bg-yellow-400", 
  className = "" 
}: { 
  progress: number; 
  height?: string; 
  color?: string;
  className?: string;
}) => (
  <div className={`w-full ${height} bg-zinc-100 rounded-full overflow-hidden shadow-inner ${className}`}>
    <div 
      className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-sm`} 
      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
    ></div>
  </div>
);

export const AILoader = () => (
  <svg className="w-4 h-4 animate-spin text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface AnimatedEmptyStateProps {
    icon: React.ElementType;
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
            className="group relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl bg-white border border-zinc-100 h-[340px] flex flex-col p-6"
        >
            {/* Header: Date & Actions */}
            <div className="flex justify-between items-start mb-4">
                <div className="bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
                    <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
                         {new Date(project.createdAt).getFullYear()}
                    </span>
                </div>
                {showActions && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                         <button onClick={(e) => { e.stopPropagation(); onEdit?.(project); }} aria-label="Edit Project" className="p-2 bg-zinc-50 hover:bg-white border border-zinc-100 hover:border-zinc-200 text-zinc-600 rounded-xl transition-all shadow-sm">
                            <Pencil className="w-3.5 h-3.5" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} aria-label="Delete Project" className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 rounded-xl transition-all shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                    </div>
                )}
            </div>

            {/* Icon & Title Area */}
            <div className="flex-1 flex flex-col items-start">
                {/* Image/Icon Container */}
                <div className="mb-5 relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-zinc-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        {project.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={project.coverImage} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-zinc-300" />
                        )}
                    </div>
                    {/* Decorative blob behind */}
                    <div className="absolute -inset-4 bg-yellow-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>

                <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-tight mb-2 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                    {project.name}
                </h3>
                
                <p className="text-sm text-zinc-500 font-medium leading-relaxed line-clamp-2 mb-4 h-10">
                    {project.description || <span className="italic text-zinc-300">No description provided.</span>}
                </p>
            </div>

            {/* Footer: Progress */}
            <div className="mt-auto pt-4 border-t border-zinc-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Progress</span>
                    <span className="text-[10px] font-black text-zinc-900">{Math.round(progress)}%</span>
                </div>
                
                <ProgressBar progress={progress} height="h-1.5" className="mb-3" />
                
                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                    <div className="flex items-center bg-zinc-50 px-2 py-1 rounded-md">
                        <CheckSquare className="w-3 h-3 mr-1.5 text-zinc-300" />
                        {totalCount} Tests
                    </div>
                    {passedCount > 0 && (
                        <div className="flex items-center bg-green-50 px-2 py-1 rounded-md text-green-600">
                            <Check className="w-3 h-3 mr-1.5" />
                            {passedCount} Passed
                        </div>
                    )}
                </div>
            </div>
            </div>
          );
        };
        
        export const Tooltip = ({ children, content, position = "top" }: { children: React.ReactNode; content: string; position?: "top" | "bottom" | "left" | "right" }) => {
          const positions = {
            top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
            bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
            left: "right-full mr-2 top-1/2 -translate-y-1/2",
            right: "left-full ml-2 top-1/2 -translate-y-1/2",
          };
        
          return (
            <div className="relative flex items-center justify-center group/tooltip">
              {children}
              <div className={`
                absolute whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-xl animate-in fade-in zoom-in-95 duration-200 z-[60] pointer-events-none
                hidden group-hover/tooltip:block
                ${positions[position]}
              `}>
                {content}
                <div className={`
                    absolute w-2 h-2 bg-zinc-900 rotate-45
                    ${position === "top" ? "bottom-[-3px] left-1/2 -translate-x-1/2" : ""}
                    ${position === "bottom" ? "top-[-3px] left-1/2 -translate-x-1/2" : ""}
                    ${position === "left" ? "right-[-3px] top-1/2 -translate-y-1/2" : ""}
                    ${position === "right" ? "left-[-3px] top-1/2 -translate-y-1/2" : ""}
                `}></div>
              </div>
            </div>
          );
        };
interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
}

export function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
    return (
        <button 
            onClick={onClick}
            className={`
                w-full flex items-center px-3 py-3.5 rounded-xl transition-all duration-300 mb-2 group relative overflow-hidden outline-none
                ${active 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 scale-[1.02]" 
                    : "text-zinc-500 hover:bg-white hover:shadow-sm hover:shadow-zinc-200/50 hover:text-zinc-900"
                }
                ${collapsed ? "justify-center" : ""}
                active:scale-95 active:shadow-inner
            `}
        >
            {/* Animated Background Gradient for Active State */}
            {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-100 z-0"></div>
            )}

            {/* Icon Wrapper with Animation */}
            <div className={`
                relative z-10 transition-all duration-300 flex items-center justify-center
                ${active ? "text-yellow-400 scale-110" : "text-zinc-400 group-hover:text-zinc-800 group-hover:scale-110"}
            `}>
                {icon}
            </div>

            {/* Label with Slide Animation */}
            {!collapsed && (
                <span className={`
                    ml-3 text-sm font-bold relative z-10 tracking-wide transition-transform duration-300
                    ${active ? "translate-x-1" : "group-hover:translate-x-1"}
                `}>
                    {label}
                </span>
            )}
            
            {/* Active Glow Indicator (Right side) */}
            {active && !collapsed && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-in fade-in zoom-in duration-500 z-10"></div>
            )}
        </button>
    );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
}

export function StatCard({ title, value, icon }: StatCardProps) {
    // Using simplified coloring for light mode clean look
    return (
        <div className="bento-card p-6 rounded-[2rem] flex flex-col justify-between h-full min-h-[140px] bg-white">
            <div className="flex justify-between items-start">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{title}</p>
                <div className={`p-2 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-zinc-800 transition-colors`}>
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                </div>
            </div>
            <div>
                <p className="text-4xl font-black text-zinc-900 tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

export function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode; }) {
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
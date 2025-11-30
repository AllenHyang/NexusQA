"use client";

import React, { useEffect, useState } from "react";
import { Project, TestCase } from "../types";
import { ProgressBar } from "../components/ui";
import { Info, Bug, Activity, BookOpen, Sparkles, PlayCircle, ArrowRight, Calendar, Download, FileJson, FileSpreadsheet, FileText, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { generateReportData, exportReportAsJSON, exportReportAsCSV, exportReportAsHTML } from "@/lib/reportGenerator";

interface WorkflowStepProps {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
    stepNumber: number;
}

const WorkflowStep = ({ icon: Icon, title, description, color, stepNumber }: WorkflowStepProps) => (
    <div className="relative group">
        <div className={`p-6 rounded-2xl glass-panel h-full relative z-10 flex flex-col bg-white border border-zinc-100 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('500', '100')} ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-zinc-300">0{stepNumber}</span>
            </div>
            <h4 className="font-bold text-zinc-800 text-sm mb-2">{title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">{description}</p>
        </div>
        {/* Connector Line */}
        {stepNumber < 4 && (
             <div className="hidden xl:block absolute top-1/2 -right-4 w-8 h-0.5 bg-zinc-200 -translate-y-1/2 z-0">
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white p-1.5 rounded-full shadow-sm border border-zinc-100">
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                 </div>
             </div>
        )}
    </div>
);


interface ProjectAnalyticsViewProps {
    project: Project;
    testCases: TestCase[];
}

export function ProjectAnalyticsView({ project, testCases }: ProjectAnalyticsViewProps) {
  const { defects, loadDefects } = useAppStore();
  const [showExportModal, setShowExportModal] = useState(false);

  // Load defects for report generation
  useEffect(() => {
    loadDefects(project.id);
  }, [project.id, loadDefects]);

  // Export handlers
  const handleExport = (format: 'json' | 'csv' | 'html') => {
    const reportData = generateReportData(project, testCases, defects);
    switch (format) {
      case 'json':
        exportReportAsJSON(reportData);
        break;
      case 'csv':
        exportReportAsCSV(reportData);
        break;
      case 'html':
        exportReportAsHTML(reportData);
        break;
    }
    setShowExportModal(false);
  };

  // Analytics Calculations
  const failedCases = testCases.filter(tc => tc.status === "FAILED");
  const defectCount = failedCases.length;
  const totalExecuted = testCases.filter(tc => tc.status !== "UNTESTED" && tc.status !== "DRAFT").length;
  const defectDensity = totalExecuted > 0 ? Math.round((defectCount / totalExecuted) * 100) : 0;
  const uniqueBugIds = new Set(testCases.flatMap(tc => tc.history?.filter(h => h.bugId).map(h => h.bugId) || []));

  // Timeline
  const getValidDate = (dateStr?: string, fallback: Date = new Date()) => {
      if (!dateStr) return fallback;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? fallback : d;
  };

  const start = getValidDate(project.startDate);
  const end = getValidDate(project.dueDate, new Date(new Date().setDate(new Date().getDate() + 14)));
  const today = new Date();
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const getLast7DaysData = () => {
      const days = [];
      for(let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const count = testCases.reduce((acc, tc) => {
              const executedOnDay = tc.history?.some(h => h.date.startsWith(dateStr));
              return acc + (executedOnDay ? 1 : 0);
          }, 0);
          days.push({ date: dateStr, count, label: d.toLocaleDateString(undefined, {weekday: 'narrow'}) });
      }
      return days;
  };
  const trendData = getLast7DaysData();
  const maxTrend = Math.max(...trendData.map(d => d.count), 1);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-6">
        {/* Workflow Section */}
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 mb-6">
            <div className="glass-panel rounded-[2rem] p-4 md:p-8 bg-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Info className="w-4 h-4 text-yellow-500 mr-2" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Use Case Driven Workflow</h3>
                    </div>
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <WorkflowStep stepNumber={1} icon={BookOpen} title="User Story" description="Define the 'Who', 'What', and 'Why' in the User Story field to set the context." color="text-blue-500" />
                    <WorkflowStep stepNumber={2} icon={Sparkles} title="AI Design" description="Gemini AI generates precise test steps and visual mockups based on your story." color="text-purple-500" />
                    <WorkflowStep stepNumber={3} icon={PlayCircle} title="Execution" description="Testers run scenarios. Results are logged with timestamps and executor details." color="text-emerald-500" />
                    <WorkflowStep stepNumber={4} icon={Bug} title="Defect Tracking" description="Failed tests link directly to Jira (or external tracker) via Requirement ID." color="text-red-500" />
                </div>
            </div>
        </div>

        {/* Analytics Section */}
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline Card */}
                <div className="glass-panel rounded-[2rem] p-6 md:p-8 lg:col-span-2 bg-white">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h4 className="font-bold text-zinc-800 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-yellow-500" /> Project Schedule
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1 font-medium">
                                {start.toLocaleDateString()} - {end.toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-black text-zinc-900">
                                {Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))}
                            </span>
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Days Left</span>
                        </div>
                    </div>
                    
                    {/* Progress Bar Timeline */}
                    <div className="relative pt-8 pb-2">
                        <ProgressBar progress={progressPercent} height="h-3" className="mb-2" />
                        <div className="flex justify-between text-xs text-zinc-400 font-bold">
                            <span>Start</span>
                            <span 
                                className="text-yellow-600 absolute transition-all duration-1000 transform -translate-x-1/2 -top-1"
                                style={{ left: `${progressPercent}%` }}
                            >
                                Today
                                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-yellow-600 mx-auto mt-1"></div>
                            </span>
                            <span>Due</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Column */}
                <div className="grid grid-rows-2 gap-6">
                    <div className="glass-panel rounded-[2rem] p-6 flex flex-col justify-between bg-white">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                                <Bug className="w-3.5 h-3.5 mr-1.5" /> Defect Metrics
                            </h4>
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg font-bold">{uniqueBugIds.size} Open</span>
                        </div>
                        <div className="flex items-end gap-4">
                            <div>
                                <span className="text-2xl font-black text-zinc-900">{defectDensity}%</span>
                                <span className="text-xs text-zinc-400 ml-1 font-bold">Density</span>
                            </div>
                            <div className="h-8 w-px bg-zinc-200"></div>
                            <div>
                                <span className="text-2xl font-black text-zinc-900">{failedCases.length}</span>
                                <span className="text-xs text-zinc-400 ml-1 font-bold">Failed</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-[2rem] p-6 flex flex-col bg-white">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center mb-4">
                                <Activity className="w-3.5 h-3.5 mr-1.5" /> 7-Day Activity
                        </h4>
                        <div className="flex items-end justify-between h-full gap-2">
                            {trendData.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                                    <div 
                                        className="w-full bg-yellow-100 rounded-t-sm relative hover:bg-yellow-200 transition-colors"
                                        style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: '4px' }}
                                    >
                                        {d.count > 0 && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                                {d.count}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-zinc-400 uppercase font-bold">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-zinc-800">Export Report</h3>
                        <button
                            onClick={() => setShowExportModal(false)}
                            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>

                    <p className="text-sm text-zinc-500 mb-6">
                        Choose a format to export your project test report.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleExport('json')}
                            className="w-full flex items-center gap-4 p-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                        >
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                                <FileJson className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">JSON</p>
                                <p className="text-xs text-zinc-500">Structured data for integrations</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full flex items-center gap-4 p-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                        >
                            <div className="p-3 bg-green-100 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">CSV</p>
                                <p className="text-xs text-zinc-500">Spreadsheet compatible format</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('html')}
                            className="w-full flex items-center gap-4 p-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                        >
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">HTML</p>
                                <p className="text-xs text-zinc-500">Styled report for sharing</p>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowExportModal(false)}
                        className="w-full mt-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}

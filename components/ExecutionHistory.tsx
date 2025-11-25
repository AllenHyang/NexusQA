
import React from "react";
import { TestCase, TestStep } from "@prisma/client";
import { ExecutionRecord, TestStatus } from "../types";
import { Bug, Calendar, History, User as UserIcon, ExternalLink, Monitor, Paperclip, Copy } from "lucide-react";
import { formatBugReportMarkdown } from "../lib/formatters";

interface ExecutionHistoryListProps {
  history?: ExecutionRecord[];
  defectTrackerUrl?: string;
  testCase: TestCase & { steps: TestStep[] };
}

export function ExecutionHistoryList({ history, defectTrackerUrl, testCase }: ExecutionHistoryListProps) {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 rounded-xl border border-dashed border-gray-200 mx-4 my-4">
        <History className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-xs font-medium text-gray-500">No history yet</p>
        <p className="text-[10px] text-gray-400 mt-1">Execute this test case to see results here.</p>
      </div>
    );
  }

  // Show newest first
  const sortedHistory = [...history].reverse();

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case "PASSED": return "bg-emerald-500";
      case "FAILED": return "bg-red-500";
      case "BLOCKED": return "bg-amber-500";
      default: return "bg-gray-300";
    }
  };

  const getStatusBorder = (status: TestStatus) => {
    switch (status) {
        case "PASSED": return "border-emerald-100 bg-emerald-50/30";
        case "FAILED": return "border-red-100 bg-red-50/30";
        case "BLOCKED": return "border-amber-100 bg-amber-50/30";
        default: return "border-gray-100 bg-gray-50/30";
      }
  };

  const copyBugReport = (record: ExecutionRecord) => {
    const markdown = formatBugReportMarkdown(testCase, record);
    navigator.clipboard.writeText(markdown)
      .then(() => alert('Bug report copied to clipboard!'))
      .catch((err) => console.error('Failed to copy bug report: ', err));
  };

  return (
    <div className="relative pl-6 pr-4 py-6">
      {/* Connector Line */}
      <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {sortedHistory.map((record) => (
          <div key={record.id} className="relative flex gap-4 group">
            {/* Status Dot */}
            <div className="relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white ring-4 ring-white shadow-sm border border-gray-100">
               <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(record.status as TestStatus)}`} />
            </div>

            {/* Card Content */}
            <div className={`flex-auto rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${getStatusBorder(record.status as TestStatus)}`}>
              <div className="flex items-center justify-between gap-x-4 border-b border-gray-200/50 pb-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-gray-100 shadow-sm`}>
                        {record.status}
                    </span>
                    {record.status === "FAILED" && (
                        <button
                            onClick={() => copyBugReport(record)}
                            className="flex items-center text-red-600 hover:text-red-700 text-xs font-bold transition-colors"
                            title="Copy bug report to clipboard"
                        >
                            <Copy className="w-3 h-3 mr-1" /> Copy Report
                        </button>
                    )}
                    <span className="text-xs text-gray-500 flex items-center">
                        <UserIcon className="w-3 h-3 mr-1" />
                        {record.executedBy}
                    </span>
                </div>
                <time className="text-[10px] text-gray-400 flex items-center bg-white/50 px-2 py-0.5 rounded-full">
                   <Calendar className="w-3 h-3 mr-1" />
                   {new Date(record.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>

              {/* Meta Info Row (Environment & Evidence) */}
              {(record.environment || record.evidence) && (
                  <div className="flex gap-3 mb-2 text-xs text-gray-500">
                      {record.environment && (
                          <span className="flex items-center bg-white/60 px-1.5 py-0.5 rounded border border-gray-200/50">
                              <Monitor className="w-3 h-3 mr-1" /> {record.environment}
                          </span>
                      )}
                      {record.evidence && (
                          <a href={record.evidence} target="_blank" rel="noreferrer" className="flex items-center text-indigo-600 hover:underline">
                              <Paperclip className="w-3 h-3 mr-1" /> Evidence
                          </a>
                      )}
                  </div>
              )}
              
              <div className="text-sm text-gray-700">
                 {record.notes ? (
                    <p className="leading-relaxed">{record.notes}</p>
                 ) : (
                    <p className="text-gray-400 italic text-xs">No execution notes provided.</p>
                 )}
              </div>

              {/* Defect Section */}
              {(record.defects && record.defects.length > 0) ? (
                  <div className="mt-3 flex flex-col gap-2">
                      {record.defects.map(defect => (
                          <a 
                             key={defect.id}
                             href={defect.url || '#'} 
                             target="_blank" 
                             rel="noreferrer"
                             className="flex items-center gap-2 p-2 rounded-lg bg-white border border-red-100 hover:border-red-200 shadow-sm hover:shadow-md transition-all group/defect decoration-0"
                          >
                             <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                                 defect.severity === 'S0' ? 'bg-red-600 text-white' :
                                 defect.severity === 'S1' ? 'bg-orange-500 text-white' :
                                 defect.severity === 'S2' ? 'bg-yellow-500 text-white' :
                                 'bg-blue-500 text-white'
                             }`}>
                                 {defect.severity}
                             </span>
                             <div className="flex flex-col">
                                 <div className="flex items-center gap-1.5">
                                     <span className="text-xs font-bold text-zinc-800 group-hover/defect:text-blue-600 transition-colors flex items-center">
                                         <Bug className="w-3 h-3 mr-1 text-red-500" />
                                         {defect.externalId}
                                     </span>
                                     <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide border border-zinc-100 px-1 rounded bg-zinc-50">
                                         {defect.status}
                                     </span>
                                 </div>
                                 {defect.summary && <span className="text-[10px] text-zinc-500 line-clamp-1 max-w-[200px]">{defect.summary}</span>}
                             </div>
                             <ExternalLink className="w-3 h-3 ml-auto text-zinc-300 group-hover/defect:text-blue-400" />
                          </a>
                      ))}
                  </div>
              ) : record.bugId && (
                 <div className="mt-3 flex">
                    {defectTrackerUrl ? (
                         <a 
                            href={`${defectTrackerUrl}${record.bugId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/10 hover:bg-red-200 transition-colors"
                         >
                            <Bug className="w-3 h-3 mr-1" /> {record.bugId}
                            <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                         </a>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/10">
                           <Bug className="w-3 h-3 mr-1" /> Bug ID: {record.bugId}
                        </span>
                    )}
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
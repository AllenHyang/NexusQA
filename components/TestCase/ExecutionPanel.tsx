import React, { useState, useCallback, useRef } from "react";
import { TestStatus, Defect, ReviewStatus } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, Monitor, Paperclip, Forward, Bug, Save, Upload, X, FileImage, FileVideo, FileText, File } from "lucide-react";
import { DefectSelector } from "@/components/DefectSelector";

interface ExecutionPanelProps {
  env: string;
  setEnv: (s: string) => void;
  evidence: string;
  setEvidence: (s: string) => void;
  note: string;
  setNote: (s: string) => void;

  // File upload props
  stagedFiles: File[];
  onStagedFilesChange: (files: File[]) => void;

  // New Defect Props
  projectDefects: Defect[];
  selectedDefectId: string | null;
  onSelectDefectId: (id: string | null) => void;
  newDefectData: Partial<Defect> | null;
  onNewDefectData: (data: Partial<Defect> | null) => void;

  onExecute: (status: TestStatus) => void;
  reviewStatus: ReviewStatus | null | undefined;
  currentStatus?: TestStatus; // Current status of the test case
}

// Helper to get icon based on mime type
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <FileImage className="w-4 h-4" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ExecutionPanel({
  env, setEnv, evidence, setEvidence, note, setNote,
  stagedFiles, onStagedFilesChange,
  projectDefects, selectedDefectId, onSelectDefectId, newDefectData, onNewDefectData,
  onExecute, reviewStatus, currentStatus
}: ExecutionPanelProps) {
  const isApproved = reviewStatus === 'APPROVED';
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TestStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onStagedFilesChange([...stagedFiles, ...files]);
    }
  }, [stagedFiles, onStagedFilesChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onStagedFilesChange([...stagedFiles, ...files]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stagedFiles, onStagedFilesChange]);

  const removeFile = useCallback((index: number) => {
    const newFiles = stagedFiles.filter((_, i) => i !== index);
    onStagedFilesChange(newFiles);
  }, [stagedFiles, onStagedFilesChange]);

  const handleCreateDefect = (data: Partial<Defect>) => {
      onNewDefectData(data);
      onSelectDefectId(null); // Deselect existing
  };

  const handleSelectDefect = (defect: Defect) => {
      onSelectDefectId(defect.id);
      onNewDefectData(null); // Clear new
  };

  // Select status (does not submit yet)
  const handleSelectStatus = (status: TestStatus) => {
      setSelectedStatus(status);
  };

  // Confirm and submit the execution
  const handleConfirmExecution = async () => {
      if (!selectedStatus) return;
      setIsExecuting(true);
      try {
          await onExecute(selectedStatus);
          setSelectedStatus(null); // Reset selection after successful save
      } finally {
          setIsExecuting(false);
      }
  };

  // Execution result statuses (subset of TestStatus that can be selected during execution)
  type ExecutionStatus = "PASSED" | "FAILED" | "BLOCKED" | "SKIPPED";

  // Get button styling based on whether it's selected
  const getButtonClass = (status: ExecutionStatus) => {
      const baseClass = "py-3.5 rounded-2xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1";
      const isSelected = selectedStatus === status;

      const styles: Record<ExecutionStatus, { selected: string; normal: string }> = {
          PASSED: {
              selected: "bg-green-500 text-white border-green-600 ring-2 ring-green-300 shadow-lg scale-105",
              normal: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:border-green-200 hover:-translate-y-1 hover:shadow-md"
          },
          FAILED: {
              selected: "bg-red-500 text-white border-red-600 ring-2 ring-red-300 shadow-lg scale-105",
              normal: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 hover:-translate-y-1 hover:shadow-md"
          },
          BLOCKED: {
              selected: "bg-orange-500 text-white border-orange-600 ring-2 ring-orange-300 shadow-lg scale-105",
              normal: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 hover:border-orange-200 hover:-translate-y-1 hover:shadow-md"
          },
          SKIPPED: {
              selected: "bg-gray-500 text-white border-gray-600 ring-2 ring-gray-300 shadow-lg scale-105",
              normal: "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-1 hover:shadow-md"
          }
      };

      return `${baseClass} ${styles[status][isSelected ? 'selected' : 'normal']}`;
  };

  return (
      <div className="glass-panel rounded-3xl p-6 border-l-4 border-l-yellow-500 bg-white shadow-xl">
        <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-zinc-800 flex items-center text-lg">
            <CheckCircle2 className="w-5 h-5 mr-2 text-yellow-500"/>
            Execute Test
            </h4>
            {!isApproved && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Not Approved
                </span>
            )}
        </div>
        <div className="mb-5 space-y-4">
           {!isApproved && (
               <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-800 font-medium mb-2">
                   ⚠️ This test case has not been approved yet. Execution is discouraged.
               </div>
           )}
           {/* Environment input */}
           <div className="relative group">
              <Monitor className="w-4 h-4 text-zinc-400 absolute left-3 top-3 group-focus-within:text-zinc-800 transition-colors" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                placeholder="Environment (e.g. Chrome, QA Server)"
                value={env}
                onChange={e => setEnv(e.target.value)}
              />
           </div>

           {/* Evidence Attachments */}
           <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                  <Paperclip className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Evidence Attachments</span>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all
                  ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,application/pdf,text/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className={`w-5 h-5 mx-auto mb-1 ${isDragging ? 'text-blue-500' : 'text-zinc-400'}`} />
                <p className="text-xs font-medium text-zinc-600">
                  Drop files or <span className="text-blue-600">browse</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Images, videos, PDFs (max 10MB each)
                </p>
              </div>

              {/* Staged files list */}
              {stagedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {stagedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-100 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-500">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-700 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Legacy URL input (collapsible) */}
              <details className="mt-2">
                <summary className="text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-600">
                  Or enter URL manually...
                </summary>
                <div className="mt-2 relative group">
                  <Paperclip className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 group-focus-within:text-zinc-800 transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 text-zinc-800"
                    placeholder="Evidence URL (legacy)"
                    value={evidence}
                    onChange={e => setEvidence(e.target.value)}
                  />
                </div>
              </details>
           </div>
          <textarea 
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium placeholder-zinc-400 min-h-[80px] text-zinc-800"
            placeholder="Execution Notes..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          
          {/* Defect Selector */}
          <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                  <Bug className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Defect (If Failed)</span>
              </div>
              
              <DefectSelector 
                  defects={projectDefects}
                  onSelectExisting={handleSelectDefect}
                  onCreateNew={handleCreateDefect}
              />
              
              {selectedDefectId && (
                  <div className="text-xs text-blue-600 font-bold mt-2 flex items-center">
                      <Bug className="w-3 h-3 mr-1" />
                      Linked: {projectDefects.find(d => d.id === selectedDefectId)?.title || "Unknown"}
                  </div>
              )}
              {newDefectData && (
                  <div className="text-xs text-green-600 font-bold mt-2 flex items-center">
                      <Bug className="w-3 h-3 mr-1" />
                      New: &quot;{newDefectData.title}&quot;
                  </div>
              )}
          </div>

        </div>
        {/* Current status indicator */}
        {currentStatus && currentStatus !== 'DRAFT' && currentStatus !== 'UNTESTED' && (
          <div className="mb-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Last Result:</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              currentStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
              currentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
              currentStatus === 'BLOCKED' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {currentStatus}
            </span>
          </div>
        )}

        {/* Status selection buttons */}
        <div className="mb-4">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Select Result</p>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleSelectStatus("PASSED")}
              disabled={isExecuting}
              className={`${getButtonClass("PASSED")} ${isExecuting ? 'opacity-50 cursor-wait' : ''}`}>
              <CheckCircle2 className="w-5 h-5" />
              Pass
            </button>
            <button
              onClick={() => handleSelectStatus("FAILED")}
              disabled={isExecuting}
              className={`${getButtonClass("FAILED")} ${isExecuting ? 'opacity-50 cursor-wait' : ''}`}>
              <XCircle className="w-5 h-5" />
              Fail
            </button>
            <button
              onClick={() => handleSelectStatus("BLOCKED")}
              disabled={isExecuting}
              className={`${getButtonClass("BLOCKED")} ${isExecuting ? 'opacity-50 cursor-wait' : ''}`}>
              <AlertCircle className="w-5 h-5" />
              Block
            </button>
            <button
              onClick={() => handleSelectStatus("SKIPPED")}
              disabled={isExecuting}
              className={`${getButtonClass("SKIPPED")} ${isExecuting ? 'opacity-50 cursor-wait' : ''}`}>
              <Forward className="w-5 h-5" />
              Skip
            </button>
          </div>
        </div>

        {/* Confirm button - only enabled when a status is selected */}
        <button
          onClick={handleConfirmExecution}
          disabled={!selectedStatus || isExecuting}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 ${
            selectedStatus && !isExecuting
              ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-black shadow-lg hover:-translate-y-0.5'
              : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          {isExecuting ? 'Saving...' : 'Save Execution Result'}
        </button>
      </div>
  );
}
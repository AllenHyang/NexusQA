import React, { useState } from "react";
import { Modal, PriorityBadge } from "./ui";
import { FileInput, Upload, AlertCircle } from "lucide-react";
import { parseFile, ImportedTestCase } from "@/lib/importParser";

interface ImportCasesModalProps {
  onClose: () => void;
  projectId: string;
  onImport: (projectId: string, data: ImportedTestCase[]) => void;
}

export function ImportCasesModal({ onClose, projectId, onImport }: ImportCasesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportedTestCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setParsedData(null);
      setError(null);
      setIsParsing(true);

      try {
        const data = await parseFile(selectedFile);
        setParsedData(data);
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("File parsing error:", err);
        setError(err.message || "Failed to parse file. Please check the format.");
        setFile(null);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleImport = () => {
    if (parsedData) {
      onImport(projectId, parsedData);
    }
  };

  return (
    <Modal onClose={onClose} title="Import Test Cases">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-blue-900">Bulk Import from File</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                    Upload a CSV or Excel file to quickly import multiple test cases.
                </p>
            </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex-1 block text-sm font-medium text-gray-700">
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${file ? 'border-blue-300 bg-blue-50/30' : 'border-gray-300 hover:border-gray-400'}`}>
              <div className="space-y-1 text-center">
                <FileInput className={`mx-auto h-12 w-12 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                    {file ? "Change file" : "Upload a file"}
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileChange}
                    />
                  </span>
                  {!file && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">{file ? file.name : "CSV, XLSX up to 10MB"}</p>
                {isParsing && <p className="text-xs text-indigo-500 animate-pulse mt-2">Parsing file...</p>}
              </div>
            </div>
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-100 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {parsedData && parsedData.length > 0 && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden flex flex-col max-h-[300px]">
            <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between items-center">
                <span>Preview ({parsedData.length} cases)</span>
            </div>
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="min-w-full divide-y divide-zinc-100">
                    <thead className="bg-white sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold text-zinc-400">Title</th>
                            <th className="px-4 py-2 text-left text-xs font-bold text-zinc-400">Priority</th>
                            <th className="px-4 py-2 text-left text-xs font-bold text-zinc-400">Steps</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-50">
                        {parsedData.map((row, i) => (
                            <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-4 py-2 text-sm font-medium text-zinc-700 truncate max-w-[200px]" title={row.title}>{row.title}</td>
                                <td className="px-4 py-2 text-sm">
                                    {row.priority && <PriorityBadge priority={row.priority} />}
                                </td>
                                <td className="px-4 py-2 text-xs text-zinc-500">
                                    {row.steps ? `${row.steps.length} steps` : <span className="text-zinc-300 italic">No steps</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={!parsedData || parsedData.length === 0 || isParsing}
            className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isParsing ? "Parsing..." : "Import Cases"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

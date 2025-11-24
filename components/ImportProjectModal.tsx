import React, { useState } from "react";
import { Modal } from "./ui";
import { FileInput, Upload, AlertCircle, Loader2 } from "lucide-react";

interface ImportProjectModalProps {
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ImportProjectModal({ onClose, onImport }: ImportProjectModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previewData, setPreviewData] = useState<any | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsValid(false);
    setPreviewData(null);

    // Basic JSON Validation
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (!json.name) {
          throw new Error("Invalid JSON: Missing project 'name'.");
        }
        setPreviewData(json);
        setIsValid(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch {
        setError("Invalid JSON file. Please ensure it follows the correct schema.");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file || !isValid) return;
    setLoading(true);
    try {
      await onImport(file);
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
       setError(err.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Import Project">
      <div className="space-y-6">
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-start">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                <Upload className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-zinc-900">Import Project from JSON</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                    Upload a JSON file containing project details, test suites, and test cases.
                </p>
            </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex-1 block text-sm font-medium text-gray-700">
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${file ? 'border-zinc-400 bg-zinc-100' : 'border-gray-300 hover:border-gray-400'}`}>
              <div className="space-y-1 text-center">
                <FileInput className={`mx-auto h-12 w-12 ${file ? 'text-zinc-800' : 'text-gray-400'}`} />
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative cursor-pointer rounded-md font-medium text-zinc-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-500 focus-within:ring-offset-2 hover:text-zinc-700">
                    {file ? "Change file" : "Upload a file"}
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept=".json"
                      onChange={handleFileChange}
                    />
                  </span>
                  {!file && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">{file ? file.name : "JSON up to 10MB"}</p>
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

        {previewData && (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
             <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase">
                Preview
             </div>
             <div className="p-4 text-sm text-zinc-700 space-y-2">
                <div><span className="font-bold">Name:</span> {previewData.name}</div>
                <div><span className="font-bold">Suites:</span> {previewData.suites?.length || 0}</div>
                <div><span className="font-bold">Root Cases:</span> {previewData.testCases?.length || 0}</div>
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
            disabled={!isValid || loading}
            className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Importing..." : "Import Project"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

import React from "react";
import { Modal } from "./ui";
import { ExecutionHistoryList } from "./ExecutionHistory";
import { TestCase, ExecutionRecord } from "../types"; // Import TestCase from types.ts
import { TestStep as PrismaTestStep } from "@prisma/client"; // Keep PrismaTestStep if still needed for raw DB types
import { History } from "lucide-react";

interface HistoryModalProps {
  testCase: TestCase & { steps: PrismaTestStep[]; history: ExecutionRecord[] }; // Use TestCase here
  onClose: () => void;
  defectTrackerUrl?: string;
}

export function HistoryModal({ testCase, onClose, defectTrackerUrl }: HistoryModalProps) {
  return (
    <Modal onClose={onClose} title={`History: ${testCase.title}`}>
      <div className="space-y-4">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                <History className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-indigo-900">Execution Timeline</h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                    Audit trail of all test runs, including status changes, tester details, and defect links.
                </p>
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
          <ExecutionHistoryList history={testCase.history} defectTrackerUrl={defectTrackerUrl} testCase={testCase} />
        </div>

        <div className="flex justify-end pt-2">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
                Close History
            </button>
        </div>
      </div>
    </Modal>
  );
}
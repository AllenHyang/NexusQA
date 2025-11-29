"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface SubmitFeedbackProps {
  status: SubmitStatus;
  successMessage?: string;
  errorMessage?: string;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

export function SubmitFeedback({
  status,
  successMessage = "保存成功",
  errorMessage = "保存失败，请重试",
  onDismiss,
  autoHideDuration = 3000,
}: SubmitFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "success" || status === "error") {
      setVisible(true);

      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          onDismiss?.();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else if (status === "submitting") {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [status, autoHideDuration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
        status === "submitting"
          ? "bg-blue-50 border border-blue-200 text-blue-700"
          : status === "success"
          ? "bg-green-50 border border-green-200 text-green-700"
          : "bg-red-50 border border-red-200 text-red-700"
      }`}
    >
      {status === "submitting" && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">正在保存...</span>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="w-5 h-5" />
          <span className="font-medium">{errorMessage}</span>
          {onDismiss && (
            <button
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              className="ml-2 p-1 hover:bg-red-100 rounded"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Validation errors banner component
interface ValidationErrorsBannerProps {
  errors: { field: string; message: string }[];
  onDismiss?: () => void;
}

export function ValidationErrorsBanner({ errors, onDismiss }: ValidationErrorsBannerProps) {
  if (errors.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-700 mb-2">请修正以下错误：</h4>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">
                • {error.message}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Field error message component
interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </p>
  );
}

// Required field indicator
export function RequiredIndicator() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

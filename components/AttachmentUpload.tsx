"use client";

import React, { useState, useCallback, useRef } from "react";
import { Attachment } from "@/types";
import { Upload, FileImage, FileVideo, FileText, File, Trash2, Loader2 } from "lucide-react";

interface AttachmentUploadProps {
  attachments: Attachment[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  disabled?: boolean;
}

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get icon based on mime type
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <FileImage className="w-4 h-4" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

// Check if file is previewable image
function isPreviewableImage(mimeType: string): boolean {
  return ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(mimeType);
}

export function AttachmentUpload({ attachments, onUpload, onDelete, disabled }: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } finally {
        setIsUploading(false);
      }
    }
  }, [disabled, onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } finally {
        setIsUploading(false);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onUpload]);

  const handleDelete = useCallback(async (attachmentId: string) => {
    setDeletingId(attachmentId);
    try {
      await onDelete(attachmentId);
    } finally {
      setDeletingId(null);
    }
  }, [onDelete]);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,application/pdf,text/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-blue-600">Uploading...</span>
          </div>
        ) : (
          <>
            <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-zinc-400'}`} />
            <p className="text-xs font-medium text-zinc-600">
              Drop files here or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Images, videos, PDFs (max 10MB)
            </p>
          </>
        )}
      </div>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100 group"
            >
              {/* Preview thumbnail for images */}
              {isPreviewableImage(attachment.mimeType) ? (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-200 flex-shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center flex-shrink-0 text-zinc-500">
                  {getFileIcon(attachment.mimeType)}
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-zinc-700 truncate block hover:text-blue-600"
                  title={attachment.filename}
                >
                  {attachment.filename}
                </a>
                <p className="text-xs text-zinc-400">
                  {formatFileSize(attachment.size)}
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(attachment.id)}
                disabled={deletingId === attachment.id}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                {deletingId === attachment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Download, X, ExternalLink, Sparkles } from "lucide-react";
import { VersionInfo } from "@/lib/version";

interface UpdateNotificationProps {
  className?: string;
}

export function UpdateNotification({ className = "" }: UpdateNotificationProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user dismissed this version update
    const dismissedVersion = localStorage.getItem("dismissedVersion");

    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version");
        if (res.ok) {
          const data: VersionInfo = await res.json();
          setVersionInfo(data);

          // If user dismissed this specific version, don't show again
          if (dismissedVersion === data.latest) {
            setDismissed(true);
          }
        }
      } catch (err) {
        console.error("Failed to check version:", err);
      } finally {
        setLoading(false);
      }
    };

    checkVersion();
  }, []);

  const handleDismiss = () => {
    if (versionInfo?.latest) {
      localStorage.setItem("dismissedVersion", versionInfo.latest);
    }
    setDismissed(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Don't render if loading, no update, or dismissed
  if (loading || !versionInfo?.hasUpdate || dismissed) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4 shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              新版本可用
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm font-medium">
                v{versionInfo.latest}
              </span>
            </h3>
            <p className="text-white/80 text-sm mt-1">
              当前版本: v{versionInfo.current}
              {versionInfo.publishedAt && (
                <span className="ml-2">
                  发布于 {formatDate(versionInfo.publishedAt)}
                </span>
              )}
            </p>
            {versionInfo.releaseName && (
              <p className="text-white/90 text-sm mt-2 font-medium">
                {versionInfo.releaseName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          title="稍后提醒"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-4">
        {versionInfo.releaseUrl && (
          <a
            href={versionInfo.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-white/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            立即更新
          </a>
        )}
        <a
          href={`https://github.com/AllenHyang/NexusQA/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl font-medium hover:bg-white/30 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          查看更新日志
        </a>
      </div>
    </div>
  );
}

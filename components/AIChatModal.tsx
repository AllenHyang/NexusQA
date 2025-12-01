"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  XCircle,
  Send,
  Sparkles,
  Loader2,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentProjectId?: string;
}

const SUGGESTED_PROMPTS = [
  "显示所有项目的概览统计",
  "查询最近的失败测试用例",
  "列出所有未关闭的缺陷",
  "帮我创建一个登录功能的测试用例",
  "查看当前项目的测试通过率",
];

export function AIChatModal({
  isOpen,
  onClose,
  currentUserId,
  currentProjectId,
}: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        if (isLoading) {
          abortControllerRef.current?.abort();
          setIsLoading(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Add assistant placeholder message
    const assistantMessageId = `msg-${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentUserId,
          currentProjectId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        // Update message content
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: fullContent } : m
          )
        );
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: m.content + "\n\n[已取消]" }
              : m
          )
        );
      } else {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: "抱歉，发生了错误。请重试。" }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      // Remove the last assistant message
      setMessages((prev) => {
        const lastAssistantIndex = prev.map((m) => m.role).lastIndexOf("assistant");
        if (lastAssistantIndex !== -1) {
          return prev.slice(0, lastAssistantIndex);
        }
        return prev;
      });
      setInput(lastUserMessage.content);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI 助手</span>
          {messages.length > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {messages.length}
            </span>
          )}
          <Maximize2 className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">AI 助手</h3>
              <p className="text-xs text-zinc-500">
                可以查询、创建和管理测试数据
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                title="清除对话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              title="最小化"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="关闭"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-violet-600" />
              </div>
              <h4 className="font-semibold text-zinc-900 mb-2">
                你好! 我是 NexusQA AI 助手
              </h4>
              <p className="text-sm text-zinc-500 mb-6 max-w-md">
                我可以帮你查询测试数据、创建测试用例、管理缺陷等。试试下面的建议，或直接输入你的问题。
              </p>

              {/* Suggested prompts */}
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="px-3 py-1.5 text-sm bg-zinc-100 hover:bg-violet-100 text-zinc-700 hover:text-violet-700 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[80%] ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3"
                        : "bg-zinc-100 text-zinc-800 rounded-2xl rounded-bl-md px-4 py-3"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-zinc">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            pre: ({ node, ...props }) => (
                              <pre
                                className="bg-zinc-800 text-zinc-100 rounded-lg p-3 overflow-x-auto text-xs"
                                {...props}
                              />
                            ),
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            code: ({ node, ...props }) => (
                              <code
                                className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded text-xs"
                                {...props}
                              />
                            ),
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto">
                                <table
                                  className="min-w-full text-xs border-collapse"
                                  {...props}
                                />
                              </div>
                            ),
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            th: ({ node, ...props }) => (
                              <th
                                className="border border-zinc-300 bg-zinc-200 px-2 py-1 text-left"
                                {...props}
                              />
                            ),
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            td: ({ node, ...props }) => (
                              <td
                                className="border border-zinc-300 px-2 py-1"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {message.content || "..."}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* Copy button */}
                    {message.content && (
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className={`absolute -bottom-6 right-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          message.role === "user"
                            ? "text-zinc-400 hover:text-zinc-600"
                            : "text-zinc-400 hover:text-zinc-600"
                        }`}
                        title="复制"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">思考中...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          {/* Retry button */}
          {messages.length > 0 && !isLoading && (
            <div className="flex justify-center mb-2">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-500 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                重新生成
              </button>
            </div>
          )}

          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题... (Shift+Enter 换行)"
              className="flex-1 resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all min-h-[48px] max-h-[120px]"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={isLoading ? () => abortControllerRef.current?.abort() : handleSend}
              disabled={!input.trim() && !isLoading}
              className={`p-3 rounded-xl transition-all ${
                isLoading
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : input.trim()
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
              title={isLoading ? "停止生成" : "发送"}
            >
              {isLoading ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-400 mt-2 text-center">
            AI 可能会出错，请验证重要信息
          </p>
        </div>
      </div>
    </div>
  );
}

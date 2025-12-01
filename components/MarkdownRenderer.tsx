"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm prose-zinc max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Customize heading styles
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-zinc-900 mt-4 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-zinc-900 mt-3 mb-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-zinc-800 mt-2 mb-1 first:mt-0">{children}</h3>
        ),
        // Customize paragraph styles
        p: ({ children }) => (
          <p className="text-sm text-zinc-700 my-2 first:mt-0 last:mb-0">{children}</p>
        ),
        // Customize list styles
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1 text-sm text-zinc-700">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1 text-sm text-zinc-700">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-zinc-700">{children}</li>
        ),
        // Customize code styles
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={`block p-3 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-x-auto ${className}`} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-2 overflow-x-auto">{children}</pre>
        ),
        // Customize blockquote styles
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-zinc-300 pl-4 my-2 text-zinc-600 italic">
            {children}
          </blockquote>
        ),
        // Customize table styles
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full border-collapse border border-zinc-200 text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-100">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-900">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-zinc-200 px-3 py-2 text-zinc-700">{children}</td>
        ),
        // Customize link styles
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {children}
          </a>
        ),
        // Customize horizontal rule
        hr: () => <hr className="my-4 border-zinc-200" />,
        // Strong and emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-700">{children}</em>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, AtSign, Users, Mail, Copy, ExternalLink } from "lucide-react";

interface MentionUser {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
  email?: string;
  description?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add a comment...",
  rows = 2,
  className = "",
  disabled = false,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<MentionUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [popupPosition, setPopupPosition] = useState({ bottom: 0, left: 0 });

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (mentionSearch) {
      const search = mentionSearch.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            (u.role && u.role.toLowerCase().includes(search))
        )
      );
    } else {
      setFilteredUsers(users);
    }
    setSelectedIndex(0);
  }, [mentionSearch, users]);

  // Calculate popup position - 向上弹出
  const updatePopupPosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;

    // 向上弹出，使用 bottom 定位
    setPopupPosition({
      bottom: textarea.offsetHeight + 4,
      left: 0,
    });
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if we should show mention popup
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Show popup when @ is typed (even with empty search)
      // Hide only if there's a space/newline in the search query
      if (!/[\n]/.test(textAfterAt) && !textAfterAt.includes(" ")) {
        setMentionStartIndex(lastAtIndex);
        setMentionSearch(textAfterAt);
        setShowMentionPopup(true);
        updatePopupPosition();
        return;
      }
    }

    setShowMentionPopup(false);
    setMentionSearch("");
    setMentionStartIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionPopup && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        selectUser(filteredUsers[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowMentionPopup(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        selectUser(filteredUsers[selectedIndex]);
      }
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  // Select a user from the dropdown
  const selectUser = (user: MentionUser) => {
    if (mentionStartIndex === -1) return;

    const beforeMention = value.slice(0, mentionStartIndex);
    const afterCursor = value.slice(
      mentionStartIndex + 1 + mentionSearch.length
    );

    const newValue = `${beforeMention}@${user.name} ${afterCursor}`;
    onChange(newValue);

    setShowMentionPopup(false);
    setMentionSearch("");
    setMentionStartIndex(-1);

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = beforeMention.length + user.name.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowMentionPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Role label helper
  const getRoleLabel = (role?: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: "管理员",
      QA_LEAD: "测试负责人",
      TESTER: "测试工程师",
      PM: "项目经理",
      DEVELOPER: "开发工程师",
    };
    return role ? roleMap[role] || role : "";
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className={`w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 outline-none text-sm resize-none ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={rows}
        disabled={disabled}
      />

      {/* Mention Popup - 飞书风格 */}
      {showMentionPopup && (
        <div
          ref={dropdownRef}
          className="absolute z-50 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden"
          style={{
            bottom: popupPosition.bottom,
            left: popupPosition.left,
            minWidth: "320px",
            maxWidth: "400px",
          }}
        >
          {/* Header - 所有人选项 */}
          <div className="border-b border-zinc-100">
            <button
              className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 transition-colors ${
                selectedIndex === -1 ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                // 插入 @所有人
                if (mentionStartIndex !== -1) {
                  const beforeMention = value.slice(0, mentionStartIndex);
                  const afterCursor = value.slice(
                    mentionStartIndex + 1 + mentionSearch.length
                  );
                  const newValue = `${beforeMention}@所有人 ${afterCursor}`;
                  onChange(newValue);
                  setShowMentionPopup(false);
                  setMentionSearch("");
                  setMentionStartIndex(-1);
                }
              }}
            >
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                <AtSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-zinc-900">所有人</div>
                <div className="text-xs text-zinc-500">提醒所有成员</div>
              </div>
            </button>
          </div>

          {/* Section Header */}
          <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Users className="w-3.5 h-3.5" />
              <span>团队成员</span>
            </div>
          </div>

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.slice(0, 10).map((user, index) => (
                <button
                  key={user.id}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors ${
                    index === selectedIndex ? "bg-zinc-100" : ""
                  }`}
                  onClick={() => selectUser(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {/* Avatar */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center border border-zinc-200">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 truncate">
                        {user.name}
                      </span>
                      {user.role && (
                        <span className="text-xs text-zinc-400 truncate">
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </div>
                    {user.description && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {user.description}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : mentionSearch ? (
              <div className="px-4 py-6 text-center">
                <div className="text-zinc-400 text-sm">未找到 &ldquo;{mentionSearch}&rdquo;</div>
                <div className="text-zinc-400 text-xs mt-1">请尝试其他关键词</div>
              </div>
            ) : null}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-600">↑↓</span>
              <span>选择</span>
              <span className="px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-600">Enter</span>
              <span>确认</span>
              <span className="px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-600">Esc</span>
              <span>关闭</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to extract mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([^\s@]+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) return [];
  return matches.map((m) => m.slice(1)); // Remove @ prefix
}

// User profile popover component
interface UserPopoverProps {
  user: MentionUser;
  children: React.ReactNode;
}

function UserPopover({ user, children }: UserPopoverProps) {
  const router = useRouter();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const getRoleLabel = (role?: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: "管理员",
      QA_LEAD: "测试负责人",
      TESTER: "测试工程师",
      PM: "项目经理",
      DEVELOPER: "开发工程师",
    };
    return role ? roleMap[role] || role : "";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setShowPopover(!showPopover);
  };

  // Handle send message - copy @mention to clipboard for easy use
  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`@${user.name} `);
    setToastMessage(`已复制 @${user.name} 到剪贴板`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setShowPopover(false);
  };

  // Handle view profile - navigate to users page with user highlighted
  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/users?highlight=${encodeURIComponent(user.id)}`);
    setShowPopover(false);
  };

  // Handle send email - open default email client
  const handleSendEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.email) {
      window.location.href = `mailto:${user.email}`;
      setShowPopover(false);
    }
  };

  // Handle copy email
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setToastMessage(`已复制邮箱地址`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleClick}
        className="text-blue-600 font-medium cursor-pointer hover:underline"
      >
        {children}
      </span>
      {showPopover && (
        <div
          ref={popoverRef}
          className="fixed z-[100] bg-white border border-zinc-200 rounded-xl shadow-xl p-4 min-w-[300px] max-w-[360px]"
          style={{ top: popoverPosition.top, left: popoverPosition.left }}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-zinc-900 text-base">{user.name}</div>
              {user.role && (
                <div className="text-sm text-zinc-500 mt-0.5">
                  {getRoleLabel(user.role)}
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-1.5 mt-1.5 group">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-100 rounded transition-all"
                    title="复制邮箱"
                  >
                    <Copy className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Icon buttons */}
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1 mb-3">
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-600 text-xs rounded-lg hover:bg-zinc-100 transition-colors"
                title="复制@提及"
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>复制@</span>
              </button>
              {user.email && (
                <button
                  onClick={handleSendEmail}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-600 text-xs rounded-lg hover:bg-zinc-100 transition-colors"
                  title="发送邮件"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>发邮件</span>
                </button>
              )}
              <button
                onClick={handleViewProfile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-600 text-xs rounded-lg hover:bg-zinc-100 transition-colors"
                title="查看详细资料"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>资料</span>
              </button>
            </div>

            {/* Main actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                发送消息
              </button>
              <button
                onClick={handleViewProfile}
                className="px-3 py-2 text-zinc-600 text-sm font-medium rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                查看资料
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[200] px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </>
  );
}

// Component to render text with highlighted mentions and user popovers
interface MentionTextProps {
  text: string;
  users?: MentionUser[];
}

export function MentionText({ text, users = [] }: MentionTextProps) {
  const [allUsers, setAllUsers] = useState<MentionUser[]>(users);

  // Fetch users if not provided
  useEffect(() => {
    if (users.length > 0) {
      setAllUsers(users);
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [users]);

  // Build regex pattern from user names (sorted by length desc to match longer names first)
  const userNamePattern = allUsers
    .map((u) => u.name)
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  if (!userNamePattern) {
    // Fallback to simple highlighting if no users loaded
    const parts = text.split(/(@[^\s]+)/g);
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith("@") ? (
            <span key={i} className="text-blue-600 font-medium">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  }

  // Create regex to match @username patterns
  const mentionRegex = new RegExp(`(@(?:${userNamePattern}))`, "g");
  const parts = text.split(mentionRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          const userName = part.slice(1);
          const user = allUsers.find((u) => u.name === userName);
          if (user) {
            return (
              <UserPopover key={i} user={user}>
                {part}
              </UserPopover>
            );
          }
          // Unknown user, just highlight
          return (
            <span key={i} className="text-blue-600 font-medium">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

// Legacy helper (deprecated, use MentionText component instead)
export function renderWithMentions(text: string): React.ReactNode {
  return <MentionText text={text} />;
}

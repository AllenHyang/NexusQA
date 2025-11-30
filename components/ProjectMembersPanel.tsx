"use client";

import React, { useState, useEffect } from "react";
import { ProjectMember, MemberRole, User } from "@/types";
import { Users, Plus, X, Search, Shield, Crown, Eye, UserCircle, Trash2, ChevronDown } from "lucide-react";

interface ProjectMembersPanelProps {
  projectId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: React.ReactNode; color: string }> = {
  OWNER: { label: "Owner", icon: <Crown className="w-3.5 h-3.5" />, color: "text-amber-600 bg-amber-50" },
  ADMIN: { label: "Admin", icon: <Shield className="w-3.5 h-3.5" />, color: "text-blue-600 bg-blue-50" },
  MEMBER: { label: "Member", icon: <UserCircle className="w-3.5 h-3.5" />, color: "text-zinc-600 bg-zinc-100" },
  VIEWER: { label: "Viewer", icon: <Eye className="w-3.5 h-3.5" />, color: "text-zinc-400 bg-zinc-50" },
};

export function ProjectMembersPanel({ projectId, currentUserId, isOpen, onClose }: ProjectMembersPanelProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>("MEMBER");
  const [addingMember, setAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Current user's membership role in this project
  const currentUserMembership = members.find(m => m.userId === currentUserId);
  const canManageMembers = currentUserMembership?.role === "OWNER" || currentUserMembership?.role === "ADMIN";

  // Fetch members
  useEffect(() => {
    if (!isOpen) return;
    fetchMembers();
  }, [isOpen, projectId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available users when adding member
  useEffect(() => {
    if (!showAddMember) return;
    fetchAvailableUsers();
  }, [showAddMember, projectId]);

  const fetchAvailableUsers = async () => {
    try {
      const res = await fetch(`/api/users?projectId=${projectId}&excludeMembers=true`);
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
          invitedBy: currentUserId,
        }),
      });
      if (res.ok) {
        await fetchMembers();
        setShowAddMember(false);
        setSelectedUserId("");
        setSelectedRole("MEMBER");
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: MemberRole) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchMembers();
        setEditingMemberId(null);
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchMembers();
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  // Filter members by search query
  const filteredMembers = members.filter(m =>
    m.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Users className="w-5 h-5 text-zinc-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Project Members</h2>
              <p className="text-xs text-zinc-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-zinc-900"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              {searchQuery ? "No members found" : "No members yet"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-600 font-bold text-sm flex-shrink-0">
                    {member.user?.avatar ? (
                      <img src={member.user.avatar} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.user?.name?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{member.user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{member.user?.email}</p>
                  </div>

                  {/* Role Badge / Dropdown */}
                  {editingMemberId === member.id && canManageMembers && member.role !== "OWNER" ? (
                    <select
                      value={member.role}
                      onChange={e => handleUpdateRole(member.id, e.target.value as MemberRole)}
                      onBlur={() => setEditingMemberId(null)}
                      autoFocus
                      className="text-xs font-medium px-2 py-1 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => canManageMembers && member.role !== "OWNER" && setEditingMemberId(member.id)}
                      disabled={!canManageMembers || member.role === "OWNER"}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${ROLE_CONFIG[member.role as MemberRole]?.color || ROLE_CONFIG.MEMBER.color} ${canManageMembers && member.role !== "OWNER" ? "cursor-pointer hover:opacity-80" : ""}`}
                    >
                      {ROLE_CONFIG[member.role as MemberRole]?.icon || ROLE_CONFIG.MEMBER.icon}
                      {ROLE_CONFIG[member.role as MemberRole]?.label || member.role}
                      {canManageMembers && member.role !== "OWNER" && (
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                  )}

                  {/* Remove Button */}
                  {canManageMembers && member.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Member Section */}
        {canManageMembers && (
          <div className="border-t border-zinc-200 p-6">
            {showAddMember ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900">Add Member</h3>
                  <button onClick={() => setShowAddMember(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* User Select */}
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>

                {/* Role Select */}
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as MemberRole)}
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                {/* Add Button */}
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || addingMember}
                  className="w-full px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addingMember ? "Adding..." : "Add Member"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-200 rounded-xl text-sm font-semibold text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

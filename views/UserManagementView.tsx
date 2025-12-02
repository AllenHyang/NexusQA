"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { User, Role } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { Users, Plus, Search, Edit2, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

const ROLES: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "QA_LEAD", label: "QA Lead" },
  { value: "TESTER", label: "Tester" },
  { value: "PM", label: "Project Manager" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "PRODUCT_MANAGER", label: "Product Manager" },
];

const getRoleBadgeColor = (role: Role) => {
  switch (role) {
    case "ADMIN": return "bg-red-100 text-red-700";
    case "QA_LEAD": return "bg-purple-100 text-purple-700";
    case "TESTER": return "bg-blue-100 text-blue-700";
    case "PM": return "bg-green-100 text-green-700";
    case "DEVELOPER": return "bg-orange-100 text-orange-700";
    case "PRODUCT_MANAGER": return "bg-teal-100 text-teal-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: (data: { name: string; email: string; role: Role; avatar?: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function UserModal({ isOpen, onClose, user, onSave, isLoading, error }: UserModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<Role>(user?.role || "TESTER");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email || "");
      setRole(user.role);
      setAvatar(user.avatar || "");
    } else {
      setName("");
      setEmail("");
      setRole("TESTER");
      setAvatar("");
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ name, email, role, avatar: avatar || undefined });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-zinc-800">
            {user ? "Edit User" : "Add New User"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">
              Avatar URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-zinc-500 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {user ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isLoading: boolean;
  error: string | null;
  details?: Record<string, number>;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading, error, details }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-800">Delete User</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{error}</span>
            </div>
            {details && (
              <ul className="text-xs mt-2 space-y-1 pl-6">
                {details.authoredTestCases > 0 && <li>Authored test cases: {details.authoredTestCases}</li>}
                {details.assignedTestCases > 0 && <li>Assigned test cases: {details.assignedTestCases}</li>}
                {details.authoredDefects > 0 && <li>Authored defects: {details.authoredDefects}</li>}
                {details.assignedDefects > 0 && <li>Assigned defects: {details.assignedDefects}</li>}
                {details.projectMemberships > 0 && <li>Project memberships: {details.projectMemberships}</li>}
              </ul>
            )}
          </div>
        )}

        {!error && (
          <p className="text-zinc-600 mb-6">
            Are you sure you want to delete <span className="font-bold">{userName}</span>? This action cannot be undone.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-zinc-500 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          {!error && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserManagementView() {
  const { users, loadUsers, createUser, updateUser, deleteUser } = useAppStore();
  const searchParams = useSearchParams();
  const highlightUserId = searchParams.get("highlight");

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteDetails, setDeleteDetails] = useState<Record<string, number> | undefined>(undefined);

  // Refs for scrolling to highlighted user
  const userRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle highlight effect and scroll to user
  useEffect(() => {
    if (highlightUserId && users.length > 0) {
      setHighlightedId(highlightUserId);

      // Scroll to the highlighted user after a short delay
      setTimeout(() => {
        const userElement = userRefs.current[highlightUserId];
        if (userElement) {
          userElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);

      // Remove highlight effect after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightUserId, users]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenModal = (user?: User) => {
    setEditingUser(user);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
    setError(null);
  };

  const handleSave = async (data: { name: string; email: string; role: Role; avatar?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
      } else {
        await createUser(data);
      }
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteError(null);
    setDeleteDetails(undefined);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
    setDeleteDetails(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        handleCloseDeleteModal();
      } else {
        setDeleteError(result.error || "Failed to delete user");
        setDeleteDetails(result.details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h2>
          <p className="text-gray-500 mt-2">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all"
        />
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">All Users</h3>
            <p className="text-xs text-gray-500">{filteredUsers.length} users found</p>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try a different search or add a new user</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                ref={(el) => { userRefs.current[user.id] = el; }}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-all duration-500 group ${
                  highlightedId === user.id
                    ? "bg-blue-50 ring-2 ring-blue-400 ring-inset"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-zinc-500">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 truncate">{user.name}</p>
                  <p className="text-sm text-zinc-500 truncate">{user.email || "No email"}</p>
                </div>

                {/* Role Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                  {ROLES.find((r) => r.value === user.role)?.label || user.role}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                    title="Edit user"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(user)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSave={handleSave}
        isLoading={isLoading}
        error={error}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name || ""}
        isLoading={isLoading}
        error={deleteError}
        details={deleteDetails}
      />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users2,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Shield,
  Eye,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const ITEMS_PER_PAGE = 8;

export function HODUsersPage() {
  const {
    users,
    updateUser,
    deleteUser,
    toggleUserStatus,
    sendPasswordReset,
    hodCount,
    hodMax,
    isHodLimitReached,
  } = useCampusData();
  const { user: currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'role' | 'status'>('name');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Dialogs
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Departments list for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set).sort();
  }, [users]);

  // Filtered & sorted users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (roleFilter !== 'All' && u.role !== roleFilter) return false;
        if (departmentFilter !== 'All' && u.department !== departmentFilter) return false;
        if (statusFilter !== 'All' && u.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = u.name.toLowerCase().includes(q);
          const matchEmail = u.email.toLowerCase().includes(q);
          const matchDept = u.department.toLowerCase().includes(q);
          const matchId = (u.employeeId || u.collegeId || '').toLowerCase().includes(q);
          return matchName || matchEmail || matchDept || matchId;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'department') return a.department.localeCompare(b.department);
        if (sortBy === 'role') return a.role.localeCompare(b.role);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
      });
  }, [users, roleFilter, departmentFilter, statusFilter, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditDepartment(u.department);
    setEditPhone(u.phone || '');
    setEditRole(u.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, {
        name: editName.trim(),
        department: editDepartment.trim(),
        phone: editPhone.trim(),
        role: editRole,
      });
      success('User Updated', `${editName}'s records were saved successfully.`);
      setEditingUser(null);
    } catch (err: any) {
      error('Update Error', err.message || 'Could not update user particulars.');
    }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      await toggleUserStatus(u.id);
      success(
        'Status Changed',
        `${u.name} is now ${u.status === 'Active' ? 'Inactive (Login Blocked)' : 'Active'}.`
      );
    } catch (err: any) {
      error('Status Update Failed', err.message);
    }
  };

  const handleResetPassword = async (u: User) => {
    try {
      await sendPasswordReset(u.email);
      success('Password Reset Dispatched', `Reset email sent to ${u.email}`);
    } catch (err: any) {
      error('Reset Failed', err.message || 'Could not send reset email.');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.id);
      success('User Deleted', `${deletingUser.name} was removed from the database.`);
      setDeletingUser(null);
    } catch (err: any) {
      error('Delete Error', err.message || 'Could not delete user.');
    }
  };

  return (
    <HODRouteGuard pageTitle="User Directory & Administration">
      <div className="space-y-6">
        <HODPageHeader
          title="User Directory & Academic Personnel"
          badge={`Live: ${users.length} Users · HODs: ${hodCount} / ${hodMax}`}
          description="Centralized campus directory. Review registered accounts, commission leadership, manage roles, and enforce security policies."
          breadcrumbs={[{ label: 'User Directory' }]}
          actions={
            <div className="flex items-center gap-2">
              {isHodLimitReached ? (
                <button
                  disabled
                  title="Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one."
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-300 px-3.5 py-2 text-xs font-semibold text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add HOD (Limit 3/3)</span>
                </button>
              ) : (
                <Link
                  to="/hod/users/add"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add HOD ({hodCount}/{hodMax})</span>
                </Link>
              )}
            </div>
          }
        />

        {/* HOD Limit Alert Banner if limit is reached */}
        {isHodLimitReached && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Maximum Limit of 3 HODs Reached</p>
              <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one.
              </p>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, department, ID..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="All">All Roles</option>
                <option value="hod">HOD (Head of Dept)</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span>
              Showing <strong>{filteredUsers.length}</strong> cloud database records
            </span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <option value="name">Name</option>
                <option value="department">Department</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">User Particulars</th>
                  <th className="px-5 py-3.5 font-semibold">Department</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">ID / Registered</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No users in the database yet. Click <strong>+ Add HOD</strong> to register personnel.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => {
                    const isHODRole = u.role === 'hod';
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs uppercase ${
                                isHODRole
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                  {u.name}
                                </span>
                                {isHODRole && (
                                  <Award className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                )}
                                {isSelf && (
                                  <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-500">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                            {u.department}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'hod'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : u.role === 'admin'
                                ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                                : u.role === 'faculty'
                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                                : u.role === 'coordinator'
                                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {u.role === 'hod' ? 'Head of Dept (HOD)' : u.role}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              u.status === 'Active'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-neutral-400'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                            {u.employeeId || u.collegeId || u.id.substring(0, 8)}
                          </p>
                          <span className="text-[10px] text-neutral-400">{u.lastActive || 'Registered'}</span>
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingUser(u)}
                              title="View Profile"
                              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit Credentials & Role"
                              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(u)}
                              title="Send Firebase Password Reset Email"
                              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => handleToggleStatus(u)}
                                title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                                  u.status === 'Active'
                                    ? 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300'
                                    : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
                                }`}
                              >
                                {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            {!isSelf && (
                              <button
                                onClick={() => setDeletingUser(u)}
                                title="Delete User Document"
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/60 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded p-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded p-1 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Profile Dossier Modal */}
        {viewingUser && (
          <Modal
            isOpen={!!viewingUser}
            onClose={() => setViewingUser(null)}
            title="Personnel Profile Dossier"
            subtitle={`Official university records for ${viewingUser.name}`}
            maxWidth="md"
          >
            <div className="space-y-4 py-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm uppercase">
                  {viewingUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                    {viewingUser.name}
                  </h4>
                  <p className="text-neutral-500">{viewingUser.email}</p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      viewingUser.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {viewingUser.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Department</span>
                  <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
                    {viewingUser.department}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Assigned Role</span>
                  <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200 uppercase">
                    {viewingUser.role}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Employee / Roll ID</span>
                  <p className="mt-1 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {viewingUser.employeeId || viewingUser.collegeId || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Phone Contact</span>
                  <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
                    {viewingUser.phone || 'Not recorded'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="rounded-lg bg-neutral-900 px-4 py-2 font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <Modal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            title="Edit User Particulars"
            subtitle={`Updating institutional profile for ${editingUser.name}`}
            maxWidth="sm"
          >
            <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Institutional Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="facility_manager">Facility Manager</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-neutral-300 px-3.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
          title="Delete Personnel Account"
          message={`Are you sure you want to permanently delete ${deletingUser?.name}? Their access to campus facilities will be revoked.`}
          confirmLabel="Delete Account"
          cancelLabel="Keep Account"
          variant="danger"
        />
      </div>
    </HODRouteGuard>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users2,
  Shield,
  Search,
  UserCheck,
  UserX,
  Edit2,
  CheckCircle2,
  Clock,
  MoreVertical,
  Plus,
  Trash2,
  Award,
} from 'lucide-react';
import { userService } from '../services/userService';
import { User, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function UserManagementPage() {
  const [searchParams] = useSearchParams();
  const { user: currentUser, isHOD, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Change Role Modal
  const [changingRoleUser, setChangingRoleUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');

  // Deactivate/Activate Confirm Dialog
  const [togglingUser, setTogglingUser] = useState<User | null>(null);

  // Delete User Dialog
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Add User / HOD Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('campus123');
  const [addCollegeId, setAddCollegeId] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('hod');
  const [addDepartment, setAddDepartment] = useState('Computer Science');
  const [addPhone, setAddPhone] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    loadUsers();
    const action = searchParams.get('action');
    if (action === 'add-hod') {
      setAddRole('hod');
      setIsAddUserModalOpen(true);
    } else if (action === 'add') {
      setIsAddUserModalOpen(true);
    }
  }, [searchParams]);

  const loadUsers = async () => {
    setLoading(true);
    const list = await userService.getAll();
    setUsers(list);
    setLoading(false);
  };

  const handleChangeRole = async () => {
    if (!changingRoleUser) return;
    await userService.updateRole(changingRoleUser.id, newRole);
    success('Role Updated', `${changingRoleUser.name}'s role updated to ${newRole}.`);
    setChangingRoleUser(null);
    loadUsers();
  };

  const handleToggleStatus = async () => {
    if (!togglingUser) return;
    await userService.toggleStatus(togglingUser.id);
    success(
      'Account Status Changed',
      `${togglingUser.name}'s account has been ${togglingUser.status === 'Active' ? 'deactivated' : 'activated'}.`
    );
    setTogglingUser(null);
    loadUsers();
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await userService.deleteUser(deletingUser.id);
      success('User Removed', `${deletingUser.name} has been removed from the university directory.`);
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      error('Failed to Remove User', err.message || 'Error occurred while removing user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    try {
      await userService.register({
        name: addName.trim(),
        email: addEmail.trim(),
        collegeId: addCollegeId.trim() || `ID-${Date.now().toString(36).toUpperCase()}`,
        role: addRole,
        department: addDepartment,
        phone: addPhone.trim(),
        password: addPassword.trim(),
      });
      success(
        addRole === 'hod' ? 'New HOD Created' : 'User Created',
        `Successfully created ${addRole === 'hod' ? 'Head of Department (HOD)' : addRole} account for ${addName}.`
      );
      setIsAddUserModalOpen(false);
      resetUserForm();
      loadUsers();
    } catch (err: any) {
      error('Creation Error', err.message || 'Could not register user account.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const resetUserForm = () => {
    setAddName('');
    setAddEmail('');
    setAddPassword('campus123');
    setAddCollegeId('');
    setAddRole('hod');
    setAddDepartment('Computer Science');
    setAddPhone('');
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        (u.collegeId && u.collegeId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              User Directory & Access Control
            </h2>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {users.length} Total Users
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Manage campus user roles, authorize permissions, remove accounts, and appoint Head of Department (HOD) leaders.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add User / HOD</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['All', 'hod', 'faculty', 'student', 'coordinator', 'facility_manager', 'admin'].map(
            (r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                  roleFilter === r
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, roll ID..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingState message="Loading directory records..." />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">College ID</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isHODUser = u.role === 'hod';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                              isHODUser
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-neutral-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                        {u.collegeId || 'General'}
                      </td>

                      <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                        {u.department}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${
                            isHODUser
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          <Shield className="h-3 w-3 text-indigo-500" />
                          <span>{u.role.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'
                            }`}
                          />
                          <span>{u.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setChangingRoleUser(u);
                              setNewRole(u.role);
                            }}
                            className="rounded border border-neutral-300 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          >
                            Role
                          </button>
                          <button
                            onClick={() => setTogglingUser(u)}
                            className="rounded border border-neutral-300 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="rounded border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                              title="Delete user"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD USER / HOD MODAL */}
      {isAddUserModalOpen && (
        <Modal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          title="Add User / Head of Department (HOD)"
          subtitle="Provision university credentials and assign administrative access privileges"
          maxWidth="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Wu"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  College Email
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Set initial password"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  College Roll / ID Number
                </label>
                <input
                  type="text"
                  required
                  value={addCollegeId}
                  onChange={(e) => setAddCollegeId(e.target.value)}
                  placeholder="Enter ID number"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Assigned User Role
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-medium"
                >
                  <option value="hod">Head of Department (HOD) - Full Authority</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="student">Student Scholar</option>
                  <option value="coordinator">Department Coordinator</option>
                  <option value="facility_manager">Facility Manager</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Academic Department
                </label>
                <select
                  value={addDepartment}
                  onChange={(e) => setAddDepartment(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Campus Operations & Academic Affairs">Campus Operations & Academic Affairs</option>
                  <option value="School of Management (MBA)">School of Management (MBA)</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingUser}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmittingUser ? 'Registering...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CHANGE ROLE MODAL */}
      {changingRoleUser && (
        <Modal
          isOpen={!!changingRoleUser}
          onClose={() => setChangingRoleUser(null)}
          title={`Modify Permissions for ${changingRoleUser.name}`}
          subtitle="Change account tier and administrative capability scope"
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-medium"
              >
                <option value="hod">Head of Department (HOD) - Complete Authority</option>
                <option value="faculty">Faculty Member</option>
                <option value="student">Student Scholar</option>
                <option value="coordinator">Department Coordinator</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setChangingRoleUser(null)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Confirm Role Update
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* STATUS TOGGLE CONFIRM DIALOG */}
      {togglingUser && (
        <ConfirmDialog
          isOpen={!!togglingUser}
          onClose={() => setTogglingUser(null)}
          onConfirm={handleToggleStatus}
          title={togglingUser.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
          message={`Are you sure you want to ${
            togglingUser.status === 'Active' ? 'deactivate' : 'activate'
          } ${togglingUser.name}'s account (${togglingUser.email})?`}
          confirmLabel={togglingUser.status === 'Active' ? 'Deactivate' : 'Activate'}
          variant={togglingUser.status === 'Active' ? 'danger' : 'primary'}
        />
      )}

      {/* DELETE USER CONFIRM DIALOG */}
      {deletingUser && (
        <ConfirmDialog
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
          title="Remove User Account"
          message={`Are you sure you want to permanently remove ${deletingUser.name} (${deletingUser.email}) from the university system? This action cannot be undone.`}
          confirmLabel="Yes, Remove User"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}

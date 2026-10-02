import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { userService } from '../services/userService';
import { User, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Change Role Modal
  const [changingRoleUser, setChangingRoleUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');

  // Deactivate/Activate Confirm Dialog
  const [togglingUser, setTogglingUser] = useState<User | null>(null);

  const { success } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

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

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          User Directory & Access Control
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Manage campus user roles, student authorizations, and administrative security privileges.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['All', 'student', 'faculty', 'coordinator', 'hod', 'admin', 'facility_manager'].map(
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
            placeholder="Search name, email, or dept..."
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
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Last Active</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-neutral-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                      {u.department}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800 capitalize dark:bg-neutral-800 dark:text-neutral-200">
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

                    <td className="px-5 py-3.5 text-[11px] text-neutral-500 font-mono">
                      {u.lastActive}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setChangingRoleUser(u);
                            setNewRole(u.role);
                          }}
                          className="rounded border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => setTogglingUser(u)}
                          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                            u.status === 'Active'
                              ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {changingRoleUser && (
        <Modal
          isOpen={!!changingRoleUser}
          onClose={() => setChangingRoleUser(null)}
          title="Modify User Security Role"
          subtitle={`Assign role for ${changingRoleUser.name} (${changingRoleUser.email})`}
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Select Platform Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="club">Club / Student Organization</option>
                <option value="coordinator">Department Coordinator</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            <p className="text-[11px] text-neutral-500">
              Role adjustments take effect on next login token validation. Higher privileges provide approval and asset quarantine clearance.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setChangingRoleUser(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Apply Role
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      {togglingUser && (
        <ConfirmDialog
          isOpen={!!togglingUser}
          onClose={() => setTogglingUser(null)}
          onConfirm={handleToggleStatus}
          title={`${togglingUser.status === 'Active' ? 'Deactivate' : 'Reactivate'} Account`}
          message={`Are you sure you want to ${
            togglingUser.status === 'Active'
              ? 'deactivate access for'
              : 'restore access for'
          } ${togglingUser.name}? ${
            togglingUser.status === 'Active'
              ? 'They will be barred from creating bookings or approving requests.'
              : 'Their login privileges will be restored immediately.'
          }`}
          confirmLabel={togglingUser.status === 'Active' ? 'Yes, Deactivate' : 'Yes, Activate'}
          variant={togglingUser.status === 'Active' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
}

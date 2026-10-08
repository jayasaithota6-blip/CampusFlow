import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Network,
  Users,
  Edit2,
  Plus,
  Calendar,
  Building,
  Mail,
  UserCheck,
  Search,
  Trash2,
  Shield,
  Layers,
} from 'lucide-react';
import { departmentService } from '../services/departmentService';
import { Department } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function DepartmentManagementPage() {
  const [searchParams] = useSearchParams();
  const { isHOD, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Department Modal
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editCoordName, setEditCoordName] = useState('');
  const [editCoordEmail, setEditCoordEmail] = useState('');
  const [editHODName, setEditHODName] = useState('');

  // Delete Department Dialog
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  // Add Department Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCoord, setNewCoord] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newHOD, setNewHOD] = useState('');

  const { success, error } = useToast();

  useEffect(() => {
    loadDepartments();
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const loadDepartments = async () => {
    setLoading(true);
    const data = await departmentService.getAll();
    setDepartments(data);
    setLoading(false);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setEditName(d.name);
    setEditCode(d.code);
    setEditCoordName(d.coordinatorName);
    setEditCoordEmail(d.coordinatorEmail);
    setEditHODName(d.hodName || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      await departmentService.updateDepartment(editingDept.id, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        coordinatorName: editCoordName.trim(),
        coordinatorEmail: editCoordEmail.trim(),
        hodName: editHODName.trim(),
      });
      success('Department Updated', `${editName} governance particulars saved.`);
      setEditingDept(null);
      loadDepartments();
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update department.');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDept) return;
    try {
      await departmentService.deleteDepartment(deletingDept.id);
      success('Department Removed', `${deletingDept.name} has been removed.`);
      setDeletingDept(null);
      loadDepartments();
    } catch (err: any) {
      error('Deletion Failed', err.message || 'Could not delete department.');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    try {
      await departmentService.addDepartment({
        name: newName.trim(),
        code: newCode.trim().toUpperCase(),
        coordinatorName: newCoord.trim() || 'Unassigned',
        coordinatorEmail: newEmail.trim(),
        hodName: newHOD.trim() || 'Campus HOD',
        totalBookings: 0,
        upcomingEvents: 0,
        usagePercentage: 15,
      });

      success('Department Created', `${newName} has been registered successfully.`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewCode('');
      setNewCoord('');
      setNewEmail('');
      setNewHOD('');
      loadDepartments();
    } catch (err: any) {
      error('Creation Failed', err.message || 'Could not create department.');
    }
  };

  const filteredDepts = departments.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.coordinatorName.toLowerCase().includes(q) ||
      (d.hodName && d.hodName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Academic Department Governance
            </h2>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {departments.length} Active Departments
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Oversee academic schools, assign faculty coordinators, and maintain Head of Department leadership.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by department name, code, or HOD..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Departments Table */}
      {loading ? (
        <LoadingState message="Loading department hierarchy..." />
      ) : filteredDepts.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          No departments matching your query.
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Department & Code</th>
                  <th className="px-5 py-3.5 font-semibold">Faculty Coordinator</th>
                  <th className="px-5 py-3.5 font-semibold">Department HOD</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Total Bookings</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Upcoming Events</th>
                  <th className="px-5 py-3.5 font-semibold">Space Share</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredDepts.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                          {d.name}
                        </span>
                        <span className="ml-2 font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded dark:bg-indigo-950 dark:text-indigo-400">
                          {d.code}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {d.coordinatorName}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">{d.coordinatorEmail}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                        <Shield className="h-3 w-3 text-amber-600" />
                        <span>{d.hodName || 'Campus HOD'}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {d.totalBookings}
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-emerald-600 font-semibold dark:text-emerald-400">
                      {d.upcomingEvents}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600"
                            style={{ width: `${Math.min(100, d.usagePercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-neutral-500">
                          {d.usagePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="rounded border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingDept(d)}
                          className="rounded border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                          title="Delete Department"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* EDIT DEPARTMENT MODAL */}
      {editingDept && (
        <Modal
          isOpen={!!editingDept}
          onClose={() => setEditingDept(null)}
          title={`Edit ${editingDept.name}`}
          subtitle="Update department code, assigned coordinator, and Head of Department"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department Code
              </label>
              <input
                type="text"
                required
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Faculty Coordinator Name
              </label>
              <input
                type="text"
                required
                value={editCoordName}
                onChange={(e) => setEditCoordName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Coordinator Email
              </label>
              <input
                type="email"
                required
                value={editCoordEmail}
                onChange={(e) => setEditCoordEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Head of Department (HOD)
              </label>
              <input
                type="text"
                required
                value={editHODName}
                onChange={(e) => setEditHODName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD DEPARTMENT MODAL */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register Academic Department"
          subtitle="Add an engineering school or academic division to CampusFlow"
          maxWidth="sm"
        >
          <form onSubmit={handleAddDepartment} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Electrical Engineering"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department Code
              </label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. EE"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Faculty Coordinator
              </label>
              <input
                type="text"
                required
                value={newCoord}
                onChange={(e) => setNewCoord(e.target.value)}
                placeholder="e.g. Prof. David Miller"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Coordinator Email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter coordinator email address"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department Head (HOD)
              </label>
              <input
                type="text"
                required
                value={newHOD}
                onChange={(e) => setNewHOD(e.target.value)}
                placeholder="e.g. Dr. Jennifer Wu"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Create Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deletingDept && (
        <ConfirmDialog
          isOpen={!!deletingDept}
          onClose={() => setDeletingDept(null)}
          onConfirm={handleDeleteDepartment}
          title="Delete Department"
          message={`Are you sure you want to delete ${deletingDept.name} (${deletingDept.code})? Space allocations and coordinator assignments will be retired.`}
          confirmLabel="Yes, Delete Department"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}

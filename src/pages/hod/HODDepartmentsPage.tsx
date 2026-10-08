import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building,
  Mail,
  UserCheck,
  Award,
  Users,
  Calendar,
  X,
} from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { Department } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export function HODDepartmentsPage() {
  const { departments, users, updateDepartment, deleteDepartment } = useCampusData();
  const { success, error } = useToast();

  const realHODs = users.filter((u) => u.role === 'hod' && u.status === 'Active');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Edit State
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editHOD, setEditHOD] = useState('');
  const [editCoordinator, setEditCoordinator] = useState('');
  const [editCoordEmail, setEditCoordEmail] = useState('');
  const [editStaffCount, setEditStaffCount] = useState(18);
  const [editStudentCount, setEditStudentCount] = useState(250);

  // Delete State
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.coordinatorName.toLowerCase().includes(q) ||
        d.hodName.toLowerCase().includes(q)
      );
    });
  }, [departments, searchQuery]);

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setEditName(dept.name);
    setEditCode(dept.code);
    setEditHOD(dept.hodName);
    setEditCoordinator(dept.coordinatorName);
    setEditCoordEmail(dept.coordinatorEmail);
    setEditStaffCount(dept.staffCount || 20);
    setEditStudentCount(dept.studentCount || 300);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      await updateDepartment(editingDept.id, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        hodName: editHOD.trim(),
        coordinatorName: editCoordinator.trim(),
        coordinatorEmail: editCoordEmail.trim(),
        staffCount: Number(editStaffCount),
        studentCount: Number(editStudentCount),
      });
      success('Department Updated', `${editName} governance particulars saved.`);
      setEditingDept(null);
    } catch (err: any) {
      error('Update Error', err.message || 'Could not update department.');
    }
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    try {
      await deleteDepartment(deletingDept.id);
      success('Department Removed', `${deletingDept.name} was removed.`);
      setDeletingDept(null);
    } catch (err: any) {
      error('Delete Error', err.message || 'Could not delete department.');
    }
  };

  return (
    <HODRouteGuard pageTitle="Academic Departments">
      <div className="space-y-6">
        <HODPageHeader
          title="Academic Departments"
          badge={`${departments.length} Departments`}
          description="University academic units, faculty leadership rosters, coordinators, and facility usage quotas. Appoint HODs and coordinate campus operations."
          breadcrumbs={[{ label: 'Academic Departments' }]}
          actions={
            <Link
              to="/hod/departments/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Dept</span>
            </Link>
          }
        />

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments, code, HOD name..."
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <span className="text-xs text-neutral-500 self-end sm:self-center">
            <strong>{filteredDepartments.length}</strong> academic units active
          </span>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full py-16 text-center text-neutral-500 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800">
              No academic departments found. Click <strong>+ Add Dept</strong> to commission a department.
            </div>
          ) :
            filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-indigo-600 px-2.5 py-1 font-mono font-bold text-xs text-white">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">Unit ID</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingDept(dept)}
                      title="Delete Department"
                      className="rounded p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {dept.name}
                </h3>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-amber-600" />
                      Appointed HOD:
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {dept.hodName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                      Coordinator:
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {dept.coordinatorName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      Enrollment:
                    </span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {dept.studentCount || 280} Students · {dept.staffCount || 22} Faculty
                    </span>
                  </div>
                </div>

                {/* Utilization meter */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-neutral-500">Campus Facility Usage</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {dept.usagePercentage || 75}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${dept.usagePercentage || 75}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  onClick={() => setSelectedDept(dept)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Governance Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Department Detail Drawer / Modal */}
        {selectedDept && (
          <Modal
            isOpen={!!selectedDept}
            onClose={() => setSelectedDept(null)}
            title={`${selectedDept.name} (${selectedDept.code})`}
            subtitle="Department Governance & Infrastructure Particulars"
            maxWidth="md"
          >
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Head of Department</span>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {selectedDept.hodName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Coordinator</span>
                  <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {selectedDept.coordinatorName}
                  </p>
                  <p className="text-[11px] text-neutral-500">{selectedDept.coordinatorEmail}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Infrastructure & Utilization Metrics
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-neutral-200 p-2.5 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase">Bookings</span>
                    <p className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedDept.totalBookings || 120}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 p-2.5 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase">Faculty</span>
                    <p className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedDept.staffCount || 22}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 p-2.5 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-500 uppercase">Scholars</span>
                    <p className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedDept.studentCount || 340}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Department Modal */}
        {editingDept && (
          <Modal
            isOpen={!!editingDept}
            onClose={() => setEditingDept(null)}
            title="Edit Academic Department"
            subtitle={`Updating particulars for ${editingDept.name}`}
            maxWidth="sm"
          >
            <form onSubmit={handleSaveEdit} className="space-y-3.5 py-2 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs font-mono uppercase text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Appointed HOD
                  </label>
                  {realHODs.length > 0 ? (
                    <select
                      value={editHOD}
                      onChange={(e) => setEditHOD(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <option value="">-- Select Appointed HOD --</option>
                      {realHODs.map((h) => (
                        <option key={h.id} value={h.name}>
                          {h.name} ({h.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={editHOD}
                      onChange={(e) => setEditHOD(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editCoordinator}
                    onChange={(e) => setEditCoordinator(e.target.value)}
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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

        {/* Delete Confirm */}
        {deletingDept && (
          <ConfirmDialog
            isOpen={!!deletingDept}
            onClose={() => setDeletingDept(null)}
            onConfirm={handleDelete}
            title="Remove Academic Department"
            message={`Are you sure you want to remove ${deletingDept.name} (${deletingDept.code})? All associated quotas and coordinator records will be archived.`}
            confirmLabel="Delete Department"
            variant="danger"
          />
        )}
      </div>
    </HODRouteGuard>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Network,
  Users,
  Edit2,
  Plus,
  Calendar,
  Building,
  Mail,
  UserCheck,
} from 'lucide-react';
import { departmentService } from '../services/departmentService';
import { Department } from '../types';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Coordinator Modal
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');

  // Add Department Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCoord, setNewCoord] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newHOD, setNewHOD] = useState('');

  const { success } = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    const data = await departmentService.getAll();
    setDepartments(data);
    setLoading(false);
  };

  const handleUpdateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    await departmentService.updateCoordinator(editingDept.id, coordName, coordEmail);
    success('Coordinator Updated', `${editingDept.name} coordinator changed to ${coordName}.`);
    setEditingDept(null);
    loadDepartments();
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    await departmentService.addDepartment({
      name: newName,
      code: newCode.toUpperCase(),
      coordinatorName: newCoord,
      coordinatorEmail: newEmail,
      hodName: newHOD,
      totalBookings: 0,
      upcomingEvents: 0,
      usagePercentage: 10,
    });

    success('Department Created', `${newName} has been added.`);
    setIsAddModalOpen(false);
    setNewName('');
    setNewCode('');
    loadDepartments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Academic Department Governance
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Manage college departments, faculty coordinators, and space booking privileges.
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

      {/* Departments Table */}
      {loading ? (
        <LoadingState message="Loading department hierarchy..." />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">Department & Code</th>
                  <th className="px-5 py-3 font-semibold">Faculty Coordinator</th>
                  <th className="px-5 py-3 font-semibold">Department HOD</th>
                  <th className="px-5 py-3 font-semibold text-center">Total Bookings</th>
                  <th className="px-5 py-3 font-semibold text-center">Upcoming Events</th>
                  <th className="px-5 py-3 font-semibold">Utilization %</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {dept.name}
                      </p>
                      <span className="font-mono text-[10px] text-neutral-400 font-bold">
                        {dept.code}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {dept.coordinatorName}
                      </p>
                      <p className="text-[11px] text-neutral-500">{dept.coordinatorEmail}</p>
                    </td>

                    <td className="px-5 py-3.5 text-neutral-700 dark:text-neutral-300">
                      {dept.hodName}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-center text-neutral-900 dark:text-neutral-100">
                      {dept.totalBookings}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-center text-indigo-600 dark:text-indigo-400">
                      {dept.upcomingEvents}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                            style={{ width: `${dept.usagePercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                          {dept.usagePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setCoordName(dept.coordinatorName);
                          setCoordEmail(dept.coordinatorEmail);
                        }}
                        className="inline-flex items-center gap-1 rounded border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Manage Coordinator</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANAGE COORDINATOR MODAL */}
      {editingDept && (
        <Modal
          isOpen={!!editingDept}
          onClose={() => setEditingDept(null)}
          title="Assign Department Coordinator"
          subtitle={`Department: ${editingDept.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateCoordinator} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Coordinator Name
              </label>
              <input
                type="text"
                required
                value={coordName}
                onChange={(e) => setCoordName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Coordinator College Email
              </label>
              <input
                type="email"
                required
                value={coordEmail}
                onChange={(e) => setCoordEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
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
                Save Assignment
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
          title="Add Academic Department"
          subtitle="Establish a new department with authorization hierarchy"
          maxWidth="md"
        >
          <form onSubmit={handleAddDepartment} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Aerospace Engineering"
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
                  placeholder="e.g. AERO"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Coordinator Name
                </label>
                <input
                  type="text"
                  value={newCoord}
                  onChange={(e) => setNewCoord(e.target.value)}
                  placeholder="Prof. Jane Doe"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Coordinator Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane.doe@campus.edu"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Head of Department (HOD)
              </label>
              <input
                type="text"
                value={newHOD}
                onChange={(e) => setNewHOD(e.target.value)}
                placeholder="Dr. Gregory Vance"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
    </div>
  );
}

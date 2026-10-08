import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, Plus, ArrowLeft, Building2 } from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';

export function HODAddDepartmentPage() {
  const navigate = useNavigate();
  const { addDepartment, users } = useCampusData();
  const { success, error } = useToast();

  const realHODs = users.filter((u) => u.role === 'hod' && u.status === 'Active');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedHodId, setSelectedHodId] = useState(realHODs[0]?.id || '');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [staffCount, setStaffCount] = useState('24');
  const [studentCount, setStudentCount] = useState('320');
  const [building, setBuilding] = useState('Engineering Block');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      error('Validation Error', 'Department name and unique code are required.');
      return;
    }

    const matchedHod = users.find((u) => u.id === selectedHodId);

    setIsSubmitting(true);
    try {
      await addDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        hodName: matchedHod ? matchedHod.name : 'Unassigned HOD',
        hodId: matchedHod ? matchedHod.id : '',
        coordinatorName: coordinatorName.trim() || 'Academic Coordinator',
        coordinatorEmail: coordinatorEmail.trim(),
        staffCount: Number(staffCount) || 20,
        studentCount: Number(studentCount) || 300,
        totalBookings: 0,
        upcomingEvents: 0,
        usagePercentage: 15,
      });

      success(
        'Department Registered',
        `${name} (${code.toUpperCase()}) has been added to the university academic charter.`
      );
      navigate('/hod/departments');
    } catch (err: any) {
      error('Creation Error', err.message || 'Could not register department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HODRouteGuard pageTitle="Register Academic Department">
      <div className="space-y-6 max-w-3xl">
        <HODPageHeader
          title="Register Academic Department"
          badge="University Charter"
          description="Provision a new departmental governance unit, establish department code, and appoint initial leadership and coordinator contacts."
          breadcrumbs={[
            { label: 'Academic Departments', href: '/hod/departments' },
            { label: 'Add Department' },
          ]}
          actions={
            <Link
              to="/hod/departments"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Departments</span>
            </Link>
          }
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department Name */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Department Code */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Department Code (Acronym) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. AIDS or AI-DS"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 font-mono uppercase text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Appointed HOD */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Appointed Head of Department (HOD) <span className="text-rose-500">*</span>
                </label>
                {realHODs.length > 0 ? (
                  <select
                    value={selectedHodId}
                    onChange={(e) => setSelectedHodId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="">-- Select Appointed HOD --</option>
                    {realHODs.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-500 text-[11px] dark:border-neutral-800 dark:bg-neutral-800">
                    No HOD accounts registered yet. Appoint one via User Directory.
                  </div>
                )}
              </div>

              {/* Coordinator Name */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Faculty Coordinator Name
                </label>
                <input
                  type="text"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  placeholder="e.g. Prof. Ananya Sengupta"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Coordinator Email */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Coordinator Contact Email
                </label>
                <input
                  type="email"
                  value={coordinatorEmail}
                  onChange={(e) => setCoordinatorEmail(e.target.value)}
                  placeholder="Enter coordinator email address"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Building Block */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Primary Campus Building / Complex
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Computer Science Block">Computer Science Block</option>
                  <option value="Engineering Block">Engineering Block</option>
                  <option value="Main Academic Block">Main Academic Block</option>
                  <option value="Auditorium Complex">Auditorium Complex</option>
                  <option value="Sports Complex & Arena">Sports Complex & Arena</option>
                </select>
              </div>

              {/* Student Count */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Estimated Student Enrollees
                </label>
                <input
                  type="number"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Staff Count */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Estimated Faculty & Staff
                </label>
                <input
                  type="number"
                  value={staffCount}
                  onChange={(e) => setStaffCount(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/hod/departments"
                className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Academic Unit'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </HODRouteGuard>
  );
}

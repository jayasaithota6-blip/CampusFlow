import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Building,
  Mail,
  Phone,
  Hash,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';

export function HODAddUserPage() {
  const navigate = useNavigate();
  const { departments, addUser, hodCount, hodMax, isHodLimitReached } = useCampusData();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [department, setDepartment] = useState(
    departments[0]?.name || 'Campus Operations & Academic Affairs'
  );
  const [role, setRole] = useState<UserRole>('hod');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
    success('Strong Password Generated', 'Copied to password field. It meets Firebase authentication requirements.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      error('Validation Error', 'Name and official email are required.');
      return;
    }

    if (role === 'hod' && isHodLimitReached) {
      error(
        'Limit Exceeded',
        'Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one.'
      );
      return;
    }

    if (!password || password.length < 8) {
      error('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        employeeId: employeeId.trim(),
        collegeId: employeeId.trim(),
        department: department.trim(),
        role,
        status: 'Active',
        password: password.trim(),
      });

      success(
        'Account Provisioned',
        `Account successfully registered for ${name} (${role.toUpperCase()}) in ${department}. They can log in immediately.`
      );
      navigate('/hod/users');
    } catch (err: any) {
      error('Provisioning Error', err.message || 'Could not create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HODRouteGuard pageTitle="Appoint Head of Department">
      <div className="space-y-6 max-w-3xl">
        <HODPageHeader
          title="Appoint & Provision Campus Personnel"
          badge={`Live: HODs ${hodCount} / ${hodMax}`}
          description="Register and provision institutional cloud credentials for a new Campus Head of Department (HOD) or academic staff member."
          breadcrumbs={[
            { label: 'User Directory', href: '/hod/users' },
            { label: 'Add User / HOD Form' },
          ]}
          actions={
            <Link
              to="/hod/users"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Directory</span>
            </Link>
          }
        />

        {/* HOD Limit Alert */}
        {role === 'hod' && isHodLimitReached && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Maximum limit of 3 HODs reached</p>
              <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one.
              </p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/60">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs text-amber-900 dark:text-amber-300">
                Accounts created here receive a real <strong>Firebase Authentication</strong> login. The credentials are encrypted in Firebase Auth; passwords are never stored in Firestore.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name & Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address (Gmail or Campus) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Employee ID / Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter ID number"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Academic Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Campus Operations & Academic Affairs">
                        Campus Operations & Academic Affairs
                      </option>
                      <option value="Computer Science & Engineering">
                        Computer Science & Engineering
                      </option>
                      <option value="Electronics & Communication">
                        Electronics & Communication
                      </option>
                    </>
                  )}
                </select>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Assigned Authority Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="hod">Head of Department (HOD) [Max 3 across campus]</option>
                  <option value="coordinator">Department Coordinator</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="facility_manager">Facility Manager</option>
                  <option value="student">Student / Scholar</option>
                  <option value="admin">Campus Administrator</option>
                </select>
              </div>

              {/* Password with generator & toggle */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                    Authentication Password (min 8 characters) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate strong password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 pr-10 font-mono text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/hod/users"
                className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || (role === 'hod' && isHodLimitReached)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-50 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <UserCheck className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? 'Provisioning Account...'
                    : role === 'hod' && isHodLimitReached
                    ? 'HOD Limit (3/3) Reached'
                    : `Provision ${role === 'hod' ? 'Head of Department' : 'User Account'}`}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </HODRouteGuard>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, getRouteForRole } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  IdCard,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { UserRole } from '../types';

export function SignUpPage() {
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated, loading: authLoading, signup } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Redirect to dashboard if session already active
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const targetRoute = getRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const DEFAULT_DEPARTMENTS = [
    { id: 'cs', name: 'Computer Science & Engineering', code: 'CSE' },
    { id: 'ece', name: 'Electronics & Communication', code: 'ECE' },
    { id: 'mech', name: 'Mechanical & Mechatronics', code: 'MECH' },
    { id: 'civil', name: 'Civil & Environmental Engineering', code: 'CIVIL' },
    { id: 'ops', name: 'Campus Operations & Administration', code: 'ADMIN' },
    { id: 'mgmt', name: 'School of Management Studies', code: 'MBA' },
  ];

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
    setShowPassword(true);
    success('Strong Password Generated', 'Filled into password fields. Be sure to note it down.');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) newErrors.name = 'Full name is required';

    const trimmedCollegeId = collegeId.trim();
    if (!trimmedCollegeId) newErrors.collegeId = 'College Roll / Employee ID is required';

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Official university email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!department) {
      newErrors.department = 'Please select a department';
    }

    if (!role) {
      newErrors.role = 'Please select an account role';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must accept the campus facility guidelines';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const newUser = await signup({
        name: trimmedName,
        collegeId: trimmedCollegeId.toUpperCase(),
        employeeId: trimmedCollegeId.toUpperCase(),
        email: trimmedEmail,
        department,
        role: role as UserRole,
        phone: phone.trim(),
        password,
      });

      success(
        'Account Registered',
        `Welcome to CampusFlow, ${newUser.name}! Your account role is ${newUser.role.toUpperCase()}.`
      );
      const targetRoute = getRouteForRole(newUser.role);
      navigate(targetRoute);
    } catch (err: any) {
      const msg = err.message || 'Could not register account.';
      error('Sign Up Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 sm:px-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Lockup */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-xl shadow-md">
              CF
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Create University Account
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Join the campus facility booking and resource network
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Enter your full name"
                  className={`block w-full rounded-lg border py-2.5 pl-9 pr-3 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                    errors.name
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                  University Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Enter your email address"
                    className={`block w-full rounded-lg border py-2.5 pl-9 pr-3 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                      errors.email
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="block w-full rounded-lg border border-neutral-300 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            {/* Roll / Employee ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                  Roll / Employee ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <IdCard className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={collegeId}
                    onChange={(e) => {
                      setCollegeId(e.target.value);
                      if (errors.collegeId) setErrors((prev) => ({ ...prev, collegeId: undefined }));
                    }}
                    placeholder="Enter your ID number"
                    className={`block w-full rounded-lg border py-2.5 pl-9 pr-3 text-xs uppercase outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                      errors.collegeId
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                    }`}
                  />
                </div>
                {errors.collegeId && <p className="mt-1 text-[11px] text-rose-600">{errors.collegeId}</p>}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                  Academic Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <select
                    required
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
                    }}
                    className={`block w-full rounded-lg border py-2.5 px-3 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                      errors.department
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                    }`}
                  >
                    <option value="" disabled>Select department</option>
                    {DEFAULT_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && <p className="mt-1 text-[11px] text-rose-600">{errors.department}</p>}
              </div>
            </div>

            {/* Role Selection (HOD is omitted from public sign-up as required) */}
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300">
                Account Role <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as UserRole);
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                className={`mt-1 block w-full rounded-lg border py-2.5 px-3 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                  errors.role
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                }`}
              >
                <option value="" disabled>Select role</option>
                <option value="student">Student / Scholar</option>
                <option value="faculty">Faculty Member / Professor</option>
                <option value="coordinator">Department Coordinator</option>
                <option value="facility_manager">Facilities & Grounds Manager</option>
                <option value="gate_staff">Gate Security Officer</option>
              </select>
              {errors.role && <p className="mt-1 text-[11px] text-rose-600">{errors.role}</p>}
            </div>

            {/* Password with generator & toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Password (min 8 chars) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Generate strong password</span>
                </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Create a password"
                  className={`block w-full rounded-lg border py-2.5 pl-9 pr-10 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                    errors.password
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-rose-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter your password"
                  className={`block w-full rounded-lg border py-2.5 pl-9 pr-10 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                    errors.confirmPassword
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-neutral-600 dark:text-neutral-400">
                I agree to the university facility code of conduct and access guidelines
              </label>
            </div>
            {errors.terms && <p className="text-[11px] text-rose-600">{errors.terms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-100 pt-4 text-center dark:border-neutral-800">
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export function LoginPage() {
  const [email, setEmail] = useState('rahul.s@campus.edu');
  const [password, setPassword] = useState('campus@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, availableDemoUsers } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'College email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please provide a valid college email address (@campus.edu)';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email, undefined, password);
      success('Authentication Successful', `Welcome back to CampusFlow.`);
      navigate('/dashboard');
    } catch (err: any) {
      error('Authentication Error', err.message || 'Invalid credentials or inactive account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    const demoUser = availableDemoUsers.find((u) => u.role === role);
    const targetEmail = demoUser ? demoUser.email : `${role}@campus.edu`;

    await login(targetEmail, role);
    success('Logged in as Demo User', `Active as ${role.replace('_', ' ').toUpperCase()}`);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 sm:px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Lockup */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-xl shadow-md">
              CF
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Sign in to CampusFlow
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Smart Campus Facility Booking & Resource Management System
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                College Email or Roll / ID Number
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu or CS-2026-084"
                  className={`block w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                    errors.email
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions dispatched to your college email.')}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none transition-colors dark:bg-neutral-800 dark:text-neutral-100 ${
                    errors.password
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-neutral-300 focus:border-indigo-600 dark:border-neutral-700'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-xs text-neutral-600 dark:text-neutral-400"
              >
                Remember me on this workstation
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* New User Registration Callout */}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              New user wanting to book campus facilities?{' '}
              <Link to="/signup" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Sign Up / Register Here
              </Link>
            </p>
          </div>

          {/* Demo User Fast Logins */}
          <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 mb-3 text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Continue as Demo User</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-left text-xs font-medium text-neutral-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Student</span>
                <span className="text-[10px] text-neutral-400">Rahul</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('faculty')}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-left text-xs font-medium text-neutral-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Faculty</span>
                <span className="text-[10px] text-neutral-400">Dr. Thorne</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('hod')}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-left text-xs font-medium text-neutral-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>HOD</span>
                <span className="text-[10px] text-neutral-400">Dr. Vance</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-left text-xs font-medium text-neutral-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Admin</span>
                <span className="text-[10px] text-neutral-400">Sarah</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('facility_manager')}
                className="col-span-2 flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-left text-xs font-medium text-neutral-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Facility Manager</span>
                <span className="text-[10px] text-neutral-400">Vikram (Gate & Ops)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400">
          <Link to="/" className="hover:text-neutral-600 dark:hover:text-neutral-300">
            ← Back to public campus landing page
          </Link>
        </div>
      </div>
    </div>
  );
}

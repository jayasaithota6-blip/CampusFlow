import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, getRouteForRole } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { user, isAuthenticated, loading: authLoading, login, resetPassword } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Redirect to role-specific dashboard if session is already active
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const targetRoute = getRouteForRole(user.role);
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Registered email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const loggedInUser = await login(trimmedEmail, password);
      success(
        'Authentication Successful',
        `Welcome back, ${loggedInUser.name}! Accessing ${loggedInUser.role ? loggedInUser.role.toUpperCase() : 'USER'} portal.`
      );
      const targetRoute = getRouteForRole(loggedInUser.role);
      navigate(targetRoute);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify your credentials.';
      error('Authentication Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = resetEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      error('Invalid Email', 'Please enter a valid registered email address.');
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(trimmed);
      success('Password Reset Dispatched', 'Check your inbox for instructions to reset your password.');
      setIsResetModalOpen(false);
      setResetEmail('');
    } catch (err: any) {
      error('Reset Failed', err.message || 'Could not send reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-xl shadow-md">
              CF
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Login to CampusFlow
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Enter your credentials to continue
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
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
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setIsResetModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
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
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* New User Registration Callout */}
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-center dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-400">
          <Link to="/" className="hover:text-neutral-600 dark:hover:text-neutral-300">
            ← Back to public campus landing page
          </Link>
        </div>
      </div>

      {/* Forgot Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset University Password"
        subtitle="We will send a password reset link to your registered email address."
        maxWidth="sm"
      >
        <form onSubmit={handleResetSubmit} className="space-y-4 py-2 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="rounded-lg border border-neutral-300 bg-white px-3.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResetting}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

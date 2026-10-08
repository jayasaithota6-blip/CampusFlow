import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HODRouteGuardProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function HODRouteGuard({ children, pageTitle = 'Campus HOD Operations' }: HODRouteGuardProps) {
  const { user, role, isHOD, isAdmin } = useAuth();
  const navigate = useNavigate();

  const isAuthorized = isHOD || isAdmin || role === 'hod' || user?.role === 'hod';

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Access Restricted: HOD Authorization Required
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            You are currently signed in as{' '}
            <strong className="text-neutral-800 dark:text-neutral-200">{user?.name || 'Scholar'}</strong> ({user?.role || 'student'}).
            The <strong>{pageTitle}</strong> console is restricted to Campus Heads of Department (HOD) and University Administrators.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            Need HOD Access?
          </p>
          <p>
            Please login with an authorized Head of Department (HOD) account to access administrative facilities and management.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Login as Campus HOD</span>
          </Link>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

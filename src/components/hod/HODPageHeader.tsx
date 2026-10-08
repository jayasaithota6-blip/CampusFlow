import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HODPageHeaderProps {
  title: string;
  badge?: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function HODPageHeader({
  title,
  badge,
  description,
  breadcrumbs = [],
  actions,
}: HODPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
      {/* Top row: Breadcrumbs and Back to HOD Dashboard button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <Link
            to="/dashboard"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3 text-neutral-400" />
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">HOD Operations</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-neutral-400" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>← Back to HOD Dashboard</span>
        </button>
      </div>

      {/* Title, Badge, Description, and Action slot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-3xl">
            {description}
          </p>
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

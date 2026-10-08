import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Redirect unauthenticated visitors to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Route restrictions based on role
  if (role === 'student' || role === 'faculty') {
    const studentRestricted = [
      '/approvals',
      '/admin',
      '/resources',
      '/maintenance',
      '/users',
      '/analytics',
      '/departments',
      '/qr-verification',
      '/settings',
    ];
    if (studentRestricted.some((path) => location.pathname.startsWith(path))) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (role === 'hod') {
    const hodRestricted = [
      '/admin',
      '/resources',
      '/maintenance',
      '/users',
      '/analytics',
      '/departments',
      '/settings',
    ];
    if (hodRestricted.some((path) => location.pathname.startsWith(path))) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  PlusCircle,
  Sparkles,
  ClipboardList,
  CheckSquare,
  Package,
  Wrench,
  Users2,
  Network,
  BarChart3,
  MapPin,
  QrCode,
  Bell,
  HelpCircle,
  Settings,
  User,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, role, isHOD, isAdmin, requestLogout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (isHOD || isAdmin || role === 'hod') {
      bookingService.getAll().then((list) => {
        const count = list.filter((b) => b.status === 'Pending' || b.status === 'Under Review').length;
        setPendingCount(count);
      });
    }
  }, [isHOD, isAdmin, role]);

  // Full access for HOD & Admin
  const isManagement = isHOD || isAdmin || role === 'hod';

  const mainLinks = isManagement
    ? [
        { name: 'HOD Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Approvals Console', path: '/approvals', icon: CheckSquare, badge: pendingCount > 0 ? `${pendingCount}` : undefined },
        { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
        { name: 'Manage Facilities', path: '/facilities', icon: Building2 },
        { name: 'All Reservations', path: '/my-bookings', icon: ClipboardList },
        { name: 'Book Facility', path: '/book', icon: PlusCircle },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Explore Facilities', path: '/facilities', icon: Building2 },
        { name: 'Book Facility', path: '/book', icon: PlusCircle },
        { name: 'Smart Recommendations', path: '/recommendations', icon: Sparkles },
        { name: 'My Bookings', path: '/my-bookings', icon: ClipboardList },
        { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ];

  const adminLinks = isManagement
    ? [
        { name: 'User Directory & Add HOD', path: '/hod/users', icon: Users2 },
        { name: 'Academic Departments', path: '/hod/departments', icon: Network },
        { name: 'Equipment & Resources', path: '/hod/equipment', icon: Package },
        { name: 'Maintenance Orders', path: '/hod/maintenance', icon: Wrench },
        { name: 'QR Gate Verification', path: '/hod/gate-scanner', icon: QrCode },
        { name: 'Campus Analytics', path: '/hod/analytics', icon: BarChart3 },
        { name: 'Admin Suite', path: '/hod/admin-suite', icon: ShieldAlert },
        { name: 'Campus Map', path: '/hod/campus-map', icon: MapPin },
      ]
    : [];

  const utilityLinks = [
    { name: 'User Profile', path: '/profile', icon: User },
    ...(isManagement ? [{ name: 'System Settings', path: '/settings', icon: Settings }] : []),
    { name: 'Help & Guides', path: '/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out dark:border-neutral-800 dark:bg-neutral-900 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-6 dark:border-neutral-800">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-xs">
              CF
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                CampusFlow
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                {isManagement ? 'HOD Operations' : 'Facility & Resource'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Authenticated User Status Bar */}
        <div className="border-b border-neutral-100 p-3 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/30">
          <div className="flex items-center gap-2 px-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 capitalize truncate">
              {user?.name || 'Authenticated User'}
            </span>
            <span className="ml-auto rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase shrink-0">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Main Links */}
          <div className="space-y-1">
            {mainLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Admin / HOD Links */}
          {adminLinks.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Campus Administration
              </span>
              {adminLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* Utility Links */}
          <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Account & Help
            </span>
            {utilityLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer: User profile snippet & logout button */}
        <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
              </div>
              <div className="overflow-hidden text-left">
                <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-[10px] text-neutral-500 capitalize">
                  {user?.role ? user.role.replace('_', ' ') : 'Student'} {user?.collegeId ? `· ${user.collegeId}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={requestLogout}
              title="Logout session"
              className="rounded p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

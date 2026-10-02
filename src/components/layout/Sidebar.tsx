import React from 'react';
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
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, role, switchRole, logout } = useAuth();

  // Role-based Nav Items Definition
  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Admin Console', path: '/admin', icon: LayoutDashboard },
          { name: 'Facilities Directory', path: '/facilities', icon: Building2 },
          { name: 'All Bookings', path: '/my-bookings', icon: ClipboardList },
          { name: 'Approvals Queue', path: '/approvals', icon: CheckSquare },
          { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
          { name: 'Equipment & Resources', path: '/resources', icon: Package },
          { name: 'Maintenance Tracker', path: '/maintenance', icon: Wrench },
          { name: 'User Management', path: '/users', icon: Users2 },
          { name: 'Departments', path: '/departments', icon: Network },
          { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
          { name: 'Interactive Campus Map', path: '/campus-map', icon: MapPin },
          { name: 'Scan & Verify QR', path: '/qr-verification', icon: QrCode },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Platform Settings', path: '/settings', icon: Settings },
        ];
      case 'coordinator':
      case 'hod':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Approvals & Requests', path: '/approvals', icon: CheckSquare },
          { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
          { name: 'Explore Facilities', path: '/facilities', icon: Building2 },
          { name: 'Book Facility', path: '/book', icon: PlusCircle },
          { name: 'Department Bookings', path: '/my-bookings', icon: ClipboardList },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Campus Map', path: '/campus-map', icon: MapPin },
          { name: 'My Profile', path: '/profile', icon: User },
        ];
      case 'facility_manager':
        return [
          { name: 'Operations Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Facilities Directory', path: '/facilities', icon: Building2 },
          { name: 'Bookings & Schedule', path: '/my-bookings', icon: ClipboardList },
          { name: 'Resource Depot', path: '/resources', icon: Package },
          { name: 'Maintenance & Repairs', path: '/maintenance', icon: Wrench },
          { name: 'Scan & Verify QR', path: '/qr-verification', icon: QrCode },
          { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Campus Map', path: '/campus-map', icon: MapPin },
        ];
      case 'student':
      case 'faculty':
      case 'club':
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Explore Facilities', path: '/facilities', icon: Building2 },
          { name: 'Book Facility', path: '/book', icon: PlusCircle },
          { name: 'Smart Recommendation', path: '/recommendations', icon: Sparkles },
          { name: 'My Bookings', path: '/my-bookings', icon: ClipboardList },
          { name: 'Campus Calendar', path: '/calendar', icon: CalendarDays },
          { name: 'Campus Map', path: '/campus-map', icon: MapPin },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'User Profile', path: '/profile', icon: User },
          { name: 'Help & Guides', path: '/help', icon: HelpCircle },
        ];
    }
  };

  const navLinks = getNavLinks();

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
                Facility & Resource
              </span>
            </div>
          </NavLink>
        </div>

        {/* Quick Demo Role Switcher Capsule */}
        <div className="border-b border-neutral-100 p-3 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-800/40">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Demo Active Role
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Shield className="h-3 w-3" />
              {role.replace('_', ' ')}
            </span>
          </div>
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as any)}
            className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium text-neutral-800 shadow-2xs outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="student">Student (Rahul Sharma)</option>
            <option value="faculty">Faculty (Dr. Thorne)</option>
            <option value="club">Club / Org (Robotics Lead)</option>
            <option value="coordinator">Coordinator (Prof. Elena)</option>
            <option value="hod">HOD (Dr. Marcus Vance)</option>
            <option value="admin">Administrator (Sarah Jenkins)</option>
            <option value="facility_manager">Facility Manager (Vikram Patel)</option>
          </select>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navLinks.map((item) => (
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

        {/* User Card & Logout Footer */}
        <div className="border-t border-neutral-100 p-3 dark:border-neutral-800">
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {user?.name.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="overflow-hidden text-left">
                <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.name || 'Guest'}
                </p>
                <p className="truncate text-[10px] text-neutral-500 capitalize">
                  {user?.role.replace('_', ' ') || 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
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

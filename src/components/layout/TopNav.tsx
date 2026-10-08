import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Plus,
  LogOut,
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { GlobalSearchModal } from './GlobalSearchModal';

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const { user, role, requestLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    notificationService.getByUser(user?.id || 'usr-student-01').then((items) => {
      setUnreadCount(items.filter((i) => !i.read).length);
    });
  }, [location.pathname, user?.id]);

  // Global keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format breadcrumb title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'CampusFlow Overview';
    if (path === '/dashboard') return 'Campus Operations Dashboard';
    if (path === '/facilities') return 'Facility Discovery & Catalog';
    if (path.startsWith('/facilities/')) return 'Facility Detail & Availability';
    if (path === '/calendar') return 'Campus Master Calendar';
    if (path === '/book') return 'New Facility Booking Wizard';
    if (path === '/recommendations') return 'Smart Facility Recommendation';
    if (path === '/my-bookings') return 'Booking Records & Management';
    if (path.startsWith('/bookings/')) return 'Booking Dossier';
    if (path === '/approvals') return 'Facility Approvals Console';
    if (path === '/resources') return 'Equipment & Resource Inventory';
    if (path === '/maintenance') return 'Facility Maintenance & Work Orders';
    if (path === '/qr-verification') return 'QR Entry Pass Verification';
    if (path === '/notifications') return 'Notification Center';
    if (path === '/admin') return 'Campus Administration Suite';
    if (path === '/analytics') return 'Campus Facility Analytics';
    if (path === '/departments') return 'Academic Departments';
    if (path === '/users') return 'User Directory & Permissions';
    if (path === '/campus-map') return 'Interactive Campus Ground Map';
    if (path === '/profile') return 'My Profile';
    if (path === '/settings') return 'Preferences & System Settings';
    if (path === '/help') return 'Support Knowledgebase & FAQs';
    return 'CampusFlow';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 sm:px-6">
        {/* Left: Mobile hamburger & breadcrumb / page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-base">
              {getPageTitle()}
            </h1>
            <div className="hidden items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 md:flex">
              <span>CampusFlow</span>
              <span aria-hidden="true">/</span>
              <span className="capitalize">{role.replace('_', ' ')} Portal</span>
            </div>
          </div>
        </div>

        {/* Center/Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search trigger button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-400 dark:hover:border-neutral-700"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search campus...</span>
            <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 shadow-2xs border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 md:inline">
              ⌘K
            </kbd>
          </button>

          {/* Quick "Book Facility" primary button */}
          <Link
            to="/book"
            className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Book Facility</span>
          </Link>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark and light color theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-neutral-600" />
                <span className="hidden md:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* Notifications bell */}
          <Link
            to="/notifications"
            className="relative rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-750 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Session Logout button */}
          <button
            onClick={requestLogout}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sign out of account"
            aria-label="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, ClipboardList, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Explore', path: '/facilities', icon: Building2 },
    { label: 'Book', path: '/book', icon: PlusCircle, isPrimary: true },
    { label: 'Bookings', path: '/my-bookings', icon: ClipboardList },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-neutral-200 bg-white/95 px-2 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
              item.isPrimary
                ? 'text-indigo-600 dark:text-indigo-400'
                : isActive
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-400 dark:text-neutral-500'
            )
          }
        >
          <item.icon className={cn('h-5 w-5', item.isPrimary && 'h-6 w-6')} />
          <span>{item.label}</span>
        </NavLink>
      ))}

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <Menu className="h-5 w-5" />
        <span>Menu</span>
      </button>
    </nav>
  );
}

import React from 'react';
import { BookingStatus, FacilityStatus } from '../../types';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: BookingStatus | FacilityStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  let styleClasses = 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
  let dotColor = 'bg-neutral-500';

  switch (status) {
    case 'Available':
    case 'Confirmed':
    case 'Admin Approved':
    case 'Completed':
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      dotColor = 'bg-emerald-500';
      break;
    case 'Pending':
    case 'Under Review':
    case 'Coordinator Approved':
    case 'HOD Approved':
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      dotColor = 'bg-amber-500';
      break;
    case 'Booked':
    case 'Unavailable':
      styleClasses = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      dotColor = 'bg-blue-500';
      break;
    case 'Under Maintenance':
    case 'Maintenance':
      styleClasses = 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      dotColor = 'bg-orange-500';
      break;
    case 'Rejected':
    case 'Cancelled':
    case 'Restricted':
      styleClasses = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      dotColor = 'bg-rose-500';
      break;
    default:
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-medium tracking-tight whitespace-nowrap',
        sizeClasses,
        styleClasses,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

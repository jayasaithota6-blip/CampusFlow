import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Wrench,
  Clock,
  Layers,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { EmptyState, LoadingState } from '../components/common/EmptyState';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const { success } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const list = await notificationService.getAll();
    setNotifications(list);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    success('Notifications Updated', 'All notifications marked as read.');
    loadNotifications();
  };

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'All') return true;
    return n.category === categoryFilter;
  });

  const getCategoryIcon = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'Booking':
        return <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Approval':
        return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'Maintenance':
        return <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'Facility':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Notification Center
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Real-time campus operational alerts, status transitions, and schedule reminders.
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
        >
          <CheckCheck className="h-4 w-4 text-neutral-500" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        {['All', 'Booking', 'Approval', 'Facility', 'Maintenance', 'System'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingState message="Loading alerts..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are fully caught up! There are no unread alerts in this category."
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 ${
                !item.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
              }`}
            >
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </span>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400">{item.timeAgo}</span>
                </div>

                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.message}
                </p>

                {item.link && (
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400 pt-1"
                  >
                    <span>View Record</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

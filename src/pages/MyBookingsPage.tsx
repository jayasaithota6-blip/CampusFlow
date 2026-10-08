import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  Search,
  Filter,
  PlusCircle,
  Eye,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QRBookingCard } from '../components/common/QRBookingCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState, LoadingState } from '../components/common/EmptyState';

type BookingTab = 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled' | 'Rejected' | 'All';
type HODBookingTab = 'Pending' | 'Completed' | 'Rejected' | 'All';

export function MyBookingsPage() {
  const { user, isHOD, isAdmin, role } = useAuth();
  const isHODUser = isHOD || isAdmin || role === 'hod' || user?.role === 'hod';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(isHODUser ? 'Pending' : 'Upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const { success } = useToast();

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, isHODUser]);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    // HOD oversees all campus bookings; regular users see only their personal bookings
    const list = isHODUser ? await bookingService.getAll() : await bookingService.getByUser(user);
    setBookings(list);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!cancellingBooking) return;
    await bookingService.updateStatus(cancellingBooking.id, 'Cancelled');
    success('Reservation Cancelled', `Booking ${cancellingBooking.id} has been cancelled.`);
    setCancellingBooking(null);
    loadBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    // Tab filtering
    if (activeTab === 'Pending') {
      if (b.status !== 'Pending' && b.status !== 'Under Review') return false;
    } else if (activeTab === 'Completed') {
      if (b.status !== 'Confirmed' && b.status !== 'Completed' && !b.status.includes('Approved')) return false;
    } else if (activeTab === 'Rejected') {
      if (b.status !== 'Rejected') return false;
    } else if (activeTab === 'Upcoming') {
      if (b.status !== 'Confirmed') return false;
    } else if (activeTab === 'Cancelled') {
      if (b.status !== 'Cancelled') return false;
    }

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.eventName.toLowerCase().includes(q) ||
        b.facilityName.toLowerCase().includes(q) ||
        b.organizerName.toLowerCase().includes(q) ||
        b.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const hodTabs: HODBookingTab[] = ['Pending', 'Completed', 'Rejected', 'All'];
  const userTabs: BookingTab[] = ['Upcoming', 'Pending', 'Completed', 'Cancelled', 'Rejected', 'All'];
  const displayedTabs = isHODUser ? hodTabs : userTabs;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {isHODUser ? 'All Campus Reservations & Approval Oversight' : 'Booking Records & Management'}
            </h2>
            {isHODUser && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                HOD Central Registry
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {isHODUser
              ? 'Review pending student and faculty requests, inspect authorized digital passes, and oversee real-time facility usage.'
              : 'Track reservation approvals, generate digital QR passes, or cancel bookings.'}
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {displayedTabs.map((tab) => {
            const count = bookings.filter((b) => {
              if (tab === 'Pending') return b.status === 'Pending' || b.status === 'Under Review';
              if (tab === 'Completed') return b.status === 'Confirmed' || b.status === 'Completed' || b.status.includes('Approved');
              if (tab === 'Rejected') return b.status === 'Rejected';
              if (tab === 'Upcoming') return b.status === 'Confirmed';
              if (tab === 'Cancelled') return b.status === 'Cancelled';
              return true;
            }).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === tab
                      ? 'bg-neutral-700 text-white dark:bg-neutral-200 dark:text-neutral-900'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, event, venue, user..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Bookings List / Cards */}
      {loading ? (
        <LoadingState message="Loading reservation records..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} Reservations`}
          description={
            isHODUser
              ? `There are currently no real-time reservation requests under the ${activeTab} filter.`
              : 'You have no reservations matching this category. Book a facility to get started.'
          }
          actionLabel="Book a Facility"
          onAction={() => (window.location.href = '/book')}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
            >
              {/* Left Column: Event details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    {b.id}
                  </span>
                  <StatusBadge status={b.status} size="sm" />
                  <span className="text-xs font-semibold text-neutral-500">
                    · {b.eventType}
                  </span>
                  {isHODUser && (
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {b.organizerName} ({b.department})
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {b.eventName}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                    📍 {b.facilityName} ({b.building})
                  </span>
                  <span>·</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    🗓️ {b.date} ({b.startTime} – {b.endTime})
                  </span>
                  <span>·</span>
                  <span>👥 {b.participants} Attendees</span>
                </div>

                {b.description && (
                  <p className="text-xs text-neutral-500 line-clamp-1 pt-0.5">
                    {b.description}
                  </p>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                {(b.status === 'Confirmed' || b.status.includes('Approved')) && (
                  <button
                    onClick={() => setSelectedQRBooking(b)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>View Pass</span>
                  </button>
                )}

                <Link
                  to={`/bookings/${b.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Dossier</span>
                </Link>

                {b.status !== 'Cancelled' && b.status !== 'Completed' && !isHODUser && (
                  <button
                    onClick={() => setCancellingBooking(b)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedQRBooking && (
        <Modal
          isOpen={!!selectedQRBooking}
          onClose={() => setSelectedQRBooking(null)}
          title="Digital Campus Gate Pass"
          subtitle={`Pass ID: ${selectedQRBooking.id}`}
          maxWidth="md"
        >
          <QRBookingCard
            booking={selectedQRBooking}
            onClose={() => setSelectedQRBooking(null)}
            onStatusUpdated={() => loadBookings()}
          />
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingBooking && (
        <ConfirmDialog
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleCancel}
          title="Cancel Reservation Request"
          message={`Are you sure you want to cancel reservation ${cancellingBooking.id} (${cancellingBooking.eventName})? The time slot and reserved equipment will be released immediately.`}
          confirmLabel="Yes, Cancel Booking"
          variant="danger"
        />
      )}
    </div>
  );
}

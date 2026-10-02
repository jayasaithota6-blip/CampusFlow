import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  QrCode,
  Eye,
  XCircle,
  Edit3,
  Filter,
  Search,
  PlusCircle,
  Package,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking, BookingStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QRBookingCard } from '../components/common/QRBookingCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Pending' | 'Completed' | 'Cancelled' | 'Rejected' | 'All'>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const { success } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const list = await bookingService.getAll();
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
    if (activeTab === 'Upcoming') {
      if (b.status !== 'Confirmed') return false;
    } else if (activeTab === 'Pending') {
      if (b.status !== 'Pending' && b.status !== 'Under Review' && !b.status.includes('Approved')) return false;
    } else if (activeTab === 'Completed') {
      if (b.status !== 'Completed') return false;
    } else if (activeTab === 'Cancelled') {
      if (b.status !== 'Cancelled') return false;
    } else if (activeTab === 'Rejected') {
      if (b.status !== 'Rejected') return false;
    }

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.eventName.toLowerCase().includes(q) ||
        b.facilityName.toLowerCase().includes(q) ||
        b.organizerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Booking Records & Management
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Track reservation approvals, generate digital QR passes, or cancel bookings.
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
          {(['Upcoming', 'Pending', 'Completed', 'Cancelled', 'Rejected', 'All'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, event, venue..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Bookings Table / List */}
      {loading ? (
        <LoadingState message="Loading reservation records..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.toLowerCase()} bookings found`}
          description="You do not have any bookings matching this category. Book your first campus facility now."
          actionLabel="Book a Facility"
          onAction={() => navigate('/book')}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">Booking ID</th>
                  <th className="px-5 py-3 font-semibold">Facility & Venue</th>
                  <th className="px-5 py-3 font-semibold">Event Title</th>
                  <th className="px-5 py-3 font-semibold">Date & Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Resources</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {b.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {b.facilityName}
                      </p>
                      <p className="text-[11px] text-neutral-500">{b.building}</p>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {b.eventName}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {b.participants} attendees · {b.department}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-mono text-neutral-900 dark:text-neutral-100">{b.date}</p>
                      <p className="text-[11px] text-neutral-500">
                        {b.startTime} – {b.endTime}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={b.status} size="sm" />
                    </td>

                    <td className="px-5 py-4">
                      {b.resources.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          <Package className="h-3 w-3 text-neutral-500" />
                          <span>{b.resources.length} items</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">None</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                          title="View Dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {b.status === 'Confirmed' ? (
                          <button
                            onClick={() => setSelectedQRBooking(b)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                            title="Show Verified Entry Pass QR"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span className="font-semibold text-[11px]">QR Pass</span>
                          </button>
                        ) : b.status === 'Pending' || b.status === 'Under Review' ? (
                          <button
                            onClick={() => setSelectedQRBooking(b)}
                            className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 transition-colors"
                            title="QR Locked: Pending HOD Approval"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span className="text-[11px]">QR (Pending)</span>
                          </button>
                        ) : null}

                        {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                          <button
                            onClick={() => setCancellingBooking(b)}
                            className="rounded p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            title="Cancel Booking"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedQRBooking && (
        <Modal
          isOpen={!!selectedQRBooking}
          onClose={() => setSelectedQRBooking(null)}
          title="Digital Entry Pass"
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
          title="Cancel Reservation"
          message={`Are you sure you want to cancel reservation ${cancellingBooking.id}? Once cancelled, the facility slot and equipment will become immediately available to others.`}
          confirmLabel="Cancel Booking"
          variant="danger"
        />
      )}
    </div>
  );
}

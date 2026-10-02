import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  PlusCircle,
  QrCode,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { bookingService } from '../services/bookingService';
import { approvalService } from '../services/approvalService';
import { facilityService } from '../services/facilityService';
import { notificationService } from '../services/notificationService';
import { Booking, Facility, NotificationItem } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QRBookingCard } from '../components/common/QRBookingCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function DashboardPage() {
  const { user, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [bList, fList, nList] = await Promise.all([
      bookingService.getAll(),
      facilityService.getAll(),
      notificationService.getAll(),
    ]);
    setBookings(bList);
    setFacilities(fList);
    setNotifications(nList.slice(0, 3));
  };

  const handleHODApprove = async (b: Booking) => {
    try {
      await approvalService.approveRequest(
        b.id,
        { name: user?.name || 'Dr. Marcus Vance (HOD)', role: 'hod' },
        'Approved by Head of Department (HOD). Digital QR pass generated.'
      );
      success(
        'HOD Approved · QR Issued',
        `Booking ${b.id} approved! Digital QR Pass generated for ${b.organizerName}.`
      );
      loadData();
    } catch (err: any) {
      error('Approval Failed', err.message || 'Could not approve request.');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    await bookingService.updateStatus(cancellingBooking.id, 'Cancelled');
    success('Booking Cancelled', `${cancellingBooking.id} has been cancelled.`);
    setCancellingBooking(null);
    loadData();
  };

  // Metrics
  const upcomingCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending' || b.status === 'Under Review').length;
  const approvedCount = bookings.filter((b) => b.status === 'Confirmed' || b.status.includes('Approved')).length;
  const availableCount = facilities.filter((f) => f.status === 'Available').length;

  // Active upcoming booking (e.g. today's Seminar Hall A)
  const featuredBooking = bookings.find((b) => b.status === 'Confirmed') || bookings[0];

  return (
    <div className="space-y-8">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Good morning, {user?.name || 'Scholar'}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Welcome to your campus operations portal. Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Recommendation</span>
          </Link>
          <Link
            to="/book"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Book Facility</span>
          </Link>
        </div>
      </div>

      {/* HOD Direct Authorization Console Section */}
      {role === 'hod' && (
        <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50/90 to-emerald-50/50 p-6 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-emerald-950/20 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4 dark:border-indigo-900/60">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Sole HOD Approval Gateway</span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Department Head (HOD) Approval Queue
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                You are logged in as Head of Department (HOD). Approving a request instantly issues the cryptographic QR entry pass to the requester.
              </p>
            </div>

            <Link
              to="/approvals"
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 shadow-xs transition-colors self-start sm:self-auto shrink-0"
            >
              <span>Full Approvals Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pending items for HOD */}
          {bookings.filter((b) => b.status === 'Pending' || b.status === 'Under Review').length === 0 ? (
            <div className="rounded-xl bg-white/80 p-4 text-center text-xs text-neutral-500 dark:bg-neutral-900/80">
              No pending facility requests awaiting your HOD authorization. All department requests are processed.
            </div>
          ) : (
            <div className="space-y-2.5">
              {bookings
                .filter((b) => b.status === 'Pending' || b.status === 'Under Review')
                .slice(0, 3)
                .map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {req.id}
                        </span>
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {req.eventName}
                        </span>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pending HOD Sign-off
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        Requested by <strong className="text-neutral-700 dark:text-neutral-300">{req.organizerName}</strong> · {req.facilityName} on {req.date} ({req.startTime} – {req.endTime})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/bookings/${req.id}`}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleHODApprove(req)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Approve & Issue QR</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Upcoming Bookings</span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {upcomingCount}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">
            Ready for campus entry
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Pending Requests</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {pendingCount}
          </p>
          <span className="mt-1 block text-[11px] text-amber-600 dark:text-amber-400">
            In department review
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Approved Bookings</span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {approvedCount}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Current academic term
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Available Facilities</span>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {availableCount}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Open for reservations
          </span>
        </div>
      </div>

      {/* Featured Upcoming Booking Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Booking Highlight */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Next Upcoming Booking
              </h3>
            </div>
            {featuredBooking && <StatusBadge status={featuredBooking.status} />}
          </div>

          {featuredBooking ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {featuredBooking.facilityName}
                  </h4>
                  <p className="text-xs text-neutral-500">{featuredBooking.building}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {featuredBooking.date}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {featuredBooking.startTime} – {featuredBooking.endTime}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-neutral-50 p-3.5 dark:bg-neutral-800/60">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {featuredBooking.eventName}
                </p>
                <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                  {featuredBooking.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>Booking ID: <strong className="font-mono text-neutral-700 dark:text-neutral-300">{featuredBooking.id}</strong></span>
                  <span>·</span>
                  <span>{featuredBooking.participants} Expected Attendees</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQRBooking(featuredBooking)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>QR Code</span>
                  </button>
                  <button
                    onClick={() => navigate(`/bookings/${featuredBooking.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    <span>View Booking</span>
                  </button>
                  <button
                    onClick={() => setCancellingBooking(featuredBooking)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500">
              No upcoming confirmed bookings.
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/book"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Book Facility</p>
                    <p className="text-[11px] text-neutral-500">Reserve room & equipment</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>

              <Link
                to="/my-bookings"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">My Bookings</p>
                    <p className="text-[11px] text-neutral-500">Track and manage passes</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>

              <Link
                to="/facilities"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Available Facilities</p>
                    <p className="text-[11px] text-neutral-500">Browse campus directory</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>

              <Link
                to="/approvals"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">My Requests</p>
                    <p className="text-[11px] text-neutral-500">Pending status & workflow</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Notifications & Recommended Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications & Recent Activity */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Recent Alerts & Activity
            </h3>
            <Link to="/notifications" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.map((n) => (
              <div key={n.id} className="py-3 flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{n.title}</p>
                  <p className="mt-0.5 text-neutral-500 line-clamp-2">{n.message}</p>
                  <span className="mt-1 block font-mono text-[10px] text-neutral-400">{n.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Facilities Showcase */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Popular Campus Spaces
            </h3>
            <Link to="/facilities" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Browse all
            </Link>
          </div>

          <div className="space-y-3 pt-3">
            {facilities.slice(0, 3).map((fac) => (
              <div
                key={fac.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={fac.imageUrl}
                    alt={fac.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-14 rounded-lg object-cover"
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{fac.name}</p>
                    <p className="text-[11px] text-neutral-500">{fac.building} · {fac.capacity} Seats</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={fac.status} size="sm" />
                  <Link
                    to={`/book?facility=${fac.id}`}
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Pass Modal */}
      {selectedQRBooking && (
        <Modal
          isOpen={!!selectedQRBooking}
          onClose={() => setSelectedQRBooking(null)}
          title="Digital Campus Gate Pass"
          subtitle={`Booking Token: ${selectedQRBooking.id}`}
          maxWidth="md"
        >
          <QRBookingCard
            booking={selectedQRBooking}
            onClose={() => setSelectedQRBooking(null)}
            onStatusUpdated={() => loadData()}
          />
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingBooking && (
        <ConfirmDialog
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleCancelBooking}
          title="Cancel Booking Request"
          message={`Are you sure you want to cancel booking ${cancellingBooking.id} (${cancellingBooking.eventName})? The time slot and reserved equipment will be released immediately.`}
          confirmLabel="Yes, Cancel Booking"
          variant="danger"
        />
      )}
    </div>
  );
}

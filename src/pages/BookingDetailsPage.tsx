import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  Users,
  QrCode,
  Download,
  Printer,
  XCircle,
  Package,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { ApprovalHierarchyCard } from '../components/common/ApprovalHierarchyCard';
import { Modal } from '../components/common/Modal';
import { QRBookingCard } from '../components/common/QRBookingCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { success } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadBooking(id);
    }
  }, [id]);

  const loadBooking = async (bId: string) => {
    setLoading(true);
    const item = await bookingService.getById(bId);
    setBooking(item || null);
    setLoading(false);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    await bookingService.updateStatus(booking.id, 'Cancelled');
    success('Reservation Cancelled', `${booking.id} has been marked as cancelled.`);
    setIsCancelDialogOpen(false);
    loadBooking(booking.id);
  };

  const handleDownloadConfirmation = () => {
    window.print();
  };

  if (loading) {
    return <LoadingState message="Loading booking records..." />;
  }

  if (!booking) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Booking Not Found
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          The requested booking token could not be verified in the records.
        </p>
        <Link to="/my-bookings" className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:underline">
          ← Return to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to bookings</span>
        </button>

        <div className="flex items-center gap-2">
          {booking.status === 'Confirmed' ? (
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Show QR Pass</span>
            </button>
          ) : booking.status === 'Pending' || booking.status === 'Under Review' ? (
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>QR Status (Pending HOD)</span>
            </button>
          ) : null}

          <button
            onClick={handleDownloadConfirmation}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Confirmation</span>
          </button>

          {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
            <button
              onClick={() => setIsCancelDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancel Reservation</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Event & Venue Particulars */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-5">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div>
                <span className="font-mono text-xs font-bold text-neutral-400">
                  {booking.id}
                </span>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {booking.eventName}
                </h2>
                <p className="text-xs text-neutral-500">{booking.eventType} Event</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-500">Reserved Venue</span>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {booking.facilityName}
                </p>
                <p className="text-[11px] text-neutral-500">{booking.building}</p>
              </div>

              <div>
                <span className="text-neutral-500">Reserved Schedule</span>
                <p className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {booking.date}
                </p>
                <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  {booking.startTime} – {booking.endTime}
                </p>
              </div>

              <div>
                <span className="text-neutral-500">Organizer</span>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {booking.organizerName}
                </p>
                <p className="text-[11px] text-neutral-500">{booking.organizerPhone}</p>
              </div>

              <div>
                <span className="text-neutral-500">Department</span>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {booking.department}
                </p>
                <p className="text-[11px] text-neutral-500">{booking.participants} Expected Attendees</p>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 text-xs dark:bg-neutral-800/60">
              <span className="text-neutral-500 block mb-1 font-semibold">Event Description</span>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {booking.description}
              </p>
            </div>

            {/* Bundled Resources */}
            <div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
                Allocated Technical Resources & Furniture
              </span>
              {booking.resources.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No external equipment bundled.</p>
              ) : (
                <div className="space-y-2">
                  {booking.resources.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-2.5 text-xs dark:border-neutral-800"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                        {item.quantity} units
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {booking.rejectionReason && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                <strong className="block mb-1">Reason for Rejection:</strong>
                {booking.rejectionReason}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approval Hierarchy Timeline & Verification Card */}
        <div className="lg:col-span-5 space-y-6">
          <ApprovalHierarchyCard steps={booking.approvalHierarchy} />

          {booking.status === 'Confirmed' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-2xs dark:border-emerald-900 dark:bg-emerald-950/20 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Entry Pass Valid & Verified
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Show your cryptographic digital entry pass at the campus facility checkpoint.
              </p>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <QrCode className="h-4 w-4" />
                <span>Launch QR Card</span>
              </button>
            </div>
          ) : booking.status === 'Pending' || booking.status === 'Under Review' ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-2xs dark:border-amber-900 dark:bg-amber-950/20 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Awaiting HOD Authorization
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                This facility request is under review with the Head of Department. Your digital entry QR pass will be generated as soon as it is approved.
              </p>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-800 shadow-xs hover:bg-amber-50 dark:border-amber-700 dark:bg-neutral-800 dark:text-amber-200 transition-colors"
              >
                <QrCode className="h-4 w-4" />
                <span>Check QR Pass Status</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* QR Code Modal */}
      {isQRModalOpen && (
        <Modal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          title="Digital Entry Pass"
          subtitle={`Pass ID: ${booking.id}`}
          maxWidth="md"
        >
          <QRBookingCard
            booking={booking}
            onClose={() => setIsQRModalOpen(false)}
            onStatusUpdated={(updated) => setBooking(updated)}
          />
        </Modal>
      )}

      {/* Cancel Dialog */}
      {isCancelDialogOpen && (
        <ConfirmDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={handleCancelBooking}
          title="Cancel Reservation"
          message={`Are you sure you want to cancel reservation ${booking.id}? This will immediately release the facility and notify department administrators.`}
          confirmLabel="Yes, Cancel Booking"
          variant="danger"
        />
      )}
    </div>
  );
}

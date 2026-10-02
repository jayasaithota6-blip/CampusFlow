import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  MessageSquare,
  Filter,
  Search,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { approvalService } from '../services/approvalService';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState, LoadingState } from '../components/common/EmptyState';

export function ApprovalWorkflowPage() {
  const { user, role, switchRole } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [approvingBooking, setApprovingBooking] = useState<Booking | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [requestingChangesBooking, setRequestingChangesBooking] = useState<Booking | null>(null);
  const [changeComments, setChangeComments] = useState('');

  useEffect(() => {
    loadRequests();
  }, [role]);

  const loadRequests = async () => {
    setLoading(true);
    const list = await bookingService.getAll();
    setBookings(list);
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!approvingBooking) return;

    await approvalService.approveRequest(
      approvingBooking.id,
      { name: user?.name || 'Dr. Marcus Vance (HOD)', role: 'hod' },
      approvalNotes || 'Approved by Head of Department (HOD).'
    );

    success(
      'HOD Approved · QR Generated',
      `Booking ${approvingBooking.id} approved! Digital QR Pass has been generated for ${approvingBooking.organizerName}.`
    );
    setApprovingBooking(null);
    setApprovalNotes('');
    loadRequests();
  };

  const handleReject = async () => {
    if (!rejectingBooking) return;
    if (!rejectionReason.trim()) {
      error('Reason Required', 'Please specify a reason for denying this reservation.');
      return;
    }

    await approvalService.rejectRequest(
      rejectingBooking.id,
      { name: user?.name || 'Dr. Marcus Vance (HOD)', role: 'hod' },
      rejectionReason
    );

    success('Request Rejected', `Booking ${rejectingBooking.id} has been marked as rejected.`);
    setRejectingBooking(null);
    setRejectionReason('');
    loadRequests();
  };

  const handleRequestChanges = async () => {
    if (!requestingChangesBooking) return;
    if (!changeComments.trim()) {
      error('Comments Required', 'Please detail the amendments needed.');
      return;
    }

    await approvalService.requestChanges(
      requestingChangesBooking.id,
      { name: user?.name || 'Dr. Marcus Vance (HOD)' },
      changeComments
    );

    success('Changes Requested', `Request ${requestingChangesBooking.id} sent back to requester.`);
    setRequestingChangesBooking(null);
    setChangeComments('');
    loadRequests();
  };

  // KPI Metrics
  const pendingRequests = bookings.filter((b) => b.status === 'Pending' || b.status === 'Under Review');
  const approvedToday = bookings.filter((b) => b.status === 'Confirmed' || b.status.includes('Approved')).length;
  const rejectedToday = bookings.filter((b) => b.status === 'Rejected').length;
  const upcomingEvents = bookings.filter((b) => b.status === 'Confirmed').length;

  const filteredRequests = bookings.filter((b) => {
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

  return (
    <div className="space-y-6">
      {/* Top Banner indicating Sole HOD Approval System */}
      <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-emerald-50/50 p-6 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sole HOD Approval Gateway</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Head of Department (HOD) Authorization Console
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-2xl">
              All campus facility requests require single-point authorization by the Head of Department.
              Upon your approval, the system immediately binds the reservation and generates the cryptographic digital QR pass for the requester.
            </p>
          </div>

          {role !== 'hod' && (
            <button
              onClick={() => switchRole('hod')}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 self-start md:self-auto shrink-0 shadow-xs"
            >
              <span>Switch to HOD View</span>
              <ShieldCheck className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Awaiting HOD Approval</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingRequests.length}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Pending your signature
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">HOD Approved (QR Generated)</span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {approvedToday}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">
            Passes dispatched to users
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Rejected Requests</span>
            <div className="rounded-md bg-rose-50 p-2 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {rejectedToday}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            With policy reason
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Confirmed Events</span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {upcomingEvents}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Active on master schedule
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by requester, department, facility, or ID..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingState message="Loading approval requests..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No approval requests"
          description="There are currently no facility reservation requests pending review in your department."
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-4 py-3 font-semibold">Request ID</th>
                  <th className="px-4 py-3 font-semibold">Requester</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Facility</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">HOD Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredRequests.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {b.id}
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {b.organizerName}
                      </p>
                      <p className="text-[11px] text-neutral-500">{b.organizerEmail}</p>
                    </td>

                    <td className="px-4 py-3.5 text-neutral-700 dark:text-neutral-300">
                      {b.department}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-neutral-900 dark:text-neutral-100">
                      {b.facilityName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-mono text-neutral-900 dark:text-neutral-100">{b.date}</p>
                      <p className="text-[11px] text-neutral-500">
                        {b.startTime} – {b.endTime}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs truncate font-medium text-neutral-900 dark:text-neutral-100">
                      {b.eventName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={b.status} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/bookings/${b.id}`}
                          className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {b.status !== 'Confirmed' && b.status !== 'Rejected' ? (
                          <>
                            <button
                              onClick={() => setApprovingBooking(b)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                              <span>Approve & Issue QR</span>
                            </button>
                            <button
                              onClick={() => setRejectingBooking(b)}
                              className="rounded bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : b.status === 'Confirmed' ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>QR Pass Active</span>
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-rose-500">Rejected</span>
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

      {/* APPROVE CONFIRMATION MODAL */}
      {approvingBooking && (
        <Modal
          isOpen={!!approvingBooking}
          onClose={() => setApprovingBooking(null)}
          title="HOD Approval & QR Pass Generation"
          subtitle={`Authorize request ${approvingBooking.id} for ${approvingBooking.facilityName}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>QR Entry Pass Will Be Generated</span>
              </div>
              <p className="text-[11px]">
                Upon signing off, the system will immediately generate a cryptographically verified QR access pass for <strong>{approvingBooking.organizerName}</strong> to display at the security checkpoint.
              </p>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300">
              Confirm approval for <strong>{approvingBooking.eventName}</strong> on {approvingBooking.date} ({approvingBooking.startTime} – {approvingBooking.endTime}) in {approvingBooking.facilityName}.
            </p>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                HOD Endorsement Remarks:
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Approved for technical student workshop. Facility team please prepare AV equipment."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setApprovingBooking(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Sign & Issue QR Code</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectingBooking && (
        <Modal
          isOpen={!!rejectingBooking}
          onClose={() => setRejectingBooking(null)}
          title="Reject Booking Request"
          subtitle={`Denying reservation ${rejectingBooking.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-neutral-600 dark:text-neutral-300">
              Please enter the official justification for rejecting this booking. The requester will be notified immediately and no QR pass will be issued.
            </p>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Schedule conflicts with mandatory departmental faculty meeting."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-rose-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setRejectingBooking(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


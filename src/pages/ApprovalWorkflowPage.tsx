import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  Filter,
  Search,
  QrCode,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { approvalService } from '../services/approvalService';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QRBookingCard } from '../components/common/QRBookingCard';
import { EmptyState, LoadingState } from '../components/common/EmptyState';

type HODFilterTab = 'Pending' | 'Completed' | 'Rejected' | 'All';

export function ApprovalWorkflowPage() {
  const { user, role, isHOD, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const isHODUser = isHOD || isAdmin || role === 'hod' || user?.role === 'hod';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<HODFilterTab>('Pending');

  // Modals state
  const [approvingBooking, setApprovingBooking] = useState<Booking | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [inspectingQRBooking, setInspectingQRBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isHODUser) {
      loadRequests();
    }
  }, [role, isHODUser]);

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
      { name: user?.name || 'Campus Head of Department (HOD)', role: 'hod' },
      approvalNotes || 'Approved by Campus Head of Department (HOD).'
    );

    success(
      'HOD Approved · QR Generated',
      `Booking ${approvingBooking.id} approved! Digital QR Pass generated and notification dispatched to ${approvingBooking.organizerName}.`
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
      { name: user?.name || 'Campus Head of Department (HOD)', role: 'hod' },
      rejectionReason
    );

    success('Request Rejected', `Booking ${rejectingBooking.id} has been marked as rejected and notification dispatched.`);
    setRejectingBooking(null);
    setRejectionReason('');
    loadRequests();
  };

  if (!isHODUser) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          HOD Administrative Authorization Required
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          The Approvals Console is restricted exclusively to the Campus Head of Department (HOD). All reservation requests must be approved or declined by the HOD account.
        </p>
        <div className="pt-2">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800"
          >
            <span>View My Booking Status</span>
          </Link>
        </div>
      </div>
    );
  }

  // KPI Metrics (Strictly: Pending, Completed, Rejected, All)
  const pendingRequests = bookings.filter((b) => b.status === 'Pending' || b.status === 'Under Review');
  const completedRequests = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Completed' || b.status.includes('Approved'));
  const rejectedRequests = bookings.filter((b) => b.status === 'Rejected');
  const allRequestsCount = bookings.length;

  const filteredRequests = bookings.filter((b) => {
    // Tab filter
    if (activeTab === 'Pending') {
      if (b.status !== 'Pending' && b.status !== 'Under Review') return false;
    } else if (activeTab === 'Completed') {
      if (b.status !== 'Confirmed' && b.status !== 'Completed' && !b.status.includes('Approved')) return false;
    } else if (activeTab === 'Rejected') {
      if (b.status !== 'Rejected') return false;
    }

    // Search query
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
      {/* Top Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-emerald-50/50 p-6 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HOD Sole Authorization Gateway</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Approvals Console
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-2xl">
              All campus facility requests require single-point authorization by the Head of Department (HOD).
              Approving a request binds the reservation and generates the cryptographic digital QR pass with an instant notification to the user.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards (Pending, Completed, Rejected, All) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('Pending')}
          className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
            activeTab === 'Pending'
              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 dark:bg-amber-950/30'
              : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Pending Review</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingRequests.length}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Awaiting HOD decision
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Completed')}
          className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
            activeTab === 'Completed'
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30'
              : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Completed / Approved</span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {completedRequests.length}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">
            Passes generated & active
          </span>
        </div>

        <div
          onClick={() => setActiveTab('Rejected')}
          className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
            activeTab === 'Rejected'
              ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20 dark:bg-rose-950/30'
              : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Rejected Requests</span>
            <div className="rounded-md bg-rose-50 p-2 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {rejectedRequests.length}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Declined requests
          </span>
        </div>

        <div
          onClick={() => setActiveTab('All')}
          className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
            activeTab === 'All'
              ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:bg-indigo-950/30'
              : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">All Requests</span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {allRequestsCount}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Total records in database
          </span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        {/* Tabs: strictly Pending, Completed, Rejected, All */}
        <div className="flex flex-wrap items-center gap-1">
          {(['Pending', 'Completed', 'Rejected', 'All'] as const).map((tab) => {
            const count = bookings.filter((b) => {
              if (tab === 'Pending') return b.status === 'Pending' || b.status === 'Under Review';
              if (tab === 'Completed') return b.status === 'Confirmed' || b.status === 'Completed' || b.status.includes('Approved');
              if (tab === 'Rejected') return b.status === 'Rejected';
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

        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requester, department, facility, or ID..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingState message="Loading approval requests..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} Requests`}
          description={`There are currently no real-time user reservation requests under the ${activeTab} category.`}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">Request ID & Event</th>
                  <th className="px-5 py-3 font-semibold">Requester</th>
                  <th className="px-5 py-3 font-semibold">Facility & Schedule</th>
                  <th className="px-5 py-3 font-semibold">Attendees</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">HOD Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredRequests.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                          {b.id}
                        </span>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                          {b.eventName}
                        </p>
                        <span className="text-[11px] text-neutral-500">{b.eventType}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {b.organizerName}
                        </p>
                        <p className="text-[11px] text-neutral-500">{b.department}</p>
                        <p className="text-[11px] text-neutral-400 font-mono">{b.organizerEmail}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {b.facilityName}
                        </p>
                        <p className="text-[11px] text-neutral-500">{b.building}</p>
                        <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {b.date} ({b.startTime} – {b.endTime})
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-neutral-600 dark:text-neutral-400">
                      {b.participants} seats
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={b.status} />
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'Pending' || b.status === 'Under Review' ? (
                          <>
                            <button
                              onClick={() => setApprovingBooking(b)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                            >
                              ✓ Approve & QR
                            </button>
                            <button
                              onClick={() => setRejectingBooking(b)}
                              className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                            >
                              ✕ Decline
                            </button>
                          </>
                        ) : (b.status === 'Confirmed' || b.status.includes('Approved')) ? (
                          <button
                            onClick={() => setInspectingQRBooking(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>QR Pass</span>
                          </button>
                        ) : null}

                        <Link
                          to={`/bookings/${b.id}`}
                          className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                        >
                          Dossier
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approvingBooking && (
        <Modal
          isOpen={!!approvingBooking}
          onClose={() => setApprovingBooking(null)}
          title="Head of Department (HOD) Approval"
          subtitle={`Authorize Booking ${approvingBooking.id} for ${approvingBooking.facilityName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900">
              <p className="font-semibold">Authorizing this request will:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                <li>Lock the time slot and reserve facility equipment</li>
                <li>Generate cryptographic digital QR entry pass</li>
                <li>Dispatch approval notification directly to {approvingBooking.organizerName}</li>
              </ul>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                HOD Endorsement Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Approved by Campus Head of Department (HOD)."
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
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                Confirm Approval & Issue QR
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {rejectingBooking && (
        <Modal
          isOpen={!!rejectingBooking}
          onClose={() => setRejectingBooking(null)}
          title="Decline Facility Request"
          subtitle={`Request ID: ${rejectingBooking.id} by ${rejectingBooking.organizerName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Reason for Rejection (Required)
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify rejection reason (e.g. Schedule capacity exceeded or priority campus event scheduled)"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-rose-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                This rationale will be delivered immediately to the requester&apos;s Notification Center.
              </p>
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
                Confirm Rejection & Dispatch
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR PASS INSPECTION MODAL */}
      {inspectingQRBooking && (
        <Modal
          isOpen={!!inspectingQRBooking}
          onClose={() => setInspectingQRBooking(null)}
          title="Digital Entry Pass"
          subtitle={`Pass ID: ${inspectingQRBooking.id}`}
          maxWidth="md"
        >
          <QRBookingCard
            booking={inspectingQRBooking}
            onClose={() => setInspectingQRBooking(null)}
          />
        </Modal>
      )}
    </div>
  );
}

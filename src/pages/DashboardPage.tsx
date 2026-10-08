import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Building,
  PlusCircle,
  Sparkles,
  QrCode,
  XCircle,
  ChevronRight,
  FileText,
  Building2,
  Users2,
  CheckSquare,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Network,
  Package,
  Wrench,
  ShieldAlert,
  BarChart3,
  MapPin,
  Plus,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { facilityService } from '../services/facilityService';
import { notificationService } from '../services/notificationService';
import { approvalService } from '../services/approvalService';
import { userService } from '../services/userService';
import { departmentService } from '../services/departmentService';
import { resourceService } from '../services/resourceService';
import { maintenanceService } from '../services/maintenanceService';
import { Booking, Facility, NotificationItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCampusData } from '../contexts/CampusDataContext';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { QRBookingCard } from '../components/common/QRBookingCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';

type HODDashboardTab = 'Pending' | 'Completed' | 'Rejected' | 'All';

export function DashboardPage() {
  const { user, role, isHOD, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const {
    users: storeUsers,
    departments: storeDepartments,
    equipment: storeEquipment,
    workOrders: storeWorkOrders,
    bookings: storeBookings,
    facilities: storeFacilities,
    hodCount,
    hodMax,
    isHodLimitReached,
    updateBookingStatus,
  } = useCampusData();

  const isHODUser = isHOD || isAdmin || role === 'hod' || user?.role === 'hod';

  // Live counts from unified CampusDataContext
  const liveUsersCount = storeUsers.length;
  const liveHODCount = hodCount;
  const liveDepartmentsCount = storeDepartments.length;
  const liveFreeUnits = storeEquipment.reduce((acc, e) => acc + (e.availableQuantity || 0), 0);
  const liveActiveOrders = storeWorkOrders.filter((w) => w.status !== 'Resolved').length;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  // HOD Dashboard table tab & search
  const [hodTab, setHodTab] = useState<HODDashboardTab>('Pending');
  const [hodSearchQuery, setHodSearchQuery] = useState('');

  // HOD Decision Modals
  const [approvingBooking, setApprovingBooking] = useState<Booking | null>(null);
  const [decliningBooking, setDecliningBooking] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Campus Administration Suite visibility & counts
  const [showAdminModules, setShowAdminModules] = useState<boolean>(() => {
    return localStorage.getItem('campusflow_hod_show_admin_modules') !== 'false';
  });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    hodCount: 0,
    departmentsCount: 0,
    resourcesCount: 0,
    availableResourcesCount: 0,
    openTicketsCount: 0,
  });

  const toggleShowAdminModules = () => {
    const next = !showAdminModules;
    setShowAdminModules(next);
    try {
      localStorage.setItem('campusflow_hod_show_admin_modules', String(next));
    } catch {
      // ignore
    }
    if (next) {
      success('Campus Admin Suite Enabled', 'Campus administration buttons are now displayed on your landing page.');
    } else {
      success('Buttons Removed from Landing Page', 'Campus administration buttons removed from landing page view. Access them anytime via the sidebar.');
    }
  };

  useEffect(() => {
    loadData();
  }, [user, role]);

  const loadData = async () => {
    if (!user) return;
    if (isHODUser) {
      // HOD monitors all real-time user bookings, requests, and notifications across campus
      const [allB, fList, nList, uList, dList, rList, mList] = await Promise.all([
        bookingService.getAll(),
        facilityService.getAll(),
        notificationService.getAll(),
        userService.getAll(),
        departmentService.getAll(),
        resourceService.getAll(),
        maintenanceService.getAll(),
      ]);
      setBookings(allB);
      setFacilities(fList);
      setNotifications(nList.slice(0, 5));
      setAdminStats({
        totalUsers: uList.length,
        hodCount: uList.filter((u) => u.role === 'hod').length,
        departmentsCount: dList.length,
        resourcesCount: rList.length,
        availableResourcesCount: rList.filter((r) => r.status === 'Available').length,
        openTicketsCount: mList.filter((m) => m.status !== 'Resolved').length,
      });
    } else {
      // Regular users view only their individual reservations
      const [userB, fList, userN] = await Promise.all([
        bookingService.getByUser(user),
        facilityService.getAll(),
        notificationService.getByUser(user.id),
      ]);
      setBookings(userB);
      setFacilities(fList);
      setNotifications(userN.slice(0, 3));
    }
  };

  const handleHODApprove = async () => {
    if (!approvingBooking) return;
    try {
      await approvalService.approveRequest(
        approvingBooking.id,
        { name: user?.name || 'Campus Head of Department (HOD)', role: 'hod' },
        'Approved by Campus HOD. Digital QR gate pass generated.'
      );
      success(
        'HOD Approved · QR Issued',
        `Booking ${approvingBooking.id} approved! Digital QR Pass generated and notification sent to ${approvingBooking.organizerName}.`
      );
      setApprovingBooking(null);
      loadData();
    } catch (err: any) {
      error('Approval Failed', err.message || 'Could not approve request.');
    }
  };

  const handleHODDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decliningBooking) return;
    try {
      await approvalService.rejectRequest(
        decliningBooking.id,
        { name: user?.name || 'Campus Head of Department (HOD)', role: 'hod' },
        declineReason || 'Venue allocation criteria not satisfied.'
      );
      success(
        'Request Declined',
        `Booking ${decliningBooking.id} has been declined and notification dispatched to ${decliningBooking.organizerName}.`
      );
      setDecliningBooking(null);
      setDeclineReason('');
      loadData();
    } catch (err: any) {
      error('Decline Failed', err.message || 'Could not decline booking.');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    await bookingService.updateStatus(cancellingBooking.id, 'Cancelled');
    success('Booking Cancelled', `${cancellingBooking.id} has been cancelled.`);
    setCancellingBooking(null);
    loadData();
  };

  // Metrics for HOD (Strictly Pending, Completed, Rejected, All)
  const pendingRequestsList = bookings.filter((b) => b.status === 'Pending' || b.status === 'Under Review');
  const completedRequestsList = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Completed' || b.status.includes('Approved')
  );
  const rejectedRequestsList = bookings.filter((b) => b.status === 'Rejected');
  const allRequestsCount = bookings.length;

  // Regular user metrics
  const upcomingCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const pendingCount = pendingRequestsList.length;
  const approvedCount = completedRequestsList.length;
  const availableCount = facilities.filter((f) => f.status === 'Available').length;

  // Active upcoming booking strictly for regular users
  const activeUpcomingBookings = bookings.filter(
    (b) => b.status !== 'Cancelled' && b.status !== 'Rejected' && b.status !== 'Completed'
  );
  const featuredBooking =
    activeUpcomingBookings.find((b) => b.status === 'Confirmed') ||
    activeUpcomingBookings[0] ||
    null;

  // Filtered requests in HOD dashboard table
  const hodFilteredBookings = bookings.filter((b) => {
    if (hodTab === 'Pending') {
      if (b.status !== 'Pending' && b.status !== 'Under Review') return false;
    } else if (hodTab === 'Completed') {
      if (b.status !== 'Confirmed' && b.status !== 'Completed' && !b.status.includes('Approved')) return false;
    } else if (hodTab === 'Rejected') {
      if (b.status !== 'Rejected') return false;
    }

    if (hodSearchQuery) {
      const q = hodSearchQuery.toLowerCase();
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
    <div className="space-y-8">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {isHODUser ? 'Campus HOD Operations Command' : `Good morning, ${user?.name || 'Scholar'}`}
            </h2>
            {isHODUser && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                HOD Authority Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {isHODUser
              ? `Real-time university request monitoring, HOD single-point authorizations, and campus administration. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`
              : `Welcome to your campus operations portal. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHODUser ? (
            <>
              <Link
                to="/approvals"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200 transition-colors"
              >
                <CheckSquare className="h-4 w-4 text-amber-600" />
                <span>Approvals Console ({pendingRequestsList.length})</span>
              </Link>
              <Link
                to="/facilities"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                <span>Manage Facilities</span>
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Cards: Strictly Pending, Completed, Rejected, All in HOD mode */}
      {isHODUser ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setHodTab('Pending')}
            className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
              hodTab === 'Pending'
                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 dark:bg-amber-950/30'
                : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Pending Requests</span>
              <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingRequestsList.length}
            </p>
            <span className="mt-1 block text-[11px] text-neutral-500">
              Awaiting HOD action
            </span>
          </div>

          <div
            onClick={() => setHodTab('Completed')}
            className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
              hodTab === 'Completed'
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
              {completedRequestsList.length}
            </p>
            <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">
              Active passes issued
            </span>
          </div>

          <div
            onClick={() => setHodTab('Rejected')}
            className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
              hodTab === 'Rejected'
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
              {rejectedRequestsList.length}
            </p>
            <span className="mt-1 block text-[11px] text-neutral-500">
              Declined reservations
            </span>
          </div>

          <div
            onClick={() => setHodTab('All')}
            className={`rounded-xl border p-5 cursor-pointer shadow-2xs transition-all ${
              hodTab === 'All'
                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:bg-indigo-950/30'
                : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">All Requests</span>
              <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {allRequestsCount}
            </p>
            <span className="mt-1 block text-[11px] text-neutral-500">
              Total campus records
            </span>
          </div>
        </div>
      ) : (
        /* Regular Student/Faculty KPI Cards */
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
      )}

      {/* HOD MAIN DASHBOARD VIEW (Clean, real-time requests table with Pending, Completed, Rejected, All) */}
      {isHODUser ? (
        <div className="space-y-6">
          {/* HOD Requests Management Container */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Real-Time Campus Reservation Requests
                </h3>
                <p className="text-xs text-neutral-500">
                  Filter requests by category, review requester dossier, and execute immediate single-point authorization.
                </p>
              </div>

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
                      onClick={() => setHodTab(tab)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        hodTab === tab
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          hodTab === tab
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
            </div>

            {/* Search row */}
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={hodSearchQuery}
                onChange={(e) => setHodSearchQuery(e.target.value)}
                placeholder="Search user, event, venue, ID..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Real-time Requests Table */}
            {hodFilteredBookings.length === 0 ? (
              <EmptyState
                title={`No ${hodTab} Requests`}
                description={`There are currently no real-time reservation requests under the ${hodTab} category.`}
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Request ID & Event</th>
                      <th className="px-5 py-3 font-semibold">Requester</th>
                      <th className="px-5 py-3 font-semibold">Facility & Schedule</th>
                      <th className="px-5 py-3 font-semibold">Seats</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {hodFilteredBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                            {b.id}
                          </span>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {b.eventName}
                          </p>
                          <span className="text-[11px] text-neutral-500">{b.eventType}</span>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {b.organizerName}
                          </p>
                          <p className="text-[11px] text-neutral-500">{b.department}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{b.organizerEmail}</p>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {b.facilityName}
                          </p>
                          <p className="text-[11px] text-neutral-500">{b.building}</p>
                          <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                            {b.date} ({b.startTime} – {b.endTime})
                          </p>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-neutral-600 dark:text-neutral-400">
                          {b.participants}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={b.status} size="sm" />
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {(b.status === 'Pending' || b.status === 'Under Review') && (
                              <>
                                <button
                                  onClick={() => setApprovingBooking(b)}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => setDecliningBooking(b)}
                                  className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                                >
                                  ✕ Decline
                                </button>
                              </>
                            )}
                            {(b.status === 'Confirmed' || b.status.includes('Approved')) && (
                              <button
                                onClick={() => setSelectedQRBooking(b)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                              >
                                <QrCode className="h-3 w-3" />
                                <span>QR Pass</span>
                              </button>
                            )}
                            <Link
                              to={`/bookings/${b.id}`}
                              className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
            )}
          </div>

          {/* Campus Administration Suite (User Directory & Add HOD, Academic Departments, Equipment & Resources, Maintenance Orders, Admin Suite, Campus Map, Campus Analytics, QR Gate Verification) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>Campus Administration Functions</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    HOD Operational Command
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Direct working operations for department governance, equipment inventory, work orders, telemetry, and gate verification.
                </p>
              </div>

              {/* Toggle to remove buttons from landing page or restore them */}
              <button
                onClick={toggleShowAdminModules}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
                title={showAdminModules ? 'Remove buttons from this landing page' : 'Restore buttons on this landing page'}
              >
                {showAdminModules ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Remove Buttons from Landing Page</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-600 dark:text-indigo-400">Restore Buttons on Landing Page</span>
                  </>
                )}
              </button>
            </div>

            {!showAdminModules ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 p-5 dark:border-neutral-700 dark:bg-neutral-850">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-neutral-200/80 p-2.5 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                    <EyeOff className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      Campus Administration Buttons Removed from Landing Page
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      User Directory, Academic Departments, Equipment, Maintenance Orders, Admin Suite, Campus Map, and Analytics are hidden here. You can access all of them anytime from the left sidebar or click to restore them.
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleShowAdminModules}
                  className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors shrink-0"
                >
                  Restore Buttons & Functions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. User Directory & Add HOD */}
                <div
                  onClick={() => navigate('/hod/users')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-amber-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400 group-hover:scale-105 transition-transform">
                        <Users2 className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {liveUsersCount} Users · HODs: {liveHODCount} / {hodMax}
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 transition-colors">
                      User Directory & Add HOD
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Manage campus accounts, assign roles, activate/deactivate, and register new HODs.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/users"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Directory
                    </Link>
                    {isHodLimitReached ? (
                      <span
                        title="Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one."
                        className="rounded-lg border border-neutral-300 bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"
                      >
                        + Add HOD (3/3)
                      </span>
                    ) : (
                      <Link
                        to="/hod/users/add"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300 transition-colors"
                      >
                        + Add HOD
                      </Link>
                    )}
                  </div>
                </div>

                {/* 2. Academic Departments */}
                <div
                  onClick={() => navigate('/hod/departments')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                        <Network className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {liveDepartmentsCount} Departments
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 transition-colors">
                      Academic Departments
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Oversee department codes, coordinators, appointed HODs, and governance details.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/departments"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Departments
                    </Link>
                    <Link
                      to="/hod/departments/add"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
                    >
                      + Add Dept
                    </Link>
                  </div>
                </div>

                {/* 3. Equipment & Resources */}
                <div
                  onClick={() => navigate('/hod/equipment')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-emerald-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {liveFreeUnits} Free Units
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 transition-colors">
                      Equipment & Resources
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Track and allocate AV gear, lab equipment, microphones, projectors, and supplies.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/equipment"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Inventory
                    </Link>
                    <Link
                      to="/hod/equipment/add"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                    >
                      + Add Item
                    </Link>
                  </div>
                </div>

                {/* 4. Maintenance Orders */}
                <div
                  onClick={() => navigate('/hod/maintenance')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-rose-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400 group-hover:scale-105 transition-transform">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {liveActiveOrders} Active Orders
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 transition-colors">
                      Maintenance Orders
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Review facility repairs, prioritize service requests, and track contractor progress.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/maintenance"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Work Orders
                    </Link>
                    <Link
                      to="/hod/maintenance/new"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
                    >
                      + New Order
                    </Link>
                  </div>
                </div>

                {/* 5. QR Gate Verification */}
                <div
                  onClick={() => navigate('/hod/gate-scanner')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-teal-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950 dark:text-teal-400 group-hover:scale-105 transition-transform">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        Security Scanner
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-teal-600 transition-colors">
                      Gate Verification
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Scan digital QR passes, authenticate authorized entrants, and inspect security access logs.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/gate-scanner"
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Launch Gate Scanner
                    </Link>
                  </div>
                </div>

                {/* 6. Campus Analytics */}
                <div
                  onClick={() => navigate('/hod/analytics')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-blue-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400 group-hover:scale-105 transition-transform">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Telemetry Live
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 transition-colors">
                      Campus Analytics
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Inspect venue occupancy rates, peak reservation times, and export PDF/CSV audit summaries.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/analytics"
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      View Analytics
                    </Link>
                  </div>
                </div>

                {/* 7. Admin Suite */}
                <div
                  onClick={() => navigate('/hod/admin-suite')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-purple-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:scale-105 transition-transform">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Master Console
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 transition-colors">
                      Admin Suite
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Campus-wide executive dashboard, resource demand surge curves, and system health.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/admin-suite"
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Open Admin Suite
                    </Link>
                  </div>
                </div>

                {/* 8. Campus Map */}
                <div
                  onClick={() => navigate('/hod/campus-map')}
                  className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-orange-500 dark:border-neutral-800 dark:bg-neutral-900 transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600 dark:bg-orange-950 dark:text-orange-400 group-hover:scale-105 transition-transform">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                        Interactive Map
                      </span>
                    </div>
                    <h4 className="mt-3.5 font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 transition-colors">
                      Campus Map
                    </h4>
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      Interactive visual campus ground map with live room availability and venue details.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Link
                      to="/hod/campus-map"
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Explore Campus Map
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* REGULAR STUDENT / FACULTY DASHBOARD VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upcoming Booking Highlight */}
          <div className="lg:col-span-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    featuredBooking ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Next Upcoming Booking
                </h3>
              </div>
              {featuredBooking ? (
                <StatusBadge status={featuredBooking.status} />
              ) : (
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  No Bookings
                </span>
              )}
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
                    {featuredBooking.status === 'Confirmed' && (
                      <button
                        onClick={() => setSelectedQRBooking(featuredBooking)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <QrCode className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>QR Code</span>
                      </button>
                    )}
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
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    No Upcoming Bookings
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
                    You have not made any bookings yet. When you schedule a venue, your upcoming booking details and digital pass will appear here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/book"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Book a Facility</span>
                  </Link>
                </div>
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
                  to="/calendar"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">Campus Master Calendar</p>
                      <p className="text-[11px] text-neutral-500">View month schedule</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>

                <Link
                  to="/facilities"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">Explore Facilities</p>
                      <p className="text-[11px] text-neutral-500">Find venues & rooms</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </Link>

                <Link
                  to="/my-bookings"
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
      )}

      {/* Notifications & Recommended Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications & Recent Activity */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {isHODUser ? 'Campus User Requests & Operational Feed' : 'Recent Alerts & Activity'}
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

        {/* Facilities Showcase */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {isHODUser ? 'Campus Venues Directory' : 'Recommended Facilities'}
            </h3>
            <Link to="/facilities" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              {isHODUser ? 'Manage all' : 'Explore catalog'}
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
                    <p className="text-[11px] text-neutral-500">{fac.building} · {fac.capacity} Capacity</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={fac.status} size="sm" />
                  <Link
                    to={isHODUser ? `/facilities` : `/book?facility=${fac.id}`}
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    {isHODUser ? 'Manage' : 'Book'}
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
          subtitle={`Pass ID: ${selectedQRBooking.id}`}
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

      {/* HOD APPROVE CONFIRM MODAL */}
      {approvingBooking && (
        <Modal
          isOpen={!!approvingBooking}
          onClose={() => setApprovingBooking(null)}
          title="Authorize Booking Request"
          subtitle={`Request ID: ${approvingBooking.id} for ${approvingBooking.facilityName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to approve <strong>{approvingBooking.organizerName}</strong>&apos;s request for <strong>{approvingBooking.facilityName}</strong> on <strong>{approvingBooking.date}</strong> ({approvingBooking.startTime} – {approvingBooking.endTime})?
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Digital QR entry pass and verification badge will be generated and notification dispatched immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setApprovingBooking(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleHODApprove}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* HOD DECLINE REASON MODAL */}
      {decliningBooking && (
        <Modal
          isOpen={!!decliningBooking}
          onClose={() => setDecliningBooking(null)}
          title="Decline Booking Request"
          subtitle={`Request ID: ${decliningBooking.id} by ${decliningBooking.organizerName}`}
          maxWidth="sm"
        >
          <form onSubmit={handleHODDeclineSubmit} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Reason for Declining
              </label>
              <textarea
                rows={3}
                required
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Specify reason (e.g. Schedule capacity exceeded or priority campus event scheduled)"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-rose-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                This explanation will be delivered directly to {decliningBooking.organizerName}&apos;s Notification Center.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setDecliningBooking(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
              >
                Confirm Decline & Dispatch Alert
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

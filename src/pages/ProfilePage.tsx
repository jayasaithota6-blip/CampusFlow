import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Building,
  Shield,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  QrCode,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { success, error } = useToast();

  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [collegeId, setCollegeId] = useState(user?.collegeId || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setCollegeId(user.collegeId || '');
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    const list = await bookingService.getByUser(user);
    setUserBookings(list);
    setLoadingBookings(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        department: department.trim(),
        collegeId: collegeId.trim(),
      });
      success('Profile Saved', 'Your user details have been updated in the cloud database.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update user record.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmedCount = userBookings.filter((b) => b.status === 'Confirmed').length;
  const pendingCount = userBookings.filter((b) => b.status === 'Pending' || b.status === 'Under Review').length;
  const completedCount = userBookings.filter((b) => b.status === 'Completed').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          User Profile
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Manage your personal university identity, academic department, and reservation records.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user?.name || 'Authorized Member'}
                </h3>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 capitalize dark:bg-indigo-950 dark:text-indigo-300">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>·</span>
                <span>{user?.department}</span>
                {user?.collegeId && (
                  <>
                    <span>·</span>
                    <span className="font-mono font-medium">{user.collegeId}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <div>
            <span className="text-neutral-400 block mb-1">Email Address</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium truncate">
              <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">Contact Phone</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium">
              <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
              <span>{user?.phone || 'Not configured'}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">College Roll / ID</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium">
              <Award className="h-4 w-4 text-neutral-400 shrink-0" />
              <span className="font-mono">{user?.collegeId || 'General Account'}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">Department</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium">
              <Building className="h-4 w-4 text-neutral-400 shrink-0" />
              <span>{user?.department}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Activity Statistics Cards */}
        <div className="pt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Personal Booking Statistics
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Total Bookings</span>
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {userBookings.length}
              </p>
              <span className="text-[11px] text-neutral-400">Total requests logged</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Active Confirmations</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {confirmedCount}
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Ready with QR passes
              </span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Pending Review</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {pendingCount}
              </p>
              <span className="text-[11px] text-neutral-400">Awaiting processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Past Bookings & Confirmations */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              My Reservation History & Confirmed Passes
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review your previous campus bookings and access your digital gate passes.
            </p>
          </div>
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <span>Manage all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4">
          {loadingBookings ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Loading your reservation records...
            </div>
          ) : userBookings.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-xs text-neutral-500">
                You do not have any past or active bookings yet.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <span>Book a Facility</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {userBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {booking.id}
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {booking.eventName}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1 text-neutral-500">
                      {booking.facilityName} · {booking.date} ({booking.startTime} – {booking.endTime})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => setSelectedQRBooking(booking)}
                        className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <QrCode className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Pass</span>
                      </button>
                    )}
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile Information"
          subtitle="Updates are saved directly to your cloud database record"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                College Roll / ID Number
              </label>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="Enter ID number"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Academic Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Electronics">Electronics & Communication</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Civil">Civil Engineering</option>
                <option value="School of Management (MBA)">School of Management (MBA)</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Campus Operations">Campus Operations</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving to Database...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* QR Code Modal for verified bookings */}
      {selectedQRBooking && (
        <Modal
          isOpen={!!selectedQRBooking}
          onClose={() => setSelectedQRBooking(null)}
          title="Digital Entry Pass"
          subtitle={`Pass ID: ${selectedQRBooking.id}`}
          maxWidth="sm"
        >
          <div className="flex flex-col items-center py-4 text-center">
            <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-800 dark:bg-neutral-800">
              <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-neutral-950 text-white font-mono text-xs">
                <div className="text-center space-y-2 p-2">
                  <QrCode className="h-20 w-20 mx-auto text-white" />
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {selectedQRBooking.id}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {selectedQRBooking.eventName}
            </p>
            <p className="text-[11px] text-neutral-500">
              {selectedQRBooking.facilityName} · {selectedQRBooking.date}
            </p>
            <button
              onClick={() => setSelectedQRBooking(null)}
              className="mt-5 w-full rounded-lg bg-neutral-900 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            >
              Close Pass
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

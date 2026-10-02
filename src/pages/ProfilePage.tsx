import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Building,
  Shield,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/common/Modal';

export function ProfilePage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Saved', 'Your user credentials have been refreshed.');
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          User Profile
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Manage your personal university identity, department associations, and reservation records.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-md">
              {user?.name.slice(0, 2).toUpperCase() || 'CF'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user?.name}
                </h3>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 capitalize dark:bg-indigo-950 dark:text-indigo-300">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>·</span>
                <span>{user?.department}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors self-start sm:self-auto"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <div>
            <span className="text-neutral-400 block mb-1">Email Address</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium">
              <Mail className="h-4 w-4 text-neutral-400" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">Contact Phone</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium">
              <Phone className="h-4 w-4 text-neutral-400" />
              <span>{user?.phone || '+1 (555) 234-5678'}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">Department Faculty</span>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-medium">
              <Building className="h-4 w-4 text-neutral-400" />
              <span>{user?.department}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">Access Status</span>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Shield className="h-4 w-4" />
              <span>Verified Scholar</span>
            </div>
          </div>
        </div>

        {/* Activity Statistics Cards */}
        <div className="pt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Booking & Event Statistics
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Total Bookings</span>
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                14
              </p>
              <span className="text-[11px] text-neutral-400">Since Fall term enrollment</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Completed Events</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                11
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                100% adherence record
              </span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Upcoming Bookings</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                3
              </p>
              <span className="text-[11px] text-neutral-400">Passes active</span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile Information"
          subtitle="Update display name, telephone, or faculty association"
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
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
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
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

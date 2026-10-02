import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Package,
  Calendar,
  Search,
} from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { facilityService } from '../services/facilityService';
import { resourceService } from '../services/resourceService';
import { MaintenanceTicket, Facility, Resource } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function MaintenanceManagementPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New Maintenance Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemType, setItemType] = useState<'Facility' | 'Resource'>('Facility');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('2026-10-02');
  const [completionDate, setCompletionDate] = useState('2026-10-18');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('High');
  const [notes, setNotes] = useState('');

  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tList, fList, rList] = await Promise.all([
      maintenanceService.getAll(),
      facilityService.getAll(),
      resourceService.getAll(),
    ]);
    setTickets(tList);
    setFacilities(fList);
    setResources(rList);
    if (fList.length > 0) setSelectedItemId(fList[0].id);
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      error('Reason Required', 'Please enter a diagnostic reason for the maintenance order.');
      return;
    }

    let itemName = '';
    let location = '';

    if (itemType === 'Facility') {
      const f = facilities.find((item) => item.id === selectedItemId);
      itemName = f?.name || 'Campus Venue';
      location = f?.building || 'Main Campus';
    } else {
      const r = resources.find((item) => item.id === selectedItemId);
      itemName = r?.name || 'Equipment Unit';
      location = r?.location || 'Depot';
    }

    await maintenanceService.createTicket({
      itemType,
      itemId: selectedItemId,
      itemName,
      location,
      reason,
      startDate,
      expectedCompletionDate: completionDate,
      priority,
      notes,
      reportedBy: user?.name || 'Facilities Admin',
    });

    success(
      'Maintenance Logged',
      `${itemName} has been marked Under Maintenance. It is now automatically locked from bookings.`
    );

    setIsModalOpen(false);
    setReason('');
    setNotes('');
    loadData();
  };

  const handleResolve = async (id: string, name: string) => {
    await maintenanceService.resolveTicket(id);
    success('Maintenance Resolved', `${name} has been certified and restored to Available status.`);
    loadData();
  };

  const activeTickets = tickets.filter((t) => t.status !== 'Resolved');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Maintenance Management & Work Orders
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Audit equipment repairs, facility upkeep, and automatically quarantine offline venues.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Mark for Maintenance</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Active Work Orders</span>
            <div className="rounded-md bg-orange-50 p-2 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {activeTickets.length}
          </p>
          <span className="mt-1 block text-[11px] text-orange-600 dark:text-orange-400">
            In progress or scheduled
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Facilities Quarantined</span>
            <div className="rounded-md bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {facilities.filter((f) => f.status === 'Under Maintenance').length}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Temporarily unbookable
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Equipment in Repair</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {resources.reduce((acc, r) => acc + r.maintenanceQuantity, 0)}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">
            Hardware units in depot
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Completed This Month</span>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            18
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">
            Certified & restored
          </span>
        </div>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <LoadingState message="Loading maintenance work orders..." />
      ) : activeTickets.length === 0 ? (
        <EmptyState
          title="All systems operational"
          description="There are currently no open maintenance issues or locked facilities."
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="border-b border-neutral-200 bg-neutral-50/70 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-850">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Active Maintenance Tickets ({activeTickets.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ticket ID</th>
                  <th className="px-5 py-3 font-semibold">Asset / Facility</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Diagnostic Reason</th>
                  <th className="px-5 py-3 font-semibold">Timeline</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {activeTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {t.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {t.itemName}
                      </p>
                      <span className="text-[10px] text-neutral-400 capitalize">{t.itemType}</span>
                    </td>

                    <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                      {t.location}
                    </td>

                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{t.reason}</p>
                      {t.notes && <p className="text-[11px] text-neutral-500">{t.notes}</p>}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-mono text-neutral-900 dark:text-neutral-100">
                        Start: {t.startDate}
                      </p>
                      <p className="font-mono text-[11px] text-orange-600 dark:text-orange-400">
                        Target: {t.expectedCompletionDate}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === 'Critical' || t.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleResolve(t.id, t.itemName)}
                        className="rounded bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors"
                      >
                        Resolve & Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE TICKET MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule Maintenance Order"
          subtitle="Mark a campus facility or equipment unit for technician inspection"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Item Category
                </label>
                <select
                  value={itemType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setItemType(newType);
                    if (newType === 'Facility' && facilities.length > 0) {
                      setSelectedItemId(facilities[0].id);
                    } else if (resources.length > 0) {
                      setSelectedItemId(resources[0].id);
                    }
                  }}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Facility">Campus Facility</option>
                  <option value="Resource">Hardware / Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Select Item
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {itemType === 'Facility'
                    ? facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.building})
                        </option>
                      ))
                    : resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Diagnostic Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Display lamp flicker / Acoustic calibration"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Completion
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Technician Notes / Work Order Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include contractor contact or specialized tool requirements..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
              >
                Issue Maintenance Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { facilityService } from '../services/facilityService';
import { resourceService } from '../services/resourceService';
import { MaintenanceTicket, Facility, Resource } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function MaintenanceManagementPage() {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New Maintenance Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemType, setItemType] = useState<'Facility' | 'Resource'>('Facility');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('2026-10-02');
  const [completionDate, setCompletionDate] = useState('2026-10-18');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('High');
  const [notes, setNotes] = useState('');

  // Edit Ticket Modal
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);
  const [editReason, setEditReason] = useState('');
  const [editPriority, setEditPriority] = useState<MaintenanceTicket['priority']>('High');
  const [editStatus, setEditStatus] = useState<MaintenanceTicket['status']>('In Progress');
  const [editNotes, setEditNotes] = useState('');

  // Delete Ticket Dialog
  const [deletingTicket, setDeletingTicket] = useState<MaintenanceTicket | null>(null);

  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

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

    try {
      await maintenanceService.createTicket({
        itemType,
        itemId: selectedItemId,
        itemName,
        location,
        reason: reason.trim(),
        startDate,
        expectedCompletionDate: completionDate,
        priority,
        notes: notes.trim(),
        reportedBy: user?.name || 'Campus HOD',
      });

      success(
        'Work Order Created',
        `${itemName} has been marked Under Maintenance and locked from conflicting bookings.`
      );

      setIsModalOpen(false);
      setReason('');
      setNotes('');
      loadData();
    } catch (err: any) {
      error('Creation Error', err.message || 'Could not log maintenance order.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await maintenanceService.resolveTicket(id);
      success('Ticket Resolved', 'Asset has been verified and returned to active service.');
      loadData();
    } catch (err: any) {
      error('Action Failed', err.message || 'Could not resolve ticket.');
    }
  };

  const handleOpenEdit = (ticket: MaintenanceTicket) => {
    setEditingTicket(ticket);
    setEditReason(ticket.reason);
    setEditPriority(ticket.priority);
    setEditStatus(ticket.status);
    setEditNotes(ticket.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      await maintenanceService.updateTicket(editingTicket.id, {
        reason: editReason.trim(),
        priority: editPriority,
        status: editStatus,
        notes: editNotes.trim(),
      });
      success('Order Updated', `Work order ${editingTicket.id} updated.`);
      setEditingTicket(null);
      loadData();
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update work order.');
    }
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;
    try {
      await maintenanceService.deleteTicket(deletingTicket.id);
      success('Work Order Deleted', `Ticket ${deletingTicket.id} has been removed.`);
      setDeletingTicket(null);
      loadData();
    } catch (err: any) {
      error('Deletion Failed', err.message || 'Could not delete ticket.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.itemName.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openTicketsCount = tickets.filter((t) => t.status === 'In Progress').length;
  const highPriorityCount = tickets.filter((t) => t.priority === 'High' && t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Facility & Equipment Maintenance Orders
            </h2>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {tickets.length} Total Orders
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Log technical repairs, schedule routine maintenance inspections, and release serviced venues.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Active Work Orders</span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {openTicketsCount}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">Currently in progress</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">High Priority</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">
            {highPriorityCount}
          </p>
          <span className="mt-1 block text-[11px] text-rose-600 dark:text-rose-400">Needs prompt intervention</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Serviced & Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">Restored to catalog</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Campus Venues Tracked</span>
            <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {facilities.length}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">Facilities under monitoring</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['All', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, venue, or fault..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <LoadingState message="Loading maintenance work orders..." />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          title="No maintenance orders found"
          description="There are currently no active tickets matching this filter."
          actionLabel="Create Work Order"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Order ID & Asset</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                  <th className="px-5 py-3.5 font-semibold">Diagnostic Fault</th>
                  <th className="px-5 py-3.5 font-semibold">Timeline</th>
                  <th className="px-5 py-3.5 font-semibold">Priority</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                          {t.id}
                        </span>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                          {t.itemName}
                        </p>
                        <span className="text-[11px] text-neutral-500">{t.location}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                        {t.itemType === 'Facility' ? (
                          <Building className="h-3.5 w-3.5 text-indigo-500" />
                        ) : (
                          <Package className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span>{t.itemType}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                        {t.reason}
                      </p>
                      {t.notes && <p className="text-[11px] text-neutral-400 mt-0.5 italic">{t.notes}</p>}
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px] text-neutral-500">
                      <div>Start: {t.startDate}</div>
                      <div>Target: {t.expectedCompletionDate}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolve(t.id)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                          >
                            <Check className="h-3 w-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingTicket(t)}
                          className="rounded border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                          title="Delete Order"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Maintenance Work Order"
          subtitle="Record hardware breakdown or schedule venue servicing"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Asset Classification
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setItemType('Facility');
                      if (facilities.length > 0) setSelectedItemId(facilities[0].id);
                    }}
                    className={`flex-1 rounded-lg border py-2 text-center font-medium transition-colors ${
                      itemType === 'Facility'
                        ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-neutral-300 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    Campus Venue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemType('Resource');
                      if (resources.length > 0) setSelectedItemId(resources[0].id);
                    }}
                    className={`flex-1 rounded-lg border py-2 text-center font-medium transition-colors ${
                      itemType === 'Resource'
                        ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-neutral-300 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    Equipment Unit
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Asset
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
                          {r.name} - Available: {r.availableQuantity}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Diagnostic Fault / Work Description
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Central ceiling AC unit blowing warm air, scheduled compressor maintenance."
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
                  Expected Completion
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
                  Priority Tier
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="High">High (Immediate)</option>
                  <option value="Medium">Medium (Routine)</option>
                  <option value="Low">Low (Scheduled Inspection)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Technician Notes / Vendor Assignment
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Assigned to Carrier HVAC engineering team"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Issue Work Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT WORK ORDER MODAL */}
      {editingTicket && (
        <Modal
          isOpen={!!editingTicket}
          onClose={() => setEditingTicket(null)}
          title={`Edit Work Order ${editingTicket.id}`}
          subtitle={`Asset: ${editingTicket.itemName}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Fault Description
              </label>
              <textarea
                rows={2}
                required
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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

      {/* DELETE WORK ORDER CONFIRM DIALOG */}
      {deletingTicket && (
        <ConfirmDialog
          isOpen={!!deletingTicket}
          onClose={() => setDeletingTicket(null)}
          onConfirm={handleDeleteTicket}
          title="Delete Work Order"
          message={`Are you sure you want to delete work order ${deletingTicket.id} (${deletingTicket.itemName})?`}
          confirmLabel="Yes, Delete Order"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}

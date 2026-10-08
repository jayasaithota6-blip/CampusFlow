import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
  Calendar,
} from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { MaintenanceTicket } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export function HODMaintenancePage() {
  const { workOrders, updateWorkOrder, deleteWorkOrder, updateWorkOrderStatus } = useCampusData();
  const { success, error } = useToast();

  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Edit / Status Update Modal
  const [editingOrder, setEditingOrder] = useState<MaintenanceTicket | null>(null);
  const [editStatus, setEditStatus] = useState<MaintenanceTicket['status']>('In Progress');
  const [editPriority, setEditPriority] = useState<MaintenanceTicket['priority']>('High');
  const [editContractor, setEditContractor] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Delete Confirm
  const [deletingOrder, setDeletingOrder] = useState<MaintenanceTicket | null>(null);

  // Active Orders count (status is not Resolved)
  const activeOrdersCount = useMemo(() => {
    return workOrders.filter((w) => w.status !== 'Resolved').length;
  }, [workOrders]);

  const filteredOrders = useMemo(() => {
    return workOrders.filter((w) => {
      if (priorityFilter !== 'All' && w.priority !== priorityFilter) return false;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Open' && w.status !== 'Scheduled') return false;
        if (statusFilter === 'In Progress' && w.status !== 'In Progress') return false;
        if (statusFilter === 'Completed' && w.status !== 'Resolved') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          w.id.toLowerCase().includes(q) ||
          w.itemName.toLowerCase().includes(q) ||
          w.location.toLowerCase().includes(q) ||
          w.reason.toLowerCase().includes(q) ||
          (w.assignedTechnician || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [workOrders, priorityFilter, statusFilter, searchQuery]);

  const handleOpenEdit = (w: MaintenanceTicket) => {
    setEditingOrder(w);
    setEditStatus(w.status);
    setEditPriority(w.priority);
    setEditContractor(w.assignedTechnician || '');
    setEditNotes(w.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      await updateWorkOrder(editingOrder.id, {
        status: editStatus,
        priority: editPriority,
        assignedTechnician: editContractor.trim(),
        notes: editNotes.trim(),
      });
      success('Order Updated', `Work order ${editingOrder.id} status updated to ${editStatus}.`);
      setEditingOrder(null);
    } catch (err: any) {
      error('Update Error', err.message);
    }
  };

  const handleQuickStatusChange = async (id: string, status: MaintenanceTicket['status']) => {
    try {
      await updateWorkOrderStatus(id, status);
      success('Status Transitioned', `Ticket ${id} moved to ${status}.`);
    } catch (err: any) {
      error('Status Update Failed', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    try {
      await deleteWorkOrder(deletingOrder.id);
      success('Order Archived', `Work order ${deletingOrder.id} has been archived.`);
      setDeletingOrder(null);
    } catch (err: any) {
      error('Delete Error', err.message);
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'Critical':
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  return (
    <HODRouteGuard pageTitle="Maintenance Work Orders">
      <div className="space-y-6">
        <HODPageHeader
          title="Campus Maintenance & Work Orders"
          badge={`${activeOrdersCount} Active Orders · ${workOrders.length} Total`}
          description="Surveillance and lifecycle tracking for facility repairs, AV equipment maintenance, HVAC servicing, and specialized contractor dispatches."
          breadcrumbs={[{ label: 'Maintenance Orders' }]}
          actions={
            <Link
              to="/hod/maintenance/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Order</span>
            </Link>
          }
        />

        {/* Filter and View Toggle Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, venue, technician..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Urgent / Critical</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Scheduled / Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Resolved / Done</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 dark:border-neutral-800 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'kanban' ? (
          /* KANBAN BOARD */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Scheduled / Open Column */}
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850/40">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    Open / Scheduled
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {filteredOrders.filter((o) => o.status === 'Scheduled').length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders
                  .filter((o) => o.status === 'Scheduled')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-neutral-500">
                          {order.id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityColor(
                            order.priority
                          )}`}
                        >
                          {order.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {order.itemName}
                      </h4>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">{order.reason}</p>

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 space-y-1">
                        <p>📍 {order.location}</p>
                        <p>👷 {order.assignedTechnician || 'Unassigned'}</p>
                        <p>📅 Due: {order.expectedCompletionDate}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleQuickStatusChange(order.id, 'In Progress')}
                          className="rounded bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                        >
                          → Start Work
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-1 text-neutral-400 hover:text-neutral-800"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 2. In Progress Column */}
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850/40">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    In Progress
                  </h3>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  {filteredOrders.filter((o) => o.status === 'In Progress').length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders
                  .filter((o) => o.status === 'In Progress')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-amber-200 bg-white p-4 shadow-2xs hover:border-amber-300 dark:border-amber-900/40 dark:bg-neutral-900 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-neutral-500">
                          {order.id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityColor(
                            order.priority
                          )}`}
                        >
                          {order.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {order.itemName}
                      </h4>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">{order.reason}</p>

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 space-y-1">
                        <p>📍 {order.location}</p>
                        <p>👷 {order.assignedTechnician || 'Facilities Team'}</p>
                        <p>📅 Due: {order.expectedCompletionDate}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleQuickStatusChange(order.id, 'Resolved')}
                          className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          ✓ Mark Resolved
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-1 text-neutral-400 hover:text-neutral-800"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 3. Resolved / Completed Column */}
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-850/40">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    Done / Resolved
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {filteredOrders.filter((o) => o.status === 'Resolved').length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredOrders
                  .filter((o) => o.status === 'Resolved')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs opacity-85 dark:border-neutral-800 dark:bg-neutral-900 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-neutral-400">
                          {order.id}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Resolved
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-through text-neutral-500">
                        {order.itemName}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{order.reason}</p>

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400">
                        <p>📍 {order.location}</p>
                        <p>✅ Serviced by: {order.assignedTechnician || 'Facilities Ops'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleQuickStatusChange(order.id, 'In Progress')}
                          className="text-[10px] text-neutral-500 hover:underline"
                        >
                          Re-open
                        </button>
                        <button
                          onClick={() => setDeletingOrder(order)}
                          className="p-1 text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Order ID & Item</th>
                    <th className="px-5 py-3.5 font-semibold">Diagnostic Reason</th>
                    <th className="px-5 py-3.5 font-semibold">Priority</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold">Contractor & Schedule</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        No maintenance work orders found. Click <strong>+ New Order</strong> to log a repair request.
                      </td>
                    </tr>
                  ) :
                    filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                          {o.id}
                        </p>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {o.itemName}
                        </p>
                        <span className="text-[10px] text-neutral-500">📍 {o.location}</span>
                      </td>

                      <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {o.reason}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityColor(
                            o.priority
                          )}`}
                        >
                          {o.priority}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            o.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : o.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">
                          {o.assignedTechnician || 'Facilities Ops'}
                        </p>
                        <span className="text-[10px] text-neutral-400">
                          Due: {o.expectedCompletionDate}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(o)}
                            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingOrder(o)}
                            className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/60"
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

        {/* Edit Order Modal */}
        {editingOrder && (
          <Modal
            isOpen={!!editingOrder}
            onClose={() => setEditingOrder(null)}
            title="Update Work Order Lifecycle"
            subtitle={`Order ${editingOrder.id} (${editingOrder.itemName})`}
            maxWidth="sm"
          >
            <form onSubmit={handleSaveEdit} className="space-y-3.5 py-2 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Work Order Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Scheduled">Scheduled / Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved / Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Priority Level
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Urgent / Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Assigned Contractor / Technician
                </label>
                <input
                  type="text"
                  value={editContractor}
                  onChange={(e) => setEditContractor(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Technician Progress Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Update Order
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation */}
        {deletingOrder && (
          <ConfirmDialog
            isOpen={!!deletingOrder}
            onClose={() => setDeletingOrder(null)}
            onConfirm={handleDelete}
            title="Archive Work Order"
            message={`Are you sure you want to archive work order ${deletingOrder.id} (${deletingOrder.itemName})?`}
            confirmLabel="Archive Order"
            variant="danger"
          />
        )}
      </div>
    </HODRouteGuard>
  );
}

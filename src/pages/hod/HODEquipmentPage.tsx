import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  RotateCcw,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Filter,
} from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { Resource } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export function HODEquipmentPage() {
  const { equipment, departments, updateEquipment, deleteEquipment, allocateEquipment, returnEquipment } =
    useCampusData();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Allocate Modal
  const [allocatingItem, setAllocatingItem] = useState<Resource | null>(null);
  const [allocateDept, setAllocateDept] = useState(departments[0]?.name || 'Computer Science');
  const [allocateQty, setAllocateQty] = useState<number>(1);

  // Return Modal
  const [returningItem, setReturningItem] = useState<Resource | null>(null);
  const [returnQty, setReturnQty] = useState<number>(1);

  // Edit Modal
  const [editingItem, setEditingItem] = useState<Resource | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Resource['category']>('Audio/Visual');
  const [editTotal, setEditTotal] = useState<number>(1);
  const [editLocation, setEditLocation] = useState('');

  // Delete Confirm
  const [deletingItem, setDeletingItem] = useState<Resource | null>(null);

  // Free Units Calculation
  const totalFreeUnits = useMemo(() => {
    return equipment.reduce((sum, item) => sum + (item.availableQuantity || 0), 0);
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Free' && (item.availableQuantity <= 0 || item.status === 'Unavailable'))
          return false;
        if (statusFilter === 'In Use' && (item.bookedQuantity || 0) <= 0) return false;
        if (statusFilter === 'Under Repair' && (item.maintenanceQuantity || 0) <= 0) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipment, categoryFilter, statusFilter, searchQuery]);

  const handleOpenEdit = (item: Resource) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditTotal(item.totalQuantity);
    setEditLocation(item.location);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await updateEquipment(editingItem.id, {
        name: editName.trim(),
        category: editCategory,
        totalQuantity: Number(editTotal),
        location: editLocation.trim(),
      });
      success('Resource Updated', `${editName} inventory particulars saved.`);
      setEditingItem(null);
    } catch (err: any) {
      error('Update Error', err.message);
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingItem) return;
    if (allocateQty <= 0 || allocateQty > allocatingItem.availableQuantity) {
      error('Quantity Error', 'Invalid quantity allocation.');
      return;
    }
    try {
      await allocateEquipment(allocatingItem.id, allocateDept, allocateQty);
      success(
        'Equipment Allocated',
        `Allocated ${allocateQty} units of ${allocatingItem.name} to ${allocateDept}.`
      );
      setAllocatingItem(null);
    } catch (err: any) {
      error('Allocation Error', err.message);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningItem) return;
    if (returnQty <= 0 || returnQty > returningItem.bookedQuantity) {
      error('Quantity Error', 'Invalid return quantity.');
      return;
    }
    try {
      await returnEquipment(returningItem.id, returnQty);
      success(
        'Equipment Returned',
        `Returned ${returnQty} units of ${returningItem.name} to Central Inventory.`
      );
      setReturningItem(null);
    } catch (err: any) {
      error('Return Error', err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteEquipment(deletingItem.id);
      success('Item Removed', `${deletingItem.name} removed from inventory.`);
      setDeletingItem(null);
    } catch (err: any) {
      error('Delete Error', err.message);
    }
  };

  return (
    <HODRouteGuard pageTitle="Equipment & Resources">
      <div className="space-y-6">
        <HODPageHeader
          title="Equipment & Resources Inventory"
          badge={`${totalFreeUnits} Free Units · ${equipment.length} Items`}
          description="University asset inventory tracking AV equipment, computing gear, lab kits, microphones, and project furniture. Allocate assets to academic events and oversee logistics."
          breadcrumbs={[{ label: 'Equipment & Resources' }]}
          actions={
            <Link
              to="/hod/equipment/add"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Item</span>
            </Link>
          }
        />

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment, location..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="All">All Categories</option>
              <option value="Audio/Visual">Audio/Visual</option>
              <option value="Computing">Computing</option>
              <option value="Furniture">Furniture</option>
              <option value="Electrical">Electrical</option>
              <option value="Accessories">Accessories</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="All">All Stock Statuses</option>
              <option value="Free">Free / Available</option>
              <option value="In Use">In Use (Booked)</option>
              <option value="Under Repair">Under Repair</option>
            </select>
          </div>

          <span className="text-xs text-neutral-500 self-end sm:self-center">
            Showing <strong>{filteredEquipment.length}</strong> equipment units
          </span>
        </div>

        {/* Equipment Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Equipment Item</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Quantity Breakdown</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Depot Location</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No equipment in inventory yet. Click <strong>+ Add Item</strong> to record campus assets.
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {item.name}
                            </p>
                            <span className="font-mono text-[10px] text-neutral-400">{item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {item.availableQuantity} Free
                            </span>
                            <span className="text-neutral-300 dark:text-neutral-600">/</span>
                            <span className="font-mono text-neutral-600 dark:text-neutral-400">
                              {item.totalQuantity} Total
                            </span>
                          </div>
                          {(item.bookedQuantity > 0 || item.maintenanceQuantity > 0) && (
                            <p className="text-[10px] text-neutral-400">
                              {item.bookedQuantity > 0 && `${item.bookedQuantity} in use `}
                              {item.maintenanceQuantity > 0 && `· ${item.maintenanceQuantity} repair`}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.availableQuantity > 2
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : item.availableQuantity > 0
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.availableQuantity > 2
                                ? 'bg-emerald-500'
                                : item.availableQuantity > 0
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {item.availableQuantity > 2
                            ? 'Free & Ready'
                            : item.availableQuantity > 0
                            ? 'Low Stock'
                            : 'Depleted'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-neutral-700 dark:text-neutral-300">
                        {item.location}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Allocate button */}
                          <button
                            disabled={item.availableQuantity <= 0}
                            onClick={() => {
                              setAllocatingItem(item);
                              setAllocateQty(1);
                            }}
                            title="Allocate to Department / Event"
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-30 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>Allocate</span>
                          </button>

                          {/* Return button */}
                          {item.bookedQuantity > 0 && (
                            <button
                              onClick={() => {
                                setReturningItem(item);
                                setReturnQty(1);
                              }}
                              title="Return Allocated Equipment"
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Return</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Item Particulars"
                            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingItem(item)}
                            title="Delete Item"
                            className="rounded p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocate Modal */}
        {allocatingItem && (
          <Modal
            isOpen={!!allocatingItem}
            onClose={() => setAllocatingItem(null)}
            title="Allocate Equipment to Department"
            subtitle={`${allocatingItem.name} (${allocatingItem.availableQuantity} units currently free)`}
            maxWidth="sm"
          >
            <form onSubmit={handleAllocateSubmit} className="space-y-3.5 py-2 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Recipient Academic Department
                </label>
                <select
                  value={allocateDept}
                  onChange={(e) => setAllocateDept(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                  <option value="Campus Facilities & Events">Campus Facilities & Events</option>
                  <option value="Robotics & AI Student Club">Robotics & AI Student Club</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Quantity to Allocate (Max: {allocatingItem.availableQuantity})
                </label>
                <input
                  type="number"
                  min={1}
                  max={allocatingItem.availableQuantity}
                  required
                  value={allocateQty}
                  onChange={(e) => setAllocateQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAllocatingItem(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Return Modal */}
        {returningItem && (
          <Modal
            isOpen={!!returningItem}
            onClose={() => setReturningItem(null)}
            title="Return Allocated Equipment"
            subtitle={`${returningItem.name} (${returningItem.bookedQuantity} units currently out)`}
            maxWidth="sm"
          >
            <form onSubmit={handleReturnSubmit} className="space-y-3.5 py-2 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Quantity Returning to Central Pool (Max: {returningItem.bookedQuantity})
                </label>
                <input
                  type="number"
                  min={1}
                  max={returningItem.bookedQuantity}
                  required
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setReturningItem(null)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Process Return
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <Modal
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            title="Edit Resource Particulars"
            subtitle={`Updating inventory details for ${editingItem.name}`}
            maxWidth="sm"
          >
            <form onSubmit={handleSaveEdit} className="space-y-3.5 py-2 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="Audio/Visual">Audio/Visual</option>
                    <option value="Computing">Computing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editTotal}
                    onChange={(e) => setEditTotal(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Storage Depot Location
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

        {/* Delete Confirmation */}
        {deletingItem && (
          <ConfirmDialog
            isOpen={!!deletingItem}
            onClose={() => setDeletingItem(null)}
            onConfirm={handleDelete}
            title="Delete Equipment Item"
            message={`Are you sure you want to remove ${deletingItem.name} (${deletingItem.totalQuantity} units) from the institutional inventory?`}
            confirmLabel="Delete Item"
            variant="danger"
          />
        )}
      </div>
    </HODRouteGuard>
  );
}

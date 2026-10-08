import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { Resource } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function ResourceManagementPage() {
  const [searchParams] = useSearchParams();
  const { isHOD, isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const [maintenanceResource, setMaintenanceResource] = useState<Resource | null>(null);
  const [maintenanceCount, setMaintenanceCount] = useState<number>(1);

  // Edit Resource Modal
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Resource['category']>('Audio/Visual');
  const [editTotal, setEditTotal] = useState(5);
  const [editAvailable, setEditAvailable] = useState(5);
  const [editLocation, setEditLocation] = useState('');

  // Delete Resource Dialog
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);

  // New Resource Form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Resource['category']>('Audio/Visual');
  const [newTotal, setNewTotal] = useState(5);
  const [newLocation, setNewLocation] = useState('AV Storage Depot');

  const { success, error } = useToast();

  useEffect(() => {
    loadResources();
    if (searchParams.get('action') === 'new') {
      setIsNewResourceModalOpen(true);
    }
  }, [searchParams]);

  const loadResources = async () => {
    setLoading(true);
    const list = await resourceService.getAll();
    setResources(list);
    setLoading(false);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await resourceService.addResource({
        name: newName.trim(),
        category: newCategory,
        totalQuantity: Number(newTotal),
        availableQuantity: Number(newTotal),
        bookedQuantity: 0,
        maintenanceQuantity: 0,
        status: 'Available',
        location: newLocation.trim() || 'Central Storage Depot',
      });

      success('Resource Added', `${newName} has been added to the campus inventory.`);
      setIsNewResourceModalOpen(false);
      setNewName('');
      loadResources();
    } catch (err: any) {
      error('Creation Failed', err.message || 'Could not add resource.');
    }
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setEditName(res.name);
    setEditCategory(res.category);
    setEditTotal(res.totalQuantity);
    setEditAvailable(res.availableQuantity);
    setEditLocation(res.location);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      await resourceService.updateResource(editingResource.id, {
        name: editName.trim(),
        category: editCategory,
        totalQuantity: Number(editTotal),
        availableQuantity: Number(editAvailable),
        location: editLocation.trim(),
      });
      success('Resource Updated', `${editName} inventory records saved.`);
      setEditingResource(null);
      loadResources();
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update resource.');
    }
  };

  const handleDeleteResource = async () => {
    if (!deletingResource) return;
    try {
      await resourceService.deleteResource(deletingResource.id);
      success('Resource Removed', `${deletingResource.name} has been removed from inventory.`);
      setDeletingResource(null);
      loadResources();
    } catch (err: any) {
      error('Deletion Failed', err.message || 'Could not delete resource.');
    }
  };

  const handleSendToMaintenance = async () => {
    if (!maintenanceResource) return;
    try {
      await resourceService.markMaintenance(maintenanceResource.id, maintenanceCount);
      success('Sent to Maintenance', `${maintenanceCount}x ${maintenanceResource.name} marked for service.`);
      setMaintenanceResource(null);
      setMaintenanceCount(1);
      loadResources();
    } catch (err: any) {
      error('Action Failed', err.message || 'Could not update maintenance status.');
    }
  };

  const handleReturnFromMaintenance = async (res: Resource) => {
    try {
      await resourceService.returnFromMaintenance(res.id, res.maintenanceQuantity || 1);
      success('Restored to Inventory', `${res.name} units returned from maintenance to available stock.`);
      loadResources();
    } catch (err: any) {
      error('Action Failed', err.message || 'Could not restore resource.');
    }
  };

  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    }
    return true;
  });

  const totalUnits = resources.reduce((acc, r) => acc + r.totalQuantity, 0);
  const totalAvailable = resources.reduce((acc, r) => acc + r.availableQuantity, 0);
  const totalBooked = resources.reduce((acc, r) => acc + r.bookedQuantity, 0);
  const totalInRepair = resources.reduce((acc, r) => acc + r.maintenanceQuantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Equipment & Resource Inventory
            </h2>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {resources.length} SKUs ({totalUnits} Units)
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Monitor, edit, add, and distribute audio-visual units, presentation hardware, and modular event furniture.
          </p>
        </div>

        <button
          onClick={() => setIsNewResourceModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Catalog Stock</span>
            <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {totalUnits}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">Across {resources.length} unique equipment types</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Ready to Deploy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalAvailable}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">Available in storage depots</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Booked in Reservations</span>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalBooked}
          </p>
          <span className="mt-1 block text-[11px] text-neutral-500">Assigned to active events</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Under Service / Repair</span>
            <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-orange-600 dark:text-orange-400">
            {totalInRepair}
          </p>
          <span className="mt-1 block text-[11px] text-orange-600 dark:text-orange-400">In maintenance workshop</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-1">
          {['All', 'Audio/Visual', 'Computing', 'Furniture', 'Electrical', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment name, depot..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Resources Table */}
      {loading ? (
        <LoadingState message="Checking inventory records..." />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="No campus hardware or furniture matched your search criteria."
          actionLabel="Add Equipment"
          onAction={() => setIsNewResourceModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">Equipment Item</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold text-center">Total</th>
                  <th className="px-5 py-3 font-semibold text-center">Available</th>
                  <th className="px-5 py-3 font-semibold text-center">In Repair</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredResources.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {res.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                      {res.category}
                    </td>

                    <td className="px-5 py-3.5 text-neutral-500 font-mono text-[11px]">
                      {res.location}
                    </td>

                    <td className="px-5 py-3.5 text-center font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {res.totalQuantity}
                    </td>

                    <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {res.availableQuantity}
                    </td>

                    <td className="px-5 py-3.5 text-center font-mono text-orange-600 dark:text-orange-400">
                      {res.maintenanceQuantity}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={res.status} size="sm" />
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedResource(res)}
                          className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenEdit(res)}
                          className="rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          Edit
                        </button>
                        {res.maintenanceQuantity > 0 && (
                          <button
                            onClick={() => handleReturnFromMaintenance(res)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                            title="Return from repair"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Return</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setMaintenanceResource(res);
                            setMaintenanceCount(1);
                          }}
                          disabled={res.availableQuantity === 0}
                          className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-40 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
                          title="Schedule Maintenance"
                        >
                          Repair
                        </button>
                        <button
                          onClick={() => setDeletingResource(res)}
                          className="rounded border border-rose-200 bg-rose-50/50 p-1 text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                          title="Delete Resource"
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

      {/* RESOURCE DETAILS MODAL */}
      {selectedResource && (
        <Modal
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          title={selectedResource.name}
          subtitle={`Depot Location: ${selectedResource.location}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Total Units</span>
                <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedResource.totalQuantity}
                </span>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/50">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">Available</span>
                <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedResource.availableQuantity}
                </span>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-950/50">
                <span className="text-[10px] text-blue-700 dark:text-blue-300 block">Booked</span>
                <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                  {selectedResource.bookedQuantity}
                </span>
              </div>
              <div className="rounded-lg bg-orange-50 p-2.5 dark:bg-orange-950/50">
                <span className="text-[10px] text-orange-700 dark:text-orange-300 block">Repair</span>
                <span className="font-mono text-base font-bold text-orange-600 dark:text-orange-400">
                  {selectedResource.maintenanceQuantity}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-3 space-y-2 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Usage & Allocation History
              </span>
              <p className="text-neutral-500">
                Assigned across campus reservations. Average turnaround time from inspection to redeployment is 24 hours.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT RESOURCE MODAL */}
      {editingResource && (
        <Modal
          isOpen={!!editingResource}
          onClose={() => setEditingResource(null)}
          title={`Edit ${editingResource.name}`}
          subtitle="Adjust resource name, depot location, or inventory quantities"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Equipment Name
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
                  Total Units
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
                Available Units
              </label>
              <input
                type="number"
                min={0}
                max={editTotal}
                required
                value={editAvailable}
                onChange={(e) => setEditAvailable(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingResource(null)}
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

      {/* SCHEDULE MAINTENANCE FOR RESOURCE MODAL */}
      {maintenanceResource && (
        <Modal
          isOpen={!!maintenanceResource}
          onClose={() => setMaintenanceResource(null)}
          title="Send Resource to Maintenance"
          subtitle={`Item: ${maintenanceResource.name}`}
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-neutral-600 dark:text-neutral-300">
              Units moved into maintenance will be deducted from availability and blocked from new reservations.
            </p>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Quantity to withdraw (Max available: {maintenanceResource.availableQuantity})
              </label>
              <input
                type="number"
                min={1}
                max={maintenanceResource.availableQuantity}
                value={maintenanceCount}
                onChange={(e) => setMaintenanceCount(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setMaintenanceResource(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToMaintenance}
                className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
              >
                Send to Maintenance
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE NEW RESOURCE MODAL */}
      {isNewResourceModalOpen && (
        <Modal
          isOpen={isNewResourceModalOpen}
          onClose={() => setIsNewResourceModalOpen(false)}
          title="Add Campus Equipment"
          subtitle="Register new hardware or furniture into the inventory"
          maxWidth="md"
        >
          <form onSubmit={handleCreateResource} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Equipment Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sony Wireless Lavalier Microphone Kit"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
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
                  Total Quantity Units
                </label>
                <input
                  type="number"
                  min={1}
                  value={newTotal}
                  onChange={(e) => setNewTotal(Number(e.target.value))}
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
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsNewResourceModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Register Equipment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE RESOURCE CONFIRM DIALOG */}
      {deletingResource && (
        <ConfirmDialog
          isOpen={!!deletingResource}
          onClose={() => setDeletingResource(null)}
          onConfirm={handleDeleteResource}
          title="Delete Equipment Item"
          message={`Are you sure you want to remove ${deletingResource.name} from campus inventory records? All historical logs will be preserved.`}
          confirmLabel="Yes, Delete Equipment"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}

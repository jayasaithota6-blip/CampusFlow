import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { Resource } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function ResourceManagementPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const [maintenanceResource, setMaintenanceResource] = useState<Resource | null>(null);
  const [maintenanceCount, setMaintenanceCount] = useState<number>(1);

  // New Resource Form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Resource['category']>('Audio/Visual');
  const [newTotal, setNewTotal] = useState(5);
  const [newLocation, setNewLocation] = useState('AV Storage Depot');

  const { success, error } = useToast();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const list = await resourceService.getAll();
    setResources(list);
    setLoading(false);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await resourceService.addResource({
      name: newName,
      category: newCategory,
      totalQuantity: newTotal,
      availableQuantity: newTotal,
      bookedQuantity: 0,
      maintenanceQuantity: 0,
      status: 'Available',
      location: newLocation,
    });

    success('Resource Added', `${newName} has been added to the campus inventory.`);
    setIsNewResourceModalOpen(false);
    setNewName('');
    loadResources();
  };

  const handleSendToMaintenance = async () => {
    if (!maintenanceResource) return;
    await resourceService.markMaintenance(maintenanceResource.id, maintenanceCount);
    success('Sent to Maintenance', `${maintenanceCount}x ${maintenanceResource.name} marked for repair.`);
    setMaintenanceResource(null);
    setMaintenanceCount(1);
    loadResources();
  };

  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Equipment & Resource Inventory
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Monitor and distribute audio-visual units, presentation laptops, and modular event furniture.
          </p>
        </div>

        <button
          onClick={() => setIsNewResourceModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center gap-1">
          {['All', 'Audio/Visual', 'Computing', 'Furniture', 'Electrical'].map((cat) => (
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
            placeholder="Search equipment or depot..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Table View */}
      {loading ? (
        <LoadingState message="Loading resource counts..." />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="No equipment matched your category and search criteria."
          actionLabel="Add Equipment"
          onAction={() => setIsNewResourceModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">Resource Description</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Depot Location</th>
                  <th className="px-5 py-3 font-semibold text-center">Total Stock</th>
                  <th className="px-5 py-3 font-semibold text-center text-emerald-600 dark:text-emerald-400">Available</th>
                  <th className="px-5 py-3 font-semibold text-center text-blue-600 dark:text-blue-400">Booked</th>
                  <th className="px-5 py-3 font-semibold text-center text-orange-600 dark:text-orange-400">Maintenance</th>
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
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {res.name}
                      </p>
                      <span className="font-mono text-[10px] text-neutral-400">{res.id}</span>
                    </td>

                    <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                      {res.category}
                    </td>

                    <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400">
                      {res.location}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-center text-neutral-900 dark:text-neutral-100">
                      {res.totalQuantity}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-center text-emerald-600 dark:text-emerald-400">
                      {res.availableQuantity}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-center text-blue-600 dark:text-blue-400">
                      {res.bookedQuantity}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-center text-orange-600 dark:text-orange-400">
                      {res.maintenanceQuantity}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={res.status} size="sm" />
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedResource(res)}
                          className="rounded px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setMaintenanceResource(res);
                            setMaintenanceCount(1);
                          }}
                          disabled={res.availableQuantity === 0}
                          className="rounded p-1 text-orange-600 hover:bg-orange-50 disabled:opacity-30 dark:text-orange-400 dark:hover:bg-orange-950/40"
                          title="Schedule Maintenance"
                        >
                          <Wrench className="h-3.5 w-3.5" />
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
                Assigned across {selectedResource.bookedQuantity} concurrent campus reservations today. Average turnaround time from inspection to redeployment is 24 hours.
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
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
    </div>
  );
}

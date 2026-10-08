import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Plus, ArrowLeft } from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { Resource } from '../../types';

export function HODAddEquipmentPage() {
  const navigate = useNavigate();
  const { addEquipment } = useCampusData();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Resource['category']>('Audio/Visual');
  const [quantity, setQuantity] = useState('5');
  const [location, setLocation] = useState('Central AV Storage Depot, Cabinet A');
  const [modelNumber, setModelNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Validation Error', 'Equipment item name is required.');
      return;
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      error('Validation Error', 'Quantity must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addEquipment({
        name: name.trim(),
        category,
        totalQuantity: qty,
        availableQuantity: qty,
        location: location.trim() || 'Central Storage Depot',
      });

      success(
        'Equipment Commissioned',
        `${qty} units of ${name} have been registered and added to campus inventory.`
      );
      navigate('/hod/equipment');
    } catch (err: any) {
      error('Creation Error', err.message || 'Could not register equipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HODRouteGuard pageTitle="Register Equipment Asset">
      <div className="space-y-6 max-w-3xl">
        <HODPageHeader
          title="Register Equipment Asset"
          badge="Inventory Commissioning"
          description="Commission new audio/visual gear, laboratory instruments, computing hardware, or event supplies into the university central depot."
          breadcrumbs={[
            { label: 'Equipment & Resources', href: '/hod/equipment' },
            { label: 'Add Item' },
          ]}
          actions={
            <Link
              to="/hod/equipment"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Inventory</span>
            </Link>
          }
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Item Name */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Item Name & Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shure ULXD4 Wireless Dual Channel Receiver Kit"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Asset Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Audio/Visual">Audio/Visual (Projectors, Mics, Audio)</option>
                  <option value="Computing">Computing (Laptops, Servers, Displays)</option>
                  <option value="Furniture">Furniture (Banquet Chairs, Podiums)</option>
                  <option value="Electrical">Electrical (Power Distros, Ext. Boards)</option>
                  <option value="Accessories">Accessories & Lab Kits</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Total Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Model / Serial */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Model / Asset Tag Identifier
                </label>
                <input
                  type="text"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="e.g. CF-TAG-AV-904"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 font-mono text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Storage Depot Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium Green Room Vault B"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/hod/equipment"
                className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Equipment Asset'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </HODRouteGuard>
  );
}

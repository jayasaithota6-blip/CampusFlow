import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Plus, ArrowLeft } from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useToast } from '../../contexts/ToastContext';
import { MaintenanceTicket } from '../../types';

export function HODNewMaintenancePage() {
  const navigate = useNavigate();
  const { facilities, equipment, addWorkOrder } = useCampusData();
  const { success, error } = useToast();

  const [itemType, setItemType] = useState<'Facility' | 'Resource'>('Facility');
  const [selectedItemId, setSelectedItemId] = useState(facilities[0]?.id || '');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('High');
  const [contractor, setContractor] = useState('Campus Facilities Services');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      error('Validation Error', 'Diagnostic reason and issue summary are required.');
      return;
    }

    let itemName = '';
    let location = '';

    if (itemType === 'Facility') {
      const f = facilities.find((item) => item.id === selectedItemId) || facilities[0];
      itemName = f?.name || 'Campus Venue';
      location = f?.building || 'Main Campus';
    } else {
      const r = equipment.find((item) => item.id === selectedItemId) || equipment[0];
      itemName = r?.name || 'Depot Equipment Unit';
      location = r?.location || 'Central Depot';
    }

    setIsSubmitting(true);
    try {
      const newTicket = await addWorkOrder({
        itemType,
        itemId: selectedItemId,
        itemName,
        location,
        reason: reason.trim(),
        priority,
        status: 'Scheduled',
        assignedTechnician: contractor.trim(),
        startDate,
        expectedCompletionDate: dueDate,
        notes: notes.trim() || 'Scheduled by Campus HOD.',
      });

      success(
        'Work Order Dispatched',
        `Maintenance order ${newTicket.id} created for ${itemName}. Assigned to ${contractor}.`
      );
      navigate('/hod/maintenance');
    } catch (err: any) {
      error('Creation Error', err.message || 'Could not schedule maintenance order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HODRouteGuard pageTitle="Dispatch Maintenance Order">
      <div className="space-y-6 max-w-3xl">
        <HODPageHeader
          title="Schedule Maintenance Work Order"
          badge="Facilities Operations"
          description="Initiate repair and servicing protocols for campus auditoriums, labs, audio-visual systems, or physical infrastructure."
          breadcrumbs={[
            { label: 'Maintenance Orders', href: '/hod/maintenance' },
            { label: 'New Work Order' },
          ]}
          actions={
            <Link
              to="/hod/maintenance"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Orders</span>
            </Link>
          }
        />

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Target Type Selector */}
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Maintenance Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setItemType('Facility');
                    if (facilities.length > 0) setSelectedItemId(facilities[0].id);
                  }}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    itemType === 'Facility'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
                  }`}
                >
                  <span className="font-bold block">Campus Facility / Venue</span>
                  <span className="text-[11px] text-neutral-500">
                    Auditoriums, seminar halls, laboratories, classrooms
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setItemType('Resource');
                    if (equipment.length > 0) setSelectedItemId(equipment[0].id);
                  }}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    itemType === 'Resource'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
                  }`}
                >
                  <span className="font-bold block">Equipment & Depot Asset</span>
                  <span className="text-[11px] text-neutral-500">
                    Projectors, microphones, cameras, PA systems, gear
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Item Dropdown */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Select Specific {itemType === 'Facility' ? 'Venue' : 'Asset'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {itemType === 'Facility'
                    ? facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.building} · {f.type})
                        </option>
                      ))
                    : equipment.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.category} · {r.location})
                        </option>
                      ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Urgency / Priority Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Critical">Urgent / Critical (Immediate dispatch)</option>
                  <option value="High">High (Within 48 hours)</option>
                  <option value="Medium">Medium (Scheduled within 7 days)</option>
                  <option value="Low">Low (Routine periodic maintenance)</option>
                </select>
              </div>

              {/* Contractor / Team */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Assigned Contractor / Specialist Team
                </label>
                <input
                  type="text"
                  required
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  placeholder="e.g. Apex Electrical Works or AudioVisual Team"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Scheduled Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Diagnostic Reason */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Diagnostic Issue Summary & Failure Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the defect (e.g. Laser optical table alignment faulty, HDMI 2.1 throughput flickering, HVAC filter replacement required)"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Special Instructions / Contractor Safety Protocols
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Key clearance required from Security Desk; power cutoff at 18:00."
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/hod/maintenance"
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
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Work Order'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </HODRouteGuard>
  );
}

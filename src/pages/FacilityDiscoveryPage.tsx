import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  Building,
  CheckCircle,
  Star,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit,
  Wrench,
  X,
} from 'lucide-react';
import { facilityService } from '../services/facilityService';
import { Facility, FacilityType, FacilityStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState, LoadingState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function FacilityDiscoveryPage() {
  const { isHOD, isAdmin, role } = useAuth();
  const { success, error } = useToast();
  const isManagement = isHOD || isAdmin || role === 'hod';

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedMinCapacity, setSelectedMinCapacity] = useState<number>(0);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('All');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('All');

  // Management modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null);

  // New Facility Form
  const [newName, setNewName] = useState('');
  const [newBuilding, setNewBuilding] = useState('APJ Abdul Kalam Complex');
  const [newType, setNewType] = useState<FacilityType>('Seminar Hall');
  const [newFloor, setNewFloor] = useState('Ground Floor');
  const [newCapacity, setNewCapacity] = useState<number>(100);
  const [newHourlyRate, setNewHourlyRate] = useState<number>(0);
  const [newAmenities, setNewAmenities] = useState('Laser Projector, Wi-Fi, Microphones, Air Conditioned');
  const [newDescription, setNewDescription] = useState('Modern multi-media campus facility.');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80');

  // Edit Facility Form
  const [editCapacity, setEditCapacity] = useState<number>(100);
  const [editStatus, setEditStatus] = useState<FacilityStatus>('Available');
  const [editNotice, setEditNotice] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadFacilities();
  }, [searchQuery, selectedType, selectedBuilding, selectedStatus, selectedMinCapacity, selectedAmenity, selectedAccessibility]);

  const loadFacilities = async () => {
    setLoading(true);
    const data = await facilityService.search({
      query: searchQuery,
      type: selectedType as any,
      building: selectedBuilding,
      status: selectedStatus as any,
      minCapacity: selectedMinCapacity,
      amenity: selectedAmenity,
      accessibility: selectedAccessibility,
    });
    setFacilities(data);
    setLoading(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedBuilding('All');
    setSelectedStatus('All');
    setSelectedMinCapacity(0);
    setSelectedAmenity('All');
    setSelectedAccessibility('All');
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenitiesList = newAmenities.split(',').map((s) => s.trim()).filter(Boolean);
      await facilityService.addFacility({
        name: newName,
        building: newBuilding,
        type: newType,
        floor: newFloor,
        capacity: Number(newCapacity),
        hourlyRate: Number(newHourlyRate),
        amenities: amenitiesList,
        accessibility: ['Wheelchair Accessible', 'Elevator Nearby'],
        rating: 4.8,
        reviewCount: 1,
        imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
        description: newDescription,
        status: 'Available',
      });
      success('Facility Added', `${newName} has been added to the campus catalog.`);
      setIsAddModalOpen(false);
      resetAddForm();
      loadFacilities();
    } catch (err: any) {
      error('Creation Failed', err.message || 'Could not add facility.');
    }
  };

  const resetAddForm = () => {
    setNewName('');
    setNewCapacity(100);
    setNewAmenities('Laser Projector, Wi-Fi, Microphones, Air Conditioned');
    setNewDescription('Modern multi-media campus facility.');
  };

  const handleOpenEdit = (fac: Facility) => {
    setEditingFacility(fac);
    setEditCapacity(fac.capacity);
    setEditStatus(fac.status);
    setEditNotice(fac.maintenanceNotice || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    try {
      await facilityService.updateFacility(editingFacility.id, {
        capacity: Number(editCapacity),
        status: editStatus,
        maintenanceNotice: editStatus === 'Under Maintenance' ? editNotice : undefined,
      });
      success('Facility Updated', `${editingFacility.name} capacity and status have been updated.`);
      setEditingFacility(null);
      loadFacilities();
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update facility.');
    }
  };

  const handleDeleteFacility = async () => {
    if (!deletingFacility) return;
    try {
      await facilityService.deleteFacility(deletingFacility.id);
      success('Facility Removed', `${deletingFacility.name} has been removed from the campus catalog.`);
      setDeletingFacility(null);
      loadFacilities();
    } catch (err: any) {
      error('Removal Failed', err.message || 'Could not delete facility.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Smart AI Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Explore Campus Facilities
            </h2>
            {isManagement && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                HOD Control Active
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Discover and reserve lecture theatres, computing laboratories, sports arenas, and meeting rooms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isManagement && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Facility</span>
            </button>
          )}

          <Link
            to="/recommendations"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">AI Recommendation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue name, building complex, or features..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* Facility Type */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Category
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="All">All Types</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Computing Lab">Computing Lab</option>
              <option value="Smart Classroom">Smart Classroom</option>
              <option value="Conference Room">Conference Room</option>
              <option value="Sports Arena">Sports Arena</option>
            </select>
          </div>

          {/* Building Complex */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Complex
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="All">All Complexes</option>
              <option value="APJ Abdul Kalam Complex">APJ Kalam Complex</option>
              <option value="CV Raman Block">CV Raman Block</option>
              <option value="Turing Computing Centre">Turing Centre</option>
              <option value="Aryabhata Academic Wing">Aryabhata Wing</option>
              <option value="Major Dhyan Chand Sports Complex">Sports Complex</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>

          {/* Min Capacity */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Min Capacity
            </label>
            <select
              value={selectedMinCapacity}
              onChange={(e) => setSelectedMinCapacity(Number(e.target.value))}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="0">Any Capacity</option>
              <option value="30">30+ People</option>
              <option value="60">60+ People</option>
              <option value="100">100+ People</option>
              <option value="500">500+ People</option>
            </select>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Equipment
            </label>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="All">Any Equipment</option>
              <option value="Projector">Laser Projector</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Microphones">Microphones</option>
              <option value="Smart Board">Smart Board</option>
            </select>
          </div>

          {/* Accessibility & Reset */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Accessibility
            </label>
            <div className="flex gap-1.5">
              <select
                value={selectedAccessibility}
                onChange={(e) => setSelectedAccessibility(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <option value="All">All</option>
                <option value="Wheelchair Accessible">Wheelchair</option>
                <option value="Elevator Nearby">Elevator</option>
              </select>
              <button
                onClick={handleResetFilters}
                className="rounded-md border border-neutral-300 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 whitespace-nowrap"
                title="Reset filters"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {loading ? (
        <LoadingState message="Filtering campus venues..." />
      ) : facilities.length === 0 ? (
        <EmptyState
          title="No facilities found"
          description="No campus venues matched your filter parameters. Try loosening your capacity or building selection."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition-all hover:shadow-md"
            >
              {/* Image & Header */}
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={fac.imageUrl}
                    alt={fac.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <StatusBadge status={fac.status} />
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-md bg-black/60 backdrop-blur-xs px-2 py-1 text-[11px] font-mono text-white">
                    {fac.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      {fac.building}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {fac.rating} ({fac.reviewCount})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {fac.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2">
                    {fac.description}
                  </p>

                  {/* Metadata Chips / Clean Inline Text */}
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <span className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100">
                      <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      {fac.capacity} Max Capacity
                    </span>
                    <span className="truncate text-neutral-400">{fac.floor}</span>
                  </div>

                  {/* Amenities Preview */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {fac.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        {amenity}
                      </span>
                    ))}
                    {fac.amenities.length > 3 && (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800">
                        +{fac.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {fac.maintenanceNotice && (
                    <div className="mt-3 rounded bg-orange-50 p-2 text-[11px] text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                      ⚠️ {fac.maintenanceNotice}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/facilities/${fac.id}`}
                    className="flex-1 text-center rounded-lg border border-neutral-300 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Details
                  </Link>

                  <Link
                    to={`/book?facility=${fac.id}`}
                    className={`flex-1 text-center rounded-lg py-1.5 text-xs font-semibold text-white transition-colors ${
                      fac.status === 'Under Maintenance'
                        ? 'bg-neutral-400 cursor-not-allowed pointer-events-none'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {fac.status === 'Under Maintenance' ? 'Maintenance' : 'Book'}
                  </Link>
                </div>

                {/* HOD Direct Controls: Edit Capacity & Remove Facility */}
                {isManagement && (
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-amber-50 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit Capacity ({fac.capacity})</span>
                    </button>
                    <button
                      onClick={() => setDeletingFacility(fac)}
                      className="inline-flex items-center justify-center gap-1 rounded bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition-colors"
                      title="Remove facility from campus catalog"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD FACILITY MODAL (For HOD & Admin) */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Campus Facility"
          subtitle="Register a new room, lab, or auditorium into the CampusFlow database"
          maxWidth="md"
        >
          <form onSubmit={handleCreateFacility} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Einstein Seminar Hall"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Auditorium">Auditorium</option>
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Computing Lab">Computing Lab</option>
                  <option value="Smart Classroom">Smart Classroom</option>
                  <option value="Conference Room">Conference Room</option>
                  <option value="Sports Arena">Sports Arena</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Building Complex
                </label>
                <input
                  type="text"
                  required
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Max Capacity (Seats)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Floor Level
                </label>
                <input
                  type="text"
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Equipment & Amenities (comma separated)
              </label>
              <input
                type="text"
                value={newAmenities}
                onChange={(e) => setNewAmenities(e.target.value)}
                placeholder="Laser Projector, Wi-Fi, Microphones, Air Conditioned"
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Brief Description
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Create Facility
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT FACILITY MODAL (For HOD & Admin) */}
      {editingFacility && (
        <Modal
          isOpen={!!editingFacility}
          onClose={() => setEditingFacility(null)}
          title={`Edit ${editingFacility.name}`}
          subtitle="Adjust seating capacity, maintenance status, or operational rules"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                required
                min={1}
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Operational Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>

            {editStatus === 'Under Maintenance' && (
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Maintenance Notice
                </label>
                <input
                  type="text"
                  value={editNotice}
                  onChange={(e) => setEditNotice(e.target.value)}
                  placeholder="e.g. AC maintenance until Oct 10"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingFacility(null)}
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

      {/* CONFIRM DELETE FACILITY DIALOG */}
      {deletingFacility && (
        <ConfirmDialog
          isOpen={!!deletingFacility}
          onClose={() => setDeletingFacility(null)}
          onConfirm={handleDeleteFacility}
          title="Remove Facility"
          message={`Are you sure you want to permanently remove "${deletingFacility.name}" from CampusFlow? All future booking slots for this facility will be released.`}
          confirmLabel="Yes, Remove Facility"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}

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
} from 'lucide-react';
import { facilityService } from '../services/facilityService';
import { Facility, FacilityType, FacilityStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState, LoadingState } from '../components/common/EmptyState';

export function FacilityDiscoveryPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedMinCapacity, setSelectedMinCapacity] = useState<number>(0);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('All');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('All');

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

  return (
    <div className="space-y-6">
      {/* Header & Smart AI Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Explore Campus Facilities
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Discover and reserve lecture theatres, computing laboratories, sports arenas, and meeting rooms.
          </p>
        </div>

        <Link
          to="/recommendations"
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
        >
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Can't decide? Use Smart AI Recommendation</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
            placeholder="Search facilities by name, building, amenities (e.g. 'Projector', 'CS Block')..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-4 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Facility Type */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Facility Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="All">All Types</option>
              <option value="Auditorium">Auditorium</option>
              <option value="Seminar Hall">Seminar Hall</option>
              <option value="Classroom">Classroom</option>
              <option value="Computer Lab">Computer Lab</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Sports Ground">Sports Ground</option>
              <option value="Meeting Room">Meeting Room</option>
            </select>
          </div>

          {/* Building */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Building
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="All">All Buildings</option>
              <option value="Main Academic Block">Main Academic Block</option>
              <option value="Auditorium Complex">Auditorium Complex</option>
              <option value="Engineering Block">Engineering Block</option>
              <option value="Computer Science Block">CS Block</option>
              <option value="Administrative Block">Administrative Block</option>
              <option value="Sports Complex">Sports Complex</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">
              Availability
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
                  <div className="absolute top-3 right-3">
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
                  <div className="mt-3 flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <span className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100">
                      <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      {fac.capacity} Max Seats
                    </span>
                    <span>·</span>
                    <span className="truncate">{fac.floor}</span>
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
              <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/20">
                <Link
                  to={`/facilities/${fac.id}`}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                >
                  View Details
                </Link>

                <Link
                  to={`/book?facility=${fac.id}`}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors ${
                    fac.status === 'Under Maintenance'
                      ? 'bg-neutral-400 cursor-not-allowed pointer-events-none'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {fac.status === 'Under Maintenance' ? 'In Maintenance' : 'Book Now'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

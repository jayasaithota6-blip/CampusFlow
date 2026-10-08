import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Building,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Users,
  PlusCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { HODPageHeader } from '../../components/hod/HODPageHeader';
import { HODRouteGuard } from '../../components/hod/HODRouteGuard';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Facility } from '../../types';

interface CampusBlock {
  id: string;
  name: string;
  code: string;
  color: string;
  svgCoords: { x: number; y: number; width: number; height: number };
  description: string;
}

const CAMPUS_BLOCKS: CampusBlock[] = [
  {
    id: 'bld-main',
    name: 'Main Academic Block',
    code: 'MAB',
    color: '#4f46e5',
    svgCoords: { x: 30, y: 15, width: 38, height: 26 },
    description: 'Central administrative offices, executive seminar theaters, and smart lecture halls.',
  },
  {
    id: 'bld-eng',
    name: 'Engineering Block',
    code: 'ENG',
    color: '#0284c7',
    svgCoords: { x: 8, y: 46, width: 38, height: 25 },
    description: 'Advanced laboratories, robotics workshops, and department seminar suites.',
  },
  {
    id: 'bld-cs',
    name: 'Computer Science Block',
    code: 'CSB',
    color: '#0d9488',
    svgCoords: { x: 54, y: 46, width: 38, height: 25 },
    description: 'High performance computing labs, software developer hubs, and cloud research center.',
  },
  {
    id: 'bld-aud',
    name: 'Auditorium Complex',
    code: 'AUD',
    color: '#7c3aed',
    svgCoords: { x: 72, y: 14, width: 22, height: 26 },
    description: 'Grand theatre proscenium, acoustic conference stalls, and VIP green rooms.',
  },
  {
    id: 'bld-sports',
    name: 'Sports Complex & Arena',
    code: 'SPO',
    color: '#16a34a',
    svgCoords: { x: 12, y: 76, width: 76, height: 20 },
    description: 'Outdoor athletic synthetic track, soccer turf, and covered spectator pavilion.',
  },
];

export function HODCampusMapPage() {
  const navigate = useNavigate();
  const { facilities } = useCampusData();

  const [selectedBlock, setSelectedBlock] = useState<CampusBlock>(CAMPUS_BLOCKS[0]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [searchVenue, setSearchVenue] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'Booked' | 'Under Maintenance'>('All');

  // Facilities belonging to selected block
  const blockFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchBuilding =
        f.building.toLowerCase().includes(selectedBlock.name.toLowerCase()) ||
        selectedBlock.name.toLowerCase().includes(f.building.toLowerCase()) ||
        (selectedBlock.code === 'MAB' && f.building.includes('Academic')) ||
        (selectedBlock.code === 'ENG' && f.building.includes('Engineering')) ||
        (selectedBlock.code === 'CSB' && f.building.includes('Computer')) ||
        (selectedBlock.code === 'AUD' && f.building.includes('Auditorium')) ||
        (selectedBlock.code === 'SPO' && f.building.includes('Sports'));

      if (!matchBuilding) return false;
      if (availabilityFilter !== 'All' && f.status !== availabilityFilter) return false;
      if (searchVenue.trim()) {
        const q = searchVenue.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [facilities, selectedBlock, availabilityFilter, searchVenue]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Booked':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Under Maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  return (
    <HODRouteGuard pageTitle="Campus Map">
      <div className="space-y-6">
        <HODPageHeader
          title="Interactive Campus Ground Map"
          badge="Live Spatial Directory"
          description="Interactive visual representation of university buildings, auditorium halls, research labs, and live room availability."
          breadcrumbs={[{ label: 'Campus Map' }]}
        />

        {/* Map and Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive SVG Campus Map (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Campus Physical Layout Map
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Click any campus building to inspect venues and room status
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Available
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Booked
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Maintenance
                </span>
              </div>
            </div>

            {/* SVG Visual Ground Map */}
            <div className="relative rounded-2xl border border-neutral-200 bg-neutral-950 p-2 overflow-hidden shadow-inner aspect-4/3 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                {/* Grass & Grounds Background */}
                <rect x="0" y="0" width="100" height="100" fill="#0f172a" />

                {/* Campus Roads and Walkways */}
                <path
                  d="M 5 43 L 95 43 M 48 5 L 48 95 M 5 73 L 95 73"
                  stroke="#334155"
                  strokeWidth="3.5"
                  strokeDasharray="2, 2"
                />

                {/* Campus Greenery Circles */}
                <circle cx="20" cy="25" r="5" fill="#14532d" opacity="0.6" />
                <circle cx="50" cy="60" r="4" fill="#14532d" opacity="0.6" />
                <circle cx="85" cy="60" r="5" fill="#14532d" opacity="0.6" />

                {/* Buildings */}
                {CAMPUS_BLOCKS.map((block) => {
                  const isSelected = selectedBlock.id === block.id;
                  const { x, y, width, height } = block.svgCoords;
                  return (
                    <g
                      key={block.id}
                      onClick={() => {
                        setSelectedBlock(block);
                        setSelectedFacility(null);
                      }}
                      className="cursor-pointer transition-transform hover:opacity-95"
                    >
                      {/* Drop shadow */}
                      <rect
                        x={x + 0.8}
                        y={y + 0.8}
                        width={width}
                        height={height}
                        rx="2"
                        fill="#000000"
                        opacity="0.5"
                      />
                      {/* Building Body */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx="2"
                        fill={block.color}
                        stroke={isSelected ? '#ffffff' : '#ffffff40'}
                        strokeWidth={isSelected ? '0.9' : '0.4'}
                      />
                      {/* Text label */}
                      <text
                        x={x + width / 2}
                        y={y + height / 2 - 1}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="3.2"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {block.code}
                      </text>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 3}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="2"
                        fontFamily="sans-serif"
                      >
                        {block.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur rounded-lg px-2.5 py-1 text-[11px] text-white border border-neutral-700">
                Selected: <strong className="text-indigo-400">{selectedBlock.name}</strong>
              </div>
            </div>

            {/* Quick Block Selector Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {CAMPUS_BLOCKS.map((block) => (
                <button
                  key={block.id}
                  onClick={() => {
                    setSelectedBlock(block);
                    setSelectedFacility(null);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedBlock.id === block.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                      : 'border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {block.name}
                </button>
              ))}
            </div>
          </div>

          {/* Block Venues & Detail Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
              <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {selectedBlock.name}
                  </h3>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedBlock.code}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{selectedBlock.description}</p>
              </div>

              {/* Filters for venues */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchVenue}
                    onChange={(e) => setSearchVenue(e.target.value)}
                    placeholder="Search venue in this block..."
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-8 pr-2 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>

                <select
                  value={availabilityFilter}
                  onChange={(e: any) => setAvailabilityFilter(e.target.value)}
                  className="rounded-lg border border-neutral-300 bg-neutral-50 px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Under Maintenance">Maintenance</option>
                </select>
              </div>

              {/* Venue cards list */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {blockFacilities.length === 0 ? (
                  <p className="py-6 text-center text-xs text-neutral-400">
                    No venues match this filter in {selectedBlock.name}.
                  </p>
                ) : (
                  blockFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => setSelectedFacility(fac)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all text-xs ${
                        selectedFacility?.id === fac.id
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {fac.name}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge(fac.status)}`}>
                          {fac.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {fac.type} · Capacity: {fac.capacity} attendees · Floor: {fac.floor}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Selected Venue Details & "Book this Venue" CTA */}
              {selectedFacility && (
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                  <div className="rounded-xl bg-neutral-50 p-3.5 dark:bg-neutral-850 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {selectedFacility.name}
                      </span>
                      <span className="text-[11px] text-neutral-500">{selectedFacility.building}</span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">{selectedFacility.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedFacility.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/book?facility=${selectedFacility.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Book This Venue</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HODRouteGuard>
  );
}

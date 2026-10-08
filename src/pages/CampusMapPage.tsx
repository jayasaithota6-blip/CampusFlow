import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';

interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  coords: { x: number; y: number; width: number; height: number };
  color: string;
  facilities: { name: string; type: string; capacity: number; status: 'Available' | 'Booked' | 'Under Maintenance'; id: string }[];
  description: string;
}

const BUILDINGS: CampusBuilding[] = [
  {
    id: 'bld-main',
    name: 'Main Academic Block',
    code: 'MAB',
    coords: { x: 30, y: 15, width: 38, height: 25 },
    color: '#4f46e5',
    description: 'Central administrative offices, executive seminar theaters, and lecture halls.',
    facilities: [
      { id: 'fac-sem-a', name: 'Seminar Hall A', type: 'Seminar Hall', capacity: 100, status: 'Available' },
      { id: 'fac-cls-204', name: 'Classroom 204', type: 'Classroom', capacity: 55, status: 'Available' },
    ],
  },
  {
    id: 'bld-eng',
    name: 'Engineering Block',
    code: 'ENG',
    coords: { x: 10, y: 45, width: 35, height: 24 },
    color: '#0284c7',
    description: 'Advanced laboratories, mechanical workshops, and department seminar suites.',
    facilities: [
      { id: 'fac-sem-b', name: 'Seminar Hall B', type: 'Seminar Hall', capacity: 80, status: 'Available' },
      { id: 'fac-lab-physics', name: 'Physics Research Lab', type: 'Laboratory', capacity: 35, status: 'Under Maintenance' },
    ],
  },
  {
    id: 'bld-cs',
    name: 'Computer Science Block',
    code: 'CSB',
    coords: { x: 55, y: 45, width: 35, height: 24 },
    color: '#0d9488',
    description: 'High performance computing labs, software developer hubs, and data center.',
    facilities: [
      { id: 'fac-lab-cs1', name: 'Computer Lab 1', type: 'Computer Lab', capacity: 60, status: 'Available' },
      { id: 'fac-lab-cs2', name: 'Computer Lab 2', type: 'Computer Lab', capacity: 45, status: 'Booked' },
    ],
  },
  {
    id: 'bld-aud',
    name: 'Auditorium Complex',
    code: 'AUD',
    coords: { x: 70, y: 15, width: 22, height: 24 },
    color: '#7c3aed',
    description: 'Grand theatre proscenium, acoustic conference stalls, and VIP green rooms.',
    facilities: [
      { id: 'fac-aud-main', name: 'Main Auditorium', type: 'Auditorium', capacity: 650, status: 'Available' },
    ],
  },
  {
    id: 'bld-sports',
    name: 'Sports Complex & Arena',
    code: 'SPO',
    coords: { x: 15, y: 74, width: 70, height: 22 },
    color: '#16a34a',
    description: 'Outdoor athletic synthetic track, soccer turf, and covered spectator pavilion.',
    facilities: [
      { id: 'fac-sports-main', name: 'Campus Sports Ground', type: 'Sports Ground', capacity: 1200, status: 'Available' },
    ],
  },
];

export function CampusMapPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding>(BUILDINGS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Interactive Campus Ground Map
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Select campus building complexes to inspect active room capacities and live booking availability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Canvas Container */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Interactive Ground Layout
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">Click any block to highlight venues</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-16/10 rounded-xl bg-neutral-100 border border-neutral-200/80 dark:bg-neutral-950 dark:border-neutral-800 overflow-hidden shadow-inner p-4">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Campus Walkways & Lawn Background Elements */}
              <rect x="0" y="0" width="100" height="100" fill="transparent" />
              <circle cx="50" cy="50" r="10" fill="#e2e8f0" opacity="0.4" />
              {/* Walkway Paths */}
              <line x1="50" y1="10" x2="50" y2="90" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="2 1" />
              <line x1="10" y1="40" x2="90" y2="40" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="2 1" />

              {/* Building Blocks */}
              {BUILDINGS.map((bld) => {
                const isSelected = selectedBuilding.id === bld.id;
                return (
                  <g
                    key={bld.id}
                    onClick={() => setSelectedBuilding(bld)}
                    className="cursor-pointer transition-transform group"
                  >
                    <rect
                      x={bld.coords.x}
                      y={bld.coords.y}
                      width={bld.coords.width}
                      height={bld.coords.height}
                      rx="2.5"
                      fill={bld.color}
                      opacity={isSelected ? 0.95 : 0.75}
                      stroke={isSelected ? '#ffffff' : '#ffffff40'}
                      strokeWidth={isSelected ? '0.8' : '0.4'}
                      className="transition-all hover:opacity-100"
                    />
                    <text
                      x={bld.coords.x + bld.coords.width / 2}
                      y={bld.coords.y + bld.coords.height / 2 - 1.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="3.2"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {bld.code}
                    </text>
                    <text
                      x={bld.coords.x + bld.coords.width / 2}
                      y={bld.coords.y + bld.coords.height / 2 + 2.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffffcc"
                      fontSize="2"
                      className="pointer-events-none"
                    >
                      {bld.facilities.length} Venues
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Building Selector Pills */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {BUILDINGS.map((bld) => (
              <button
                key={bld.id}
                onClick={() => setSelectedBuilding(bld)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedBuilding.id === bld.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {bld.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Building Details Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedBuilding.code}
                </span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedBuilding.name}
                </h3>
              </div>
              <Building className="h-6 w-6 text-neutral-400" />
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              {selectedBuilding.description}
            </p>

            {/* Facilities in this block */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Facilities in this Building ({selectedBuilding.facilities.length})
              </h4>

              <div className="space-y-2">
                {selectedBuilding.facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {fac.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {fac.type} · Capacity {fac.capacity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={fac.status} size="sm" />
                      <Link
                        to={`/facilities/${fac.id}`}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                        title="View Facility"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              to={`/book`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <span>Book Space in {selectedBuilding.code}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

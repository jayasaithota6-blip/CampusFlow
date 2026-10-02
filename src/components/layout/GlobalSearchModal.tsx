import React, { useState, useEffect } from 'react';
import { Search, Building, Calendar, Package, Users, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { facilityService } from '../../services/facilityService';
import { bookingService } from '../../services/bookingService';
import { resourceService } from '../../services/resourceService';
import { Facility, Booking, Resource } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      facilityService.getAll().then(setFacilities);
      bookingService.getAll().then(setBookings);
      resourceService.getAll().then(setResources);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredFacilities = q
    ? facilities.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.building.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q)
      ).slice(0, 3)
    : facilities.slice(0, 3);

  const filteredBookings = q
    ? bookings.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.eventName.toLowerCase().includes(q) ||
          b.facilityName.toLowerCase().includes(q)
      ).slice(0, 3)
    : bookings.slice(0, 2);

  const filteredResources = q
    ? resources.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      ).slice(0, 3)
    : resources.slice(0, 2);

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-hidden dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search facilities, bookings, resources, departments..."
            className="flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Facilities */}
          {filteredFacilities.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-400 uppercase tracking-wider text-[11px] mb-2">
                <Building className="h-3.5 w-3.5" />
                <span>Facilities</span>
              </div>
              <div className="space-y-1">
                {filteredFacilities.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => handleSelect(`/facilities/${fac.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 text-left transition-colors dark:hover:bg-neutral-800"
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{fac.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {fac.building} · Capacity {fac.capacity}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bookings */}
          {filteredBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-400 uppercase tracking-wider text-[11px] mb-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Bookings</span>
              </div>
              <div className="space-y-1">
                {filteredBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(`/bookings/${b.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 text-left transition-colors dark:hover:bg-neutral-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-900 font-medium dark:text-neutral-100">{b.id}</span>
                        <span className="text-[10px] text-neutral-500">{b.status}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-sm">
                        {b.eventName} ({b.facilityName})
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {filteredResources.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-400 uppercase tracking-wider text-[11px] mb-2">
                <Package className="h-3.5 w-3.5" />
                <span>Equipment & Resources</span>
              </div>
              <div className="space-y-1">
                {filteredResources.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleSelect('/resources')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 text-left transition-colors dark:hover:bg-neutral-800"
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{res.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {res.category} · {res.availableQuantity} available
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredFacilities.length === 0 && filteredBookings.length === 0 && filteredResources.length === 0 && (
            <div className="py-8 text-center text-neutral-500">
              No matching results found for "{query}".
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/40 flex justify-between">
          <span>Press ESC to dismiss</span>
          <span>Tip: search by facility type or room code</span>
        </div>
      </div>
    </div>
  );
}

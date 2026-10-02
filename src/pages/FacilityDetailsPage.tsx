import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowLeft,
  Share2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { facilityService } from '../services/facilityService';
import { bookingService } from '../services/bookingService';
import { Facility, Booking } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { LoadingState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function FacilityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [scheduledBookings, setScheduledBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [loading, setLoading] = useState(true);

  const { success, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadFacility(id);
    }
  }, [id, selectedDate]);

  const loadFacility = async (facId: string) => {
    setLoading(true);
    const fac = await facilityService.getById(facId);
    if (fac) {
      setFacility(fac);
      const dayBookings = await bookingService.getByFacilityAndDate(fac.id, selectedDate);
      setScheduledBookings(dayBookings);
    }
    setLoading(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      info('Link Copied', 'Facility link copied to clipboard.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading facility specifications..." />;
  }

  if (!facility) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Facility Not Found</h3>
        <p className="mt-2 text-xs text-neutral-500">The facility you requested could not be located in the catalog.</p>
        <Link to="/facilities" className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:underline">
          ← Return to catalog
        </Link>
      </div>
    );
  }

  // Realistic mock slots for the selected day
  const timeSlots = [
    { time: '08:00 AM – 10:00 AM', status: 'Available' },
    { time: '10:00 AM – 12:00 PM', status: scheduledBookings.length > 0 ? 'Booked' : 'Available', event: scheduledBookings[0]?.eventName },
    { time: '12:00 PM – 02:00 PM', status: 'Available' },
    { time: '02:00 PM – 04:00 PM', status: 'Available' },
    { time: '04:00 PM – 06:00 PM', status: 'Available' },
    { time: '06:00 PM – 08:00 PM', status: 'Available' },
  ];

  return (
    <div className="space-y-8">
      {/* Back button & Action Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
          <Link
            to={`/calendar?facility=${facility.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>View Calendar</span>
          </Link>
          <Link
            to={`/book?facility=${facility.id}`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors ${
              facility.status === 'Under Maintenance'
                ? 'bg-neutral-400 pointer-events-none'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>Book Now</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Visual Gallery & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
            <img
              src={facility.imageUrl}
              alt={facility.name}
              referrerPolicy="no-referrer"
              className="h-80 sm:h-96 w-full object-cover"
            />
            <div className="absolute top-4 left-4 rounded-md bg-black/60 backdrop-blur-xs px-2.5 py-1 text-xs font-mono font-medium text-white">
              {facility.type}
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={facility.status} />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              {facility.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              <span>{facility.building} · {facility.floor}</span>
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Venue Overview
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {facility.description}
            </p>
          </div>

          {/* Amenities & Equipment List */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Included Amenities & Equipment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {facility.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Features */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Accessibility & Safety Standards
            </h3>
            <div className="flex flex-wrap gap-2">
              {facility.accessibility.map((acc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{acc}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Details Card & Live Availability Grid */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Facts Summary Box */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Facility Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="text-neutral-500">Seating Capacity</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {facility.capacity} Persons
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="text-neutral-500">Location Block</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {facility.building}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="text-neutral-500">Room / Floor</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {facility.floor}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <span className="text-neutral-500">Current Status</span>
                <StatusBadge status={facility.status} size="sm" />
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-neutral-500">Approval Level Required</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  Coordinator & HOD
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/book?facility=${facility.id}`}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-white shadow-xs transition-colors ${
                  facility.status === 'Under Maintenance'
                    ? 'bg-neutral-400 pointer-events-none'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span>{facility.status === 'Under Maintenance' ? 'Facility In Maintenance' : 'Reserve This Facility'}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Availability Calendar */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Check Slot Availability
                </h3>
                <p className="text-[11px] text-neutral-500">Live booking slots for chosen day</p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div className="space-y-2 pt-2">
              {timeSlots.map((slot, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border p-3 text-xs transition-colors ${
                    slot.status === 'Booked'
                      ? 'border-rose-200 bg-rose-50/60 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200'
                      : 'border-neutral-200 bg-white hover:border-indigo-400 dark:border-neutral-800 dark:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="font-mono">{slot.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {slot.status === 'Booked' ? (
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                        Booked {slot.event ? `· ${slot.event.slice(0, 15)}...` : ''}
                      </span>
                    ) : (
                      <Link
                        to={`/book?facility=${facility.id}&date=${selectedDate}&time=${encodeURIComponent(slot.time)}`}
                        className="rounded bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        Available · Book
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

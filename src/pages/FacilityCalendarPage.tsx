import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Building,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { facilityService } from '../services/facilityService';
import { Booking, Facility } from '../types';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';

export function FacilityCalendarPage() {
  const [searchParams] = useSearchParams();
  const facilityFilterParam = searchParams.get('facility') || 'all';

  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilityFilterParam);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Default to 2026-10-02 (current local project time)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 2));
  const navigate = useNavigate();

  useEffect(() => {
    facilityService.getAll().then(setFacilities);
    bookingService.getAll().then(setBookings);
  }, []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
  ];

  // Filter bookings for the selected facility
  const visibleBookings = bookings.filter((b) => {
    if (selectedFacilityId !== 'all' && b.facilityId !== selectedFacilityId) return false;
    return b.status !== 'Cancelled';
  });

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (view === 'day') next.setDate(next.getDate() - 1);
    else if (view === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (view === 'day') next.setDate(next.getDate() + 1);
    else if (view === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleSlotClick = (dateStr: string, timeStr: string) => {
    const facParam = selectedFacilityId !== 'all' ? `&facility=${selectedFacilityId}` : '';
    navigate(`/book?date=${dateStr}&time=${encodeURIComponent(timeStr)}${facParam}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Campus Master Calendar
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Interactive room schedule, multi-facility reservations, and real-time conflict status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Filter */}
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Campus Facilities</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.building})
              </option>
            ))}
          </select>

          {/* View Switcher: Day / Week / Month */}
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-800 dark:bg-neutral-800">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  view === mode
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/book')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Date Navigator & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 9, 2))}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="ml-2 font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-neutral-600 dark:text-neutral-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-neutral-600 dark:text-neutral-400">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-neutral-600 dark:text-neutral-400">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-neutral-600 dark:text-neutral-400">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid View: Week / Day */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-xs font-semibold">
            <div className="p-3 text-neutral-400 text-center border-r border-neutral-200 dark:border-neutral-800">
              Time
            </div>
            {daysOfWeek.map((day, dIdx) => (
              <div
                key={day}
                className={`p-3 text-center border-r last:border-r-0 border-neutral-200 dark:border-neutral-800 ${
                  dIdx === 4 ? 'bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                <span className="block font-mono text-[11px] font-normal text-neutral-500">
                  Oct {dIdx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 min-h-[56px]">
                {/* Hour Label */}
                <div className="flex items-start justify-center p-2 font-mono text-[11px] text-neutral-400 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-850">
                  {hour}
                </div>

                {/* Day Columns */}
                {daysOfWeek.map((day, dIdx) => {
                  const dateStr = `2026-10-0${dIdx + 1}`;
                  // Check if booking matches this day & hour
                  const match = visibleBookings.find(
                    (b) => b.date === dateStr && b.startTime.includes(hour.split(' ')[0])
                  );

                  return (
                    <div
                      key={day}
                      className="relative p-1 border-r last:border-r-0 border-neutral-100 dark:border-neutral-800 group hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {match ? (
                        <div
                          onClick={() => setSelectedBooking(match)}
                          className={`h-full w-full rounded-md p-1.5 cursor-pointer text-left transition-all ${
                            match.status === 'Confirmed'
                              ? 'bg-rose-100 text-rose-950 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-100 dark:border-rose-800'
                              : match.status === 'Pending' || match.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-950 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-100 dark:border-amber-800'
                              : 'bg-indigo-100 text-indigo-950 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-100 dark:border-indigo-800'
                          }`}
                        >
                          <p className="font-semibold truncate text-[11px]">{match.facilityName}</p>
                          <p className="text-[10px] opacity-80 truncate">{match.eventName}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSlotClick(dateStr, hour)}
                          className="h-full w-full rounded opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-dashed border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 transition-opacity"
                        >
                          + Book
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={selectedBooking.eventName}
          subtitle={`Booking ID: ${selectedBooking.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Current Status</span>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-500">Facility</span>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.facilityName}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Building</span>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.building}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Date</span>
                <p className="font-mono font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.date}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Time</span>
                <p className="font-mono font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.startTime} – {selectedBooking.endTime}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Organizer</span>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.organizerName}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Department</span>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.department}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
              <span className="text-neutral-500">Description</span>
              <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                {selectedBooking.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigate(`/bookings/${selectedBooking.id}`);
                  setSelectedBooking(null);
                }}
                className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Open Full Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

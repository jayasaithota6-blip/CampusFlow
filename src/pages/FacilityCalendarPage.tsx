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
  User,
  Filter,
  Users,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { facilityService } from '../services/facilityService';
import { Booking, Facility } from '../types';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';

export function FacilityCalendarPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const facilityFilterParam = searchParams.get('facility') || 'all';

  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilityFilterParam);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDayBookings, setSelectedDayBookings] = useState<{ date: string; bookings: Booking[] } | null>(null);

  // Default to project date (October 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 3));
  const navigate = useNavigate();

  useEffect(() => {
    facilityService.getAll().then(setFacilities);
    bookingService.getAll().then(setBookings);
  }, []);

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

  const handleBookDate = (dateStr: string, timeStr?: string) => {
    const facParam = selectedFacilityId !== 'all' ? `&facility=${selectedFacilityId}` : '';
    const timeParam = timeStr ? `&time=${encodeURIComponent(timeStr)}` : '';
    navigate(`/book?date=${dateStr}${facParam}${timeParam}`);
  };

  // Helper: Format Date to YYYY-MM-DD
  const formatDateToISO = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Month Generation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells for month view (including leading padding)
  const monthDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    monthDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    monthDays.push(new Date(year, month, day));
  }

  // Week Generation Helpers
  const startOfWeek = new Date(currentDate);
  const currentDayOfWeek = startOfWeek.getDay(); // 0 is Sun
  startOfWeek.setDate(startOfWeek.getDate() - currentDayOfWeek);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const isUserBooking = (b: Booking) => {
    if (!user) return false;
    return (
      b.organizerId.toLowerCase() === user.id.toLowerCase() ||
      b.organizerEmail.toLowerCase() === user.email.toLowerCase() ||
      (user.collegeId && b.organizerId.toLowerCase() === user.collegeId.toLowerCase())
    );
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
            View all campus reservations across every facility to check slot availability and schedule your bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 outline-none focus:border-indigo-500"
            >
              <option value="all">All Campus Facilities</option>
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.building})
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher: Month / Week / Day */}
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-800 dark:bg-neutral-800">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  view === mode
                    ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/book')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
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
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 9, 3))}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          >
            Current Term
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="ml-2 font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              ...(view === 'day' ? { day: 'numeric', weekday: 'short' } : {}),
            })}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span className="font-semibold text-indigo-700 dark:text-indigo-400">My Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-neutral-600 dark:text-neutral-400">Campus Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-neutral-600 dark:text-neutral-400">Pending Approval</span>
          </div>
        </div>
      </div>

      {/* MONTH VIEW: Shows all booking dates in the month */}
      {view === 'month' && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/80 text-center text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-3">
                {d}
              </div>
            ))}
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {monthDays.map((dayDate, idx) => {
              if (!dayDate) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[110px] bg-neutral-50/40 p-2 dark:bg-neutral-950/20"
                  />
                );
              }

              const dateStr = formatDateToISO(dayDate);
              const dayNum = dayDate.getDate();
              const dayBookings = visibleBookings.filter((b) => b.date === dateStr);
              const hasMyBooking = dayBookings.some(isUserBooking);
              const isToday =
                dayDate.getDate() === 3 && dayDate.getMonth() === 9 && dayDate.getFullYear() === 2026;

              return (
                <div
                  key={dateStr}
                  className={`min-h-[115px] p-2 flex flex-col justify-between transition-colors group hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 ${
                    isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  <div>
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {dayBookings.length > 0 && (
                        <button
                          onClick={() => setSelectedDayBookings({ date: dateStr, bookings: dayBookings })}
                          className="text-[10px] font-medium text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {dayBookings.length} {dayBookings.length === 1 ? 'event' : 'events'}
                        </button>
                      )}
                    </div>

                    {/* Booking Chips */}
                    <div className="mt-1.5 space-y-1">
                      {dayBookings.slice(0, 2).map((b) => {
                        const isMine = isUserBooking(b);
                        return (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium truncate transition-all ${
                              isMine
                                ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                                : b.status === 'Confirmed'
                                ? 'bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-900/60'
                                : 'bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900/60'
                            }`}
                            title={`${b.facilityName} - ${b.eventName} (${b.startTime} - ${b.endTime})`}
                          >
                            <span className="font-semibold">{b.startTime.split(' ')[0]}</span>{' '}
                            <span>{b.facilityName}</span>
                          </div>
                        );
                      })}

                      {dayBookings.length > 2 && (
                        <button
                          onClick={() => setSelectedDayBookings({ date: dateStr, bookings: dayBookings })}
                          className="w-full text-left text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                          +{dayBookings.length - 2} more...
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Book Slot Button */}
                  <div className="mt-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleBookDate(dateStr)}
                      className="w-full rounded bg-emerald-50 py-1 text-center text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 border border-dashed border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors"
                    >
                      + Book Slot
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {view === 'week' && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-xs font-semibold">
              <div className="p-3 text-neutral-400 text-center border-r border-neutral-200 dark:border-neutral-800">
                Time
              </div>
              {weekDays.map((d) => {
                const dateStr = formatDateToISO(d);
                const isSelected = dateStr === formatDateToISO(currentDate);
                return (
                  <div
                    key={dateStr}
                    className={`p-3 text-center border-r last:border-r-0 border-neutral-200 dark:border-neutral-800 ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="block font-mono text-[11px] font-normal text-neutral-500">
                      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Rows */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[56px]">
                  <div className="flex items-start justify-center p-2 font-mono text-[11px] text-neutral-400 border-r border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-850">
                    {hour}
                  </div>

                  {weekDays.map((d) => {
                    const dateStr = formatDateToISO(d);
                    const match = visibleBookings.find(
                      (b) => b.date === dateStr && b.startTime.includes(hour.split(' ')[0])
                    );

                    return (
                      <div
                        key={dateStr}
                        className="relative p-1 border-r last:border-r-0 border-neutral-100 dark:border-neutral-800 group hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        {match ? (
                          <div
                            onClick={() => setSelectedBooking(match)}
                            className={`h-full w-full rounded-md p-1.5 cursor-pointer text-left transition-all ${
                              isUserBooking(match)
                                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                : match.status === 'Confirmed'
                                ? 'bg-rose-100 text-rose-950 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-100 dark:border-rose-800'
                                : 'bg-amber-100 text-amber-950 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-100 dark:border-amber-800'
                            }`}
                          >
                            <p className="font-semibold truncate text-[11px]">{match.facilityName}</p>
                            <p className="text-[10px] opacity-85 truncate">
                              {isUserBooking(match) ? '★ Your Booking' : match.eventName}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBookDate(dateStr, hour)}
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
      )}

      {/* DAY VIEW */}
      {view === 'day' && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-4 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              onClick={() => handleBookDate(formatDateToISO(currentDate))}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Book This Date</span>
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {hours.map((hour) => {
              const dateStr = formatDateToISO(currentDate);
              const match = visibleBookings.find(
                (b) => b.date === dateStr && b.startTime.includes(hour.split(' ')[0])
              );

              return (
                <div key={hour} className="grid grid-cols-12 min-h-[56px] items-center p-2">
                  <div className="col-span-2 font-mono text-xs text-neutral-500 font-medium">
                    {hour}
                  </div>
                  <div className="col-span-10">
                    {match ? (
                      <div
                        onClick={() => setSelectedBooking(match)}
                        className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer ${
                          isUserBooking(match)
                            ? 'bg-indigo-600 text-white font-semibold'
                            : match.status === 'Confirmed'
                            ? 'bg-rose-50 text-rose-950 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-900'
                            : 'bg-amber-50 text-amber-950 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{match.facilityName} · {match.eventName}</p>
                          <p className="text-[11px] opacity-80">
                            {match.organizerName} ({match.department}) · {match.startTime} - {match.endTime}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20">
                          {isUserBooking(match) ? 'Your Booking' : match.status}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBookDate(dateStr, hour)}
                        className="text-neutral-400 hover:text-emerald-600 text-xs flex items-center gap-1 font-medium"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                        Available - Click to reserve this slot
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Detail Modal: Displays all bookings for a clicked day in month view */}
      {selectedDayBookings && (
        <Modal
          isOpen={!!selectedDayBookings}
          onClose={() => setSelectedDayBookings(null)}
          title={`Campus Bookings on ${selectedDayBookings.date}`}
          subtitle={`${selectedDayBookings.bookings.length} reservations found across facilities`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {selectedDayBookings.bookings.map((b) => (
                <div key={b.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {b.facilityName}
                      </span>
                      <StatusBadge status={b.status} />
                      {isUserBooking(b) && (
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          Your Reservation
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                      {b.eventName}
                    </p>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Reserved by {b.organizerName} ({b.department}) · {b.startTime} to {b.endTime}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBooking(b);
                      setSelectedDayBookings(null);
                    }}
                    className="rounded border border-neutral-300 px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 shrink-0"
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-500">Need a room on this date?</span>
              <button
                onClick={() => {
                  const d = selectedDayBookings.date;
                  setSelectedDayBookings(null);
                  handleBookDate(d);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Book This Date</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

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
              <span className="text-neutral-500">Reservation Status</span>
              <div className="flex items-center gap-2">
                {isUserBooking(selectedBooking) && (
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Your Booking
                  </span>
                )}
                <StatusBadge status={selectedBooking.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-500">Facility</span>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.facilityName}
                </p>
                <p className="text-[11px] text-neutral-400">{selectedBooking.building}</p>
              </div>

              <div>
                <span className="text-neutral-500">Scheduled Time</span>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.date}
                </p>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {selectedBooking.startTime} – {selectedBooking.endTime}
                </p>
              </div>

              <div>
                <span className="text-neutral-500">Reserved By</span>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.organizerName}
                </p>
                <p className="text-[11px] text-neutral-400">{selectedBooking.department}</p>
              </div>

              <div>
                <span className="text-neutral-500">Expected Attendance</span>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {selectedBooking.participants} Attendees
                </p>
              </div>
            </div>

            {selectedBooking.description && (
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/60">
                <span className="text-neutral-500 block mb-1 font-medium">Event Description</span>
                <p className="text-neutral-700 dark:text-neutral-300">{selectedBooking.description}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const d = selectedBooking.date;
                  setSelectedBooking(null);
                  handleBookDate(d);
                }}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Book This Date
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

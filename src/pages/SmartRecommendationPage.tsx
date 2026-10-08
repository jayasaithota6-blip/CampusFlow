import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building,
  Check,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { RecommendationResult, EventType } from '../types';
import { LoadingState } from '../components/common/EmptyState';

export function SmartRecommendationPage() {
  const [eventType, setEventType] = useState<EventType>('Workshop');
  const [participants, setParticipants] = useState<number>(80);
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-15');
  const [preferredStartTime, setPreferredStartTime] = useState<string>('10:00 AM');
  const [preferredEndTime, setPreferredEndTime] = useState<string>('12:00 PM');
  const [equipmentList, setEquipmentList] = useState<string[]>(['Projector', 'Microphones', 'Wi-Fi']);

  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const availableEquipOptions = [
    'Projector',
    'Microphones',
    'Wi-Fi',
    'Air Conditioning',
    'Smart Board',
    'Whiteboard',
    'Speakers',
  ];

  const toggleEquipment = (item: string) => {
    setEquipmentList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    const recs = await bookingService.getRecommendations({
      eventType,
      participants,
      requiredEquipment: equipmentList,
      preferredDate,
      preferredStartTime,
      preferredEndTime,
    });

    setResults(recs);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intelligent Space Matching</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Smart Facility Recommendation
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          State-of-the-art campus venue matching engine based on crowd size, technical AV constraints, and live schedules.
        </p>
      </div>

      {/* Query Parameters Form */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="Workshop">Technical Workshop</option>
                <option value="Seminar">Academic Seminar</option>
                <option value="Meeting">Executive Meeting</option>
                <option value="Cultural Event">Cultural Event</option>
                <option value="Sports Event">Sports Tournament</option>
                <option value="Club Activity">Student Club Activity</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Expected Participants
              </label>
              <input
                type="number"
                min={5}
                max={1500}
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Start Time
              </label>
              <select
                value={preferredStartTime}
                onChange={(e) => setPreferredStartTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                End Time
              </label>
              <select
                value={preferredEndTime}
                onChange={(e) => setPreferredEndTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Required Built-in Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {availableEquipOptions.map((item) => {
                const checked = equipmentList.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      checked
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
                    }`}
                  >
                    <div
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded text-[10px] ${
                        checked ? 'bg-indigo-600 text-white' : 'border border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      {checked && '✓'}
                    </div>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Find Best Facility</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      {loading ? (
        <LoadingState message="Ranking campus venues against criteria..." />
      ) : hasSearched && results.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Ranked Match Results ({results.length} Candidates Evaluated)
            </h3>
            <span className="text-xs text-neutral-500">Sorted by match confidence score</span>
          </div>

          {/* Top #1 Recommended Highlight Card */}
          {results[0] && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/80 bg-white p-6 shadow-md dark:border-emerald-600 dark:bg-neutral-900">
              <div className="absolute top-0 right-0 rounded-bl-xl bg-emerald-600 px-4 py-1 text-xs font-bold text-white">
                #1 Recommended Match
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-4 h-48 rounded-xl overflow-hidden">
                  <img
                    src={results[0].facility.imageUrl}
                    alt={results[0].facility.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        {results[0].facility.name}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {results[0].facility.building} · {results[0].facility.floor}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {results[0].matchScore}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400">
                        Match Score
                      </span>
                    </div>
                  </div>

                  {/* Match Factors Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Capacity</span>
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        {results[0].facility.capacity} Seats
                      </strong>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Requested Time</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {results[0].isAvailable ? 'Available' : 'Conflict'}
                      </strong>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Projector</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">Available</strong>
                    </div>
                    <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Wi-Fi & Audio</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">Available</strong>
                    </div>
                  </div>

                  {/* Reasons list */}
                  <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                    {results[0].reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      to={`/facilities/${results[0].facility.id}`}
                      className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/book?facility=${results[0].facility.id}&date=${preferredDate}&time=${preferredStartTime}`}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
                    >
                      Book This Facility
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Alternative Recommendations */}
          {results.slice(1).length > 0 && (
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Alternative Recommended Venues
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.slice(1, 4).map((alt) => (
                  <div
                    key={alt.facility.id}
                    className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                          {alt.facility.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {alt.matchScore}% Match
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-500">
                        {alt.facility.building} · Capacity {alt.facility.capacity}
                      </p>

                      <ul className="mt-3 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                        {alt.reasons.slice(0, 2).map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-emerald-500">✓</span>
                            <span className="truncate">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <Link
                        to={`/facilities/${alt.facility.id}`}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/book?facility=${alt.facility.id}&date=${preferredDate}`}
                        className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-500">
          No campus spaces met your exact participant and amenity thresholds. Try reducing required items.
        </div>
      ) : null}
    </div>
  );
}

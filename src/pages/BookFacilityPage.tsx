import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  FileText,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  QrCode,
  Users,
} from 'lucide-react';
import { facilityService } from '../services/facilityService';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';
import { Facility, Resource, EventType, ConflictCheckResult, Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { StatusBadge } from '../components/common/Badge';

export function BookFacilityPage() {
  const [searchParams] = useSearchParams();
  const initialFacilityId = searchParams.get('facility') || '';
  const initialDate = searchParams.get('date') || '2026-10-15';
  const initialTime = searchParams.get('time') || '';

  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(initialFacilityId ? 2 : 1);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Form State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(initialFacilityId);
  const [date, setDate] = useState<string>(initialDate);
  const [startTime, setStartTime] = useState<string>('10:00 AM');
  const [endTime, setEndTime] = useState<string>('12:00 PM');

  // Event Details
  const [eventName, setEventName] = useState<string>('Technical Workshop');
  const [eventType, setEventType] = useState<EventType>('Workshop');
  const [description, setDescription] = useState<string>('Hands-on cloud & AI development session with students.');
  const [participants, setParticipants] = useState<number>(80);
  const [department, setDepartment] = useState<string>(user?.department || 'Computer Science');
  const [organizerName, setOrganizerName] = useState<string>(user?.name || 'Rahul Sharma');
  const [organizerPhone, setOrganizerPhone] = useState<string>(user?.phone || '+1 (555) 234-5678');

  // Sync user profile if user changes or signs in
  useEffect(() => {
    if (user) {
      setOrganizerName(user.name);
      setDepartment(user.department || 'Computer Science');
      if (user.phone) setOrganizerPhone(user.phone);
    }
  }, [user]);

  // Resource Quantities
  const [requestedResources, setRequestedResources] = useState<Record<string, number>>({});

  // Conflict state
  const [conflictCheck, setConflictCheck] = useState<ConflictCheckResult>({ hasConflict: false });
  const [isCheckingConflict, setIsCheckingConflict] = useState<boolean>(false);

  // Submitted booking result
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    facilityService.getAll().then((res) => {
      setFacilities(res);
      if (!selectedFacilityId && res.length > 0) {
        setSelectedFacilityId(res[0].id);
      }
    });
    resourceService.getAll().then(setResources);
  }, []);

  // Real-time conflict validation whenever facility, date, or time changes
  useEffect(() => {
    if (selectedFacilityId && date && startTime && endTime) {
      checkConflicts();
    }
  }, [selectedFacilityId, date, startTime, endTime, requestedResources]);

  const checkConflicts = async () => {
    setIsCheckingConflict(true);
    const resourceList = Object.entries(requestedResources)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ resourceId: id, quantity: qty }));

    const result = await bookingService.checkConflict({
      facilityId: selectedFacilityId,
      date,
      startTime,
      endTime,
      requestedResources: resourceList,
    });

    setConflictCheck(result);
    setIsCheckingConflict(false);
  };

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  const handleResourceChange = (resId: string, delta: number, maxAvailable: number) => {
    setRequestedResources((prev) => {
      const current = prev[resId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [resId]: next };
    });
  };

  const handleSubmitBooking = async () => {
    if (conflictCheck.hasConflict) {
      error('Booking Blocked', conflictCheck.conflictReason || 'Conflict detected in schedule.');
      return;
    }

    if (!selectedFacility) {
      error('Missing Facility', 'Please choose a facility.');
      return;
    }

    const resourceItems = Object.entries(requestedResources)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const found = resources.find((r) => r.id === id);
        return {
          resourceId: id,
          name: found ? found.name : id,
          quantity: qty,
        };
      });

    try {
      const created = await bookingService.createBooking({
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        facilityType: selectedFacility.type,
        building: selectedFacility.building,
        eventName,
        eventType,
        description,
        date,
        startTime,
        endTime,
        participants,
        organizerId: user?.id || 'usr-guest',
        organizerName,
        organizerEmail: user?.email || 'user@campus.edu',
        organizerPhone,
        department,
        status: 'Pending',
        resources: resourceItems,
      });

      setSubmittedBooking(created);
      success('Booking Submitted', `Request ${created.id} is now awaiting department review.`);
    } catch (err: any) {
      error('Submission Error', err.message || 'Failed to submit booking request.');
    }
  };

  // Step 5 Success Screen
  if (submittedBooking) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Booking Request Submitted
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Request ID: {submittedBooking.id}
            </h2>
            <p className="mt-2 text-xs text-neutral-500">
              Your facility reservation request has been dispatched into the digital approval queue.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-4 text-xs dark:bg-neutral-800 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Facility:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {submittedBooking.facilityName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Date & Time:</span>
              <span className="font-mono text-neutral-900 dark:text-neutral-100">
                {submittedBooking.date} ({submittedBooking.startTime} – {submittedBooking.endTime})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Event:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {submittedBooking.eventName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Next Stage:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Head of Department (HOD) Authorization & QR Pass Issue
              </span>
            </div>
            <div className="mt-2 rounded-lg bg-indigo-50/70 p-2.5 text-[11px] text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
              💡 As per campus protocol, once your Department HOD approves this request, the system will automatically generate your cryptographic QR entry pass.
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/bookings/${submittedBooking.id}`)}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              View Booking Dossier
            </button>
            <button
              onClick={() => {
                setSubmittedBooking(null);
                setStep(1);
              }}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              Book Another Facility
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Book Campus Facility
        </h2>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Guided 5-step booking workflow with real-time schedule and equipment validation.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {[
            { num: 1, label: 'Facility' },
            { num: 2, label: 'Date & Time' },
            { num: 3, label: 'Event Details' },
            { num: 4, label: 'Resources' },
            { num: 5, label: 'Review & Submit' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === s.num
                    ? 'bg-indigo-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span
                className={`text-xs font-medium ${
                  step === s.num
                    ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-400'
                }`}
              >
                {s.label}
              </span>
              {s.num < 5 && <div className="h-0.5 w-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/* STEP 1: Select Facility */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Step 1: Choose Venue
            </h3>
            <p className="text-xs text-neutral-500">
              Select an available campus facility for your upcoming event or lecture.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {facilities.map((fac) => {
                const isSelected = selectedFacilityId === fac.id;
                const isMaintenance = fac.status === 'Under Maintenance';

                return (
                  <div
                    key={fac.id}
                    onClick={() => !isMaintenance && setSelectedFacilityId(fac.id)}
                    className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : isMaintenance
                        ? 'opacity-60 cursor-not-allowed border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-850'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                    }`}
                  >
                    <div className="h-28 w-full overflow-hidden rounded-lg mb-3">
                      <img
                        src={fac.imageUrl}
                        alt={fac.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {fac.name}
                      </span>
                      <StatusBadge status={fac.status} size="sm" />
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {fac.building} · Capacity {fac.capacity}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedFacilityId}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <span>Continue to Date & Time</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Date & Time + Real-Time Conflict Detection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Step 2: Schedule & Availability
              </h3>
              <p className="text-xs text-neutral-500">
                Pick the reservation date and time interval. Our conflict engine inspects active bookings in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  End Time
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                </select>
              </div>
            </div>

            {/* REAL-TIME CONFLICT NOTIFICATION CARD */}
            {conflictCheck.hasConflict ? (
              <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Conflict Detected</span>
                </div>
                <p>{conflictCheck.conflictReason}</p>

                {conflictCheck.suggestedAlternativeTimes && conflictCheck.suggestedAlternativeTimes.length > 0 && (
                  <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
                    <span className="font-semibold block mb-1 text-[11px] uppercase tracking-wider text-rose-800 dark:text-rose-300">
                      Suggested Alternative Times:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {conflictCheck.suggestedAlternativeTimes.map((alt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setStartTime(alt.startTime);
                            setEndTime(alt.endTime);
                          }}
                          className="rounded-md bg-white px-2.5 py-1 text-xs font-mono font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100"
                        >
                          {alt.startTime} – {alt.endTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Schedule Clear!</strong> {selectedFacility?.name} is completely available for {date} from {startTime} to {endTime}.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={conflictCheck.hasConflict}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <span>Continue to Event Details</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Event Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Step 3: Event Dossier
              </h3>
              <p className="text-xs text-neutral-500">
                Provide academic context and logistical information for reviewer approval.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Technical Workshop: Cloud & AI Architectures"
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Cultural Event">Cultural Event</option>
                  <option value="Sports Event">Sports Event</option>
                  <option value="Examination">Examination</option>
                  <option value="Club Activity">Club Activity</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Expected Participants
                </label>
                <input
                  type="number"
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  min={1}
                  max={selectedFacility?.capacity || 1000}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <span className="text-[10px] text-neutral-400">
                  Room limit: {selectedFacility?.capacity} seats
                </span>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Organizer Name
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Event Description & Objective
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the agenda, external speakers, and faculty endorsements..."
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 p-2 text-xs text-neutral-900 outline-none focus:border-indigo-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!eventName.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <span>Continue to Required Resources</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Required Resources */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Step 4: Required Equipment & Furniture
              </h3>
              <p className="text-xs text-neutral-500">
                Add projectors, microphones, or seating. Unavailable equipment is automatically locked.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {resources.map((res) => {
                const qty = requestedResources[res.id] || 0;
                const isUnavailable = res.availableQuantity <= 0;

                return (
                  <div
                    key={res.id}
                    className={`rounded-xl border p-3.5 flex items-center justify-between ${
                      isUnavailable
                        ? 'border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-800 dark:bg-neutral-850'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {res.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {res.category} ·{' '}
                        {isUnavailable ? (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            Unavailable (In Maintenance or Booked)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {res.availableQuantity} Available
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUnavailable || qty === 0}
                        onClick={() => handleResourceChange(res.id, -1, res.availableQuantity)}
                        className="h-7 w-7 rounded border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 w-6 text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={isUnavailable || qty >= res.availableQuantity}
                        onClick={() => handleResourceChange(res.id, 1, res.availableQuantity)}
                        className="h-7 w-7 rounded border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <span>Continue to Review & Submit</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Step 5: Review & Submit Booking
              </h3>
              <p className="text-xs text-neutral-500">
                Verify the reservation details before submitting for hierarchical administrative endorsement.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-neutral-500">Selected Facility:</span>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    {selectedFacility?.name}
                  </p>
                  <p className="text-[11px] text-neutral-500">{selectedFacility?.building}</p>
                </div>

                <div>
                  <span className="text-neutral-500">Date:</span>
                  <p className="font-mono font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    {date}
                  </p>
                </div>

                <div>
                  <span className="text-neutral-500">Time Window:</span>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {startTime} – {endTime}
                  </p>
                </div>

                <div>
                  <span className="text-neutral-500">Event Title:</span>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    {eventName}
                  </p>
                  <p className="text-[11px] text-neutral-500">{eventType}</p>
                </div>

                <div>
                  <span className="text-neutral-500">Expected Attendance:</span>
                  <p className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    {participants} Attendees
                  </p>
                </div>

                <div>
                  <span className="text-neutral-500">Required Approval:</span>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Sole Head of Department (HOD) Authorization & QR Pass Issue
                  </p>
                </div>
              </div>

              {/* Resources Allocated */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-500 block mb-2 font-semibold">
                  Bundled Equipment & Furniture:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(requestedResources).filter(([_, qty]) => qty > 0).length === 0 ? (
                    <span className="text-neutral-400 italic">No extra external equipment requested.</span>
                  ) : (
                    Object.entries(requestedResources)
                      .filter(([_, qty]) => qty > 0)
                      .map(([resId, qty]) => {
                        const r = resources.find((item) => item.id === resId);
                        return (
                          <span
                            key={resId}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                          >
                            <Package className="h-3 w-3 text-indigo-500" />
                            <span>
                              {qty}x {r?.name.split(' (')[0]}
                            </span>
                          </span>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSubmitBooking}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
              >
                <span>Submit Booking Request</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

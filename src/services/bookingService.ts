import { INITIAL_BOOKINGS } from '../data/mockData';
import {
  Booking,
  BookingStatus,
  ConflictCheckResult,
  RecommendationResult,
  SmartRecommendationQuery,
} from '../types';
import { facilityService } from './facilityService';
import { resourceService } from './resourceService';

const STORAGE_KEY = 'campusflow_bookings';

function getStoredBookings(): Booking[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

function saveBookings(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

// Convert "10:00 AM" or "14:00" to minutes from midnight for interval intersection
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const raw = clean.replace(/[APM\s]/g, '');
  const [hStr, mStr] = raw.split(':');
  let h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
}

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    return getStoredBookings();
  },

  async getById(id: string): Promise<Booking | undefined> {
    const list = getStoredBookings();
    return list.find((b) => b.id.toLowerCase() === id.toLowerCase());
  },

  async getByUser(userId: string): Promise<Booking[]> {
    const list = getStoredBookings();
    return list.filter((b) => b.organizerId === userId);
  },

  async getByFacilityAndDate(facilityId: string, date: string): Promise<Booking[]> {
    const list = getStoredBookings();
    return list.filter(
      (b) =>
        b.facilityId === facilityId &&
        b.date === date &&
        b.status !== 'Cancelled' &&
        b.status !== 'Rejected'
    );
  },

  async checkConflict(params: {
    facilityId: string;
    date: string;
    startTime: string;
    endTime: string;
    requestedResources?: { resourceId: string; quantity: number }[];
    excludeBookingId?: string;
  }): Promise<ConflictCheckResult> {
    const facility = await facilityService.getById(params.facilityId);
    if (!facility) {
      return { hasConflict: true, conflictReason: 'Selected facility was not found.' };
    }

    if (facility.status === 'Under Maintenance') {
      return {
        hasConflict: true,
        conflictReason: `${facility.name} is currently under maintenance (${facility.maintenanceNotice || 'Facility unavailable'}).`,
      };
    }

    const startMinutes = parseTimeToMinutes(params.startTime);
    const endMinutes = parseTimeToMinutes(params.endTime);

    if (endMinutes <= startMinutes) {
      return {
        hasConflict: true,
        conflictReason: 'End time must be later than start time.',
      };
    }

    // Check facility bookings
    const bookings = getStoredBookings();
    const activeSameDay = bookings.filter(
      (b) =>
        b.facilityId === params.facilityId &&
        b.date === params.date &&
        b.id !== params.excludeBookingId &&
        b.status !== 'Cancelled' &&
        b.status !== 'Rejected'
    );

    for (const b of activeSameDay) {
      const bStart = parseTimeToMinutes(b.startTime);
      const bEnd = parseTimeToMinutes(b.endTime);

      // Overlap condition: start < bEnd and end > bStart
      if (startMinutes < bEnd && endMinutes > bStart) {
        return {
          hasConflict: true,
          conflictingBooking: b,
          conflictReason: `${b.facilityName} is already booked from ${b.startTime} to ${b.endTime} for "${b.eventName}".`,
          suggestedAlternativeTimes: [
            { startTime: '12:00 PM', endTime: '02:00 PM' },
            { startTime: '02:30 PM', endTime: '04:30 PM' },
            { startTime: '05:00 PM', endTime: '07:00 PM' },
          ],
        };
      }
    }

    // Check equipment availability
    if (params.requestedResources && params.requestedResources.length > 0) {
      const allResources = await resourceService.getAll();
      const unavailable: { name: string; requested: number; available: number }[] = [];

      for (const req of params.requestedResources) {
        const res = allResources.find((r) => r.id === req.resourceId);
        if (res) {
          if (res.availableQuantity < req.quantity) {
            unavailable.push({
              name: res.name,
              requested: req.quantity,
              available: res.availableQuantity,
            });
          }
        }
      }

      if (unavailable.length > 0) {
        const itemNames = unavailable
          .map((u) => `${u.name} (only ${u.available} available, requested ${u.requested})`)
          .join(', ');
        return {
          hasConflict: true,
          conflictReason: `Resource capacity exceeded: ${itemNames}`,
          unavailableResources: unavailable,
        };
      }
    }

    return { hasConflict: false };
  },

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'qrCodeToken' | 'approvalHierarchy'>): Promise<Booking> {
    const list = getStoredBookings();
    const count = list.length + 129;
    const newId = `BK-2026-00${count}`;

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'Pending',
      approvalHierarchy: [
        {
          role: 'student',
          label: `Request Submitted (${bookingData.organizerName})`,
          status: 'approved',
          updatedAt: new Date().toLocaleString(),
          actorName: bookingData.organizerName,
        },
        {
          role: 'hod',
          label: 'HOD Department Authorization & QR Pass Issue',
          status: 'pending',
        },
      ],
      qrCodeToken: '', // ONLY generated when HOD approves!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newBooking);
    saveBookings(list);
    return newBooking;
  },

  async updateStatus(
    id: string,
    status: BookingStatus,
    options?: {
      rejectionReason?: string;
      reviewerNotes?: string;
      actorName?: string;
      actorRole?: 'coordinator' | 'hod' | 'admin' | 'facility_manager';
    }
  ): Promise<Booking> {
    const list = getStoredBookings();
    const index = list.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error('Booking not found');

    const cur = list[index];
    cur.status = status;
    cur.updatedAt = new Date().toISOString();

    if (options?.rejectionReason) cur.rejectionReason = options.rejectionReason;
    if (options?.reviewerNotes) cur.reviewerNotes = options.reviewerNotes;

    // HOD APPROVAL SYSTEM: Generate QR Pass ONLY upon approval
    if (status === 'Confirmed' || status === 'HOD Approved') {
      cur.status = 'Confirmed';
      if (!cur.qrCodeToken || cur.qrCodeToken.includes('PENDING')) {
        cur.qrCodeToken = `CAMPUSFLOW-QR-${cur.id}-${Date.now().toString(36).toUpperCase()}`;
      }
    }

    // Update approval hierarchy state
    const targetRole = options?.actorRole || 'hod';
    const step = cur.approvalHierarchy.find((s) => s.role === targetRole || s.role === 'hod');
    if (step) {
      step.status = status === 'Rejected' ? 'rejected' : 'approved';
      step.updatedAt = new Date().toLocaleString();
      step.actorName = options?.actorName || 'Head of Department (HOD)';
      if (options?.reviewerNotes) step.comments = options.reviewerNotes;
      if (options?.rejectionReason) step.comments = `Rejected: ${options.rejectionReason}`;
    }

    list[index] = { ...cur };
    saveBookings(list);
    return cur;
  },

  async getRecommendations(query: SmartRecommendationQuery): Promise<RecommendationResult[]> {
    const allFacilities = await facilityService.getAll();
    const results: RecommendationResult[] = [];

    for (const fac of allFacilities) {
      if (fac.status === 'Under Maintenance') continue;

      let score = 70;
      const reasons: string[] = [];

      // Capacity check
      if (fac.capacity >= query.participants) {
        const capacityOverhead = fac.capacity - query.participants;
        if (capacityOverhead <= 40) {
          score += 15;
          reasons.push(`Optimal room capacity (${fac.capacity} seats for ${query.participants} attendees)`);
        } else {
          score += 8;
          reasons.push(`Accommodates full group capacity (${fac.capacity} seats)`);
        }
      } else {
        score -= 40;
      }

      // Equipment match
      const matchedAmenities = query.requiredEquipment.filter((eq) =>
        fac.amenities.some((a) => a.toLowerCase().includes(eq.toLowerCase()))
      );

      if (matchedAmenities.length === query.requiredEquipment.length && query.requiredEquipment.length > 0) {
        score += 10;
        reasons.push(`All requested equipment built-in (${matchedAmenities.join(', ')})`);
      } else if (matchedAmenities.length > 0) {
        score += 5;
        reasons.push(`Partial amenities present (${matchedAmenities.join(', ')})`);
      }

      // Event Type relevance
      if (
        (query.eventType === 'Workshop' && (fac.type === 'Seminar Hall' || fac.type === 'Computer Lab')) ||
        (query.eventType === 'Seminar' && (fac.type === 'Auditorium' || fac.type === 'Seminar Hall')) ||
        (query.eventType === 'Meeting' && fac.type === 'Meeting Room') ||
        (query.eventType === 'Sports Event' && fac.type === 'Sports Ground')
      ) {
        score += 5;
        reasons.push(`Purpose-designed for ${query.eventType} events`);
      }

      // Check conflict for preferred date & time
      let isAvailable = true;
      if (query.preferredDate && query.preferredStartTime && query.preferredEndTime) {
        const conflict = await this.checkConflict({
          facilityId: fac.id,
          date: query.preferredDate,
          startTime: query.preferredStartTime,
          endTime: query.preferredEndTime,
        });
        if (conflict.hasConflict) {
          isAvailable = false;
          score -= 30;
        } else {
          reasons.push('Requested time slot fully available');
        }
      }

      reasons.push(`Prime location in ${fac.building}`);
      const finalScore = Math.max(30, Math.min(99, score));

      results.push({
        facility: fac,
        matchScore: finalScore,
        reasons,
        isAvailable,
      });
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  },
};

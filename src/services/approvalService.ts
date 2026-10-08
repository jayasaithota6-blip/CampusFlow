import { bookingService } from './bookingService';
import { notificationService } from './notificationService';
import { Booking, BookingStatus } from '../types';

export const approvalService = {
  async getPendingRequests(): Promise<Booking[]> {
    const all = await bookingService.getAll();
    return all.filter((b) => b.status === 'Pending' || b.status === 'Under Review');
  },

  async approveRequest(
    bookingId: string,
    reviewer: { name: string; role?: string },
    notes?: string
  ): Promise<Booking> {
    const updated = await bookingService.updateStatus(bookingId, 'Confirmed', {
      reviewerNotes: notes || 'Approved by Head of Department (HOD). Entry QR pass generated.',
      actorName: reviewer.name || 'Dr. Marcus Vance (HOD)',
      actorRole: 'hod',
    });

    // Notify the user that HOD has approved and QR pass is ready
    await notificationService.addNotification({
      category: 'Approval',
      title: 'HOD Approved Your Booking · QR Pass Ready',
      message: `Your booking ${updated.id} for ${updated.facilityName} has been approved by ${reviewer.name || 'the HOD'}. Your QR entry pass is now generated.`,
      link: `/bookings/${updated.id}`,
    });

    return updated;
  },

  async rejectRequest(
    bookingId: string,
    reviewer: { name: string; role?: string },
    reason: string
  ): Promise<Booking> {
    const updated = await bookingService.updateStatus(bookingId, 'Rejected', {
      rejectionReason: reason,
      actorName: reviewer.name || 'Head of Department (HOD)',
      actorRole: 'hod',
    });

    await notificationService.addNotification({
      category: 'Approval',
      title: 'Booking Request Rejected by HOD',
      message: `Your booking request ${updated.id} was not approved: ${reason}`,
      link: `/bookings/${updated.id}`,
    });

    return updated;
  },

  async requestChanges(
    bookingId: string,
    reviewer: { name: string; role?: string },
    comments: string
  ): Promise<Booking> {
    return bookingService.updateStatus(bookingId, 'Draft', {
      reviewerNotes: comments,
      actorName: reviewer.name || 'HOD',
      actorRole: 'hod',
    });
  },
};


import { INITIAL_NOTIFICATIONS, INITIAL_BOOKINGS } from '../data/mockData';
import { NotificationItem } from '../types';

const NOTIF_PREFIX = 'campusflow_notifications_';

function generateHODRequestNotifications(): NotificationItem[] {
  return [
    {
      id: 'notif-req-00129',
      userId: 'campushod@gmail.com',
      title: 'New Reservation Request · BK-2026-00129',
      message: 'Robotics & AI Club (Computer Science) requested Main Auditorium for "Annual Inter-College Robotics Symposium & Keynote" on 2026-10-08 (02:00 PM – 06:00 PM). Awaiting HOD review.',
      category: 'Booking',
      timeAgo: '15 mins ago',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      link: '/bookings/BK-2026-00129',
    },
    {
      id: 'notif-req-00130',
      userId: 'campushod@gmail.com',
      title: 'New Reservation Request · BK-2026-00130',
      message: 'Prof. Elena Rostova (Computer Science) requested Computer Lab 1 for "Distributed Systems & Cloud Computing Lab Examination" on 2026-10-05 (09:00 AM – 01:00 PM). Awaiting HOD review.',
      category: 'Booking',
      timeAgo: '42 mins ago',
      timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      read: false,
      link: '/bookings/BK-2026-00130',
    },
    {
      id: 'notif-req-00128',
      userId: 'campushod@gmail.com',
      title: 'Booking Approved · QR Issued · BK-2026-00128',
      message: 'Rahul Sharma (Computer Science) reservation for Seminar Hall A has been approved. Digital QR pass is active.',
      category: 'Approval',
      timeAgo: '2 hours ago',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      read: true,
      link: '/bookings/BK-2026-00128',
    },
    {
      id: 'notif-sys-01',
      userId: 'campushod@gmail.com',
      title: 'Campus Operational Overview Ready',
      message: 'Welcome Campus Head of Department. All campus facilities, user directory management, and approval queues are active.',
      category: 'System',
      timeAgo: '1 day ago',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      read: true,
    },
  ];
}

function getStoredNotifications(userId: string): NotificationItem[] {
  const safeId = userId || 'anonymous';
  const isHOD =
    safeId.toLowerCase() === 'campushod@gmail.com' ||
    safeId.toLowerCase() === 'usr-hod-01' ||
    safeId.toLowerCase() === 'hod';

  const key = `${NOTIF_PREFIX}${isHOD ? 'campushod@gmail.com' : safeId}`;
  const data = localStorage.getItem(key);

  if (!data) {
    if (isHOD) {
      const hodNotifs = generateHODRequestNotifications();
      localStorage.setItem(key, JSON.stringify(hodNotifs));
      return hodNotifs;
    }

    if (safeId === 'usr-student-01') {
      localStorage.setItem(key, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }

    // New user starts with a clean welcome notification
    const welcomeNotifs: NotificationItem[] = [
      {
        id: `notif-welcome-${Date.now()}`,
        userId: safeId,
        title: 'Welcome to CampusFlow',
        message: 'Your account is active and verified. You can now browse facilities and schedule campus reservations.',
        category: 'System',
        timeAgo: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
    localStorage.setItem(key, JSON.stringify(welcomeNotifs));
    return welcomeNotifs;
  }

  try {
    const parsed = JSON.parse(data);
    // If HOD has an old empty array, ensure request notifications exist
    if (isHOD && parsed.length === 0) {
      const hodNotifs = generateHODRequestNotifications();
      localStorage.setItem(key, JSON.stringify(hodNotifs));
      return hodNotifs;
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveNotifications(userId: string, items: NotificationItem[]) {
  const safeId = userId || 'anonymous';
  const isHOD =
    safeId.toLowerCase() === 'campushod@gmail.com' ||
    safeId.toLowerCase() === 'usr-hod-01' ||
    safeId.toLowerCase() === 'hod';
  const key = `${NOTIF_PREFIX}${isHOD ? 'campushod@gmail.com' : safeId}`;
  localStorage.setItem(key, JSON.stringify(items));
}

export const notificationService = {
  async getByUser(userId: string): Promise<NotificationItem[]> {
    return getStoredNotifications(userId);
  },

  async getAll(): Promise<NotificationItem[]> {
    return getStoredNotifications('campushod@gmail.com');
  },

  async markAsRead(userId: string, id: string): Promise<void> {
    const list = getStoredNotifications(userId);
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      saveNotifications(userId, list);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const list = getStoredNotifications(userId);
    list.forEach((n) => (n.read = true));
    saveNotifications(userId, list);
  },

  async addNotification(
    targetOrNotif: string | Omit<NotificationItem, 'id' | 'timeAgo' | 'timestamp' | 'read'>,
    maybeNotif?: Omit<NotificationItem, 'id' | 'timeAgo' | 'timestamp' | 'read'>
  ): Promise<NotificationItem> {
    let targetUserId = 'usr-student-01';
    let notifPayload: Omit<NotificationItem, 'id' | 'timeAgo' | 'timestamp' | 'read'>;

    if (typeof targetOrNotif === 'string' && maybeNotif) {
      targetUserId = targetOrNotif;
      notifPayload = maybeNotif;
    } else {
      notifPayload = targetOrNotif as Omit<NotificationItem, 'id' | 'timeAgo' | 'timestamp' | 'read'>;
      if (notifPayload.userId) targetUserId = notifPayload.userId;
    }

    const list = getStoredNotifications(targetUserId);
    const item: NotificationItem = {
      ...notifPayload,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    saveNotifications(targetUserId, list);

    // If it's a booking request and not already sent to HOD, also copy to HOD feed
    if (
      notifPayload.category === 'Booking' &&
      targetUserId !== 'campushod@gmail.com' &&
      targetUserId !== 'usr-hod-01'
    ) {
      const hodList = getStoredNotifications('campushod@gmail.com');
      hodList.unshift({
        ...item,
        id: `notif-hod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      });
      saveNotifications('campushod@gmail.com', hodList);
    }

    return item;
  },
};

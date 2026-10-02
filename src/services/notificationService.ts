import { INITIAL_NOTIFICATIONS } from '../data/mockData';
import { NotificationItem } from '../types';

const STORAGE_KEY = 'campusflow_notifications';

function getStoredNotifications(): NotificationItem[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveNotifications(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const notificationService = {
  async getAll(): Promise<NotificationItem[]> {
    return getStoredNotifications();
  },

  async markAsRead(id: string): Promise<void> {
    const list = getStoredNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      saveNotifications(list);
    }
  },

  async markAllAsRead(): Promise<void> {
    const list = getStoredNotifications();
    list.forEach((n) => (n.read = true));
    saveNotifications(list);
  },

  async addNotification(notif: Omit<NotificationItem, 'id' | 'timeAgo' | 'timestamp' | 'read'>): Promise<NotificationItem> {
    const list = getStoredNotifications();
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    saveNotifications(list);
    return item;
  },
};

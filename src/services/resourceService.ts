import { INITIAL_RESOURCES } from '../data/mockData';
import { Resource } from '../types';

const STORAGE_KEY = 'campusflow_resources';

function getStoredResources(): Resource[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESOURCES));
    return INITIAL_RESOURCES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RESOURCES;
  }
}

function saveResources(resources: Resource[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}

export const resourceService = {
  async getAll(): Promise<Resource[]> {
    return getStoredResources();
  },

  async getById(id: string): Promise<Resource | undefined> {
    const list = getStoredResources();
    return list.find((r) => r.id === id);
  },

  async updateQuantity(
    id: string,
    updates: Partial<Pick<Resource, 'availableQuantity' | 'bookedQuantity' | 'maintenanceQuantity' | 'totalQuantity'>>
  ): Promise<Resource> {
    const list = getStoredResources();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resource not found');

    const updated = { ...list[index], ...updates };
    if (updated.maintenanceQuantity >= updated.totalQuantity) {
      updated.status = 'Maintenance';
    } else if (updated.availableQuantity <= 0) {
      updated.status = 'Unavailable';
    } else if (updated.availableQuantity <= 2) {
      updated.status = 'Low Stock';
    } else {
      updated.status = 'Available';
    }

    list[index] = updated;
    saveResources(list);
    return updated;
  },

  async markMaintenance(id: string, count: number): Promise<Resource> {
    const list = getStoredResources();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resource not found');

    const cur = list[index];
    const take = Math.min(count, cur.availableQuantity);
    cur.availableQuantity -= take;
    cur.maintenanceQuantity += take;
    if (cur.availableQuantity <= 0) cur.status = 'Maintenance';
    saveResources(list);
    return cur;
  },

  async returnFromMaintenance(id: string, count: number): Promise<Resource> {
    const list = getStoredResources();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resource not found');

    const cur = list[index];
    const returnCount = Math.min(count, cur.maintenanceQuantity);
    cur.maintenanceQuantity -= returnCount;
    cur.availableQuantity += returnCount;
    if (cur.availableQuantity > 0) cur.status = 'Available';
    saveResources(list);
    return cur;
  },

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const list = getStoredResources();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Resource not found');

    list[index] = { ...list[index], ...updates };
    saveResources(list);
    return list[index];
  },

  async addResource(newRes: Omit<Resource, 'id'>): Promise<Resource> {
    const list = getStoredResources();
    const item: Resource = {
      ...newRes,
      id: `res-custom-${Date.now().toString(36)}`,
    };
    list.unshift(item);
    saveResources(list);
    return item;
  },

  async deleteResource(id: string): Promise<void> {
    const list = getStoredResources();
    const filtered = list.filter((r) => r.id !== id);
    saveResources(filtered);
  },
};

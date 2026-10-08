import { INITIAL_FACILITIES } from '../data/mockData';
import { Facility, FacilityType, FacilityStatus } from '../types';

const STORAGE_KEY = 'campusflow_facilities';

function getStoredFacilities(): Facility[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FACILITIES));
    return INITIAL_FACILITIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_FACILITIES;
  }
}

function saveFacilities(facilities: Facility[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
}

export const facilityService = {
  async getAll(): Promise<Facility[]> {
    return getStoredFacilities();
  },

  async getById(id: string): Promise<Facility | undefined> {
    const list = getStoredFacilities();
    return list.find((f) => f.id === id);
  },

  async search(params: {
    query?: string;
    type?: FacilityType | 'All';
    building?: string;
    minCapacity?: number;
    status?: FacilityStatus | 'All';
    amenity?: string;
    accessibility?: string;
  }): Promise<Facility[]> {
    let list = getStoredFacilities();

    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.building.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }

    if (params.type && params.type !== 'All') {
      list = list.filter((f) => f.type === params.type);
    }

    if (params.building && params.building !== 'All') {
      list = list.filter((f) => f.building === params.building);
    }

    if (params.minCapacity && params.minCapacity > 0) {
      list = list.filter((f) => f.capacity >= params.minCapacity!);
    }

    if (params.status && params.status !== 'All') {
      list = list.filter((f) => f.status === params.status);
    }

    if (params.amenity && params.amenity !== 'All') {
      list = list.filter((f) => f.amenities.includes(params.amenity!));
    }

    if (params.accessibility && params.accessibility !== 'All') {
      list = list.filter((f) => f.accessibility.includes(params.accessibility!));
    }

    return list;
  },

  async updateStatus(id: string, status: FacilityStatus, notice?: string): Promise<Facility> {
    const list = getStoredFacilities();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Facility not found');
    list[index] = {
      ...list[index],
      status,
      maintenanceNotice: notice,
    };
    saveFacilities(list);
    return list[index];
  },

  async addFacility(data: Omit<Facility, 'id'>): Promise<Facility> {
    const list = getStoredFacilities();
    const newId = `fac-${Date.now().toString(36)}`;
    const newFacility: Facility = {
      ...data,
      id: newId,
    };
    list.unshift(newFacility);
    saveFacilities(list);
    return newFacility;
  },

  async updateFacility(id: string, updates: Partial<Facility>): Promise<Facility> {
    const list = getStoredFacilities();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Facility not found');
    list[index] = {
      ...list[index],
      ...updates,
    };
    saveFacilities(list);
    return list[index];
  },

  async deleteFacility(id: string): Promise<void> {
    const list = getStoredFacilities();
    const filtered = list.filter((f) => f.id !== id);
    saveFacilities(filtered);
  },
};

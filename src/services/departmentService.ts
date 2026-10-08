import { INITIAL_DEPARTMENTS } from '../data/mockData';
import { Department } from '../types';

const STORAGE_KEY = 'campusflow_departments';

function getStoredDepartments(): Department[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
    return INITIAL_DEPARTMENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEPARTMENTS;
  }
}

function saveDepartments(departments: Department[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
}

export const departmentService = {
  async getAll(): Promise<Department[]> {
    return getStoredDepartments();
  },

  async updateCoordinator(id: string, name: string, email: string): Promise<Department> {
    const list = getStoredDepartments();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Department not found');
    list[index].coordinatorName = name;
    list[index].coordinatorEmail = email;
    saveDepartments(list);
    return list[index];
  },

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    const list = getStoredDepartments();
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Department not found');
    list[index] = { ...list[index], ...updates };
    saveDepartments(list);
    return list[index];
  },

  async addDepartment(dept: Omit<Department, 'id'>): Promise<Department> {
    const list = getStoredDepartments();
    const item: Department = {
      ...dept,
      id: `dept-${dept.code.toLowerCase()}-${Date.now().toString(36)}`,
    };
    list.unshift(item);
    saveDepartments(list);
    return item;
  },

  async deleteDepartment(id: string): Promise<void> {
    const list = getStoredDepartments();
    const filtered = list.filter((d) => d.id !== id);
    saveDepartments(filtered);
  },
};

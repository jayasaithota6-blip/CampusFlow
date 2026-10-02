import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';

const STORAGE_KEY = 'campusflow_users';

function getStoredUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  async getAll(): Promise<User[]> {
    return getStoredUsers();
  },

  async getById(id: string): Promise<User | undefined> {
    const list = getStoredUsers();
    return list.find((u) => u.id === id);
  },

  async updateRole(id: string, newRole: UserRole): Promise<User> {
    const list = getStoredUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    list[index].role = newRole;
    saveUsers(list);
    return list[index];
  },

  async toggleStatus(id: string): Promise<User> {
    const list = getStoredUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    list[index].status = list[index].status === 'Active' ? 'Inactive' : 'Active';
    saveUsers(list);
    return list[index];
  },

  async register(data: {
    name: string;
    email: string;
    collegeId: string;
    role: UserRole;
    department: string;
    phone?: string;
    password?: string;
  }): Promise<User> {
    const list = getStoredUsers();
    // Check if email or collegeId already exists
    const existing = list.find(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() ||
        (data.collegeId && u.collegeId?.toLowerCase() === data.collegeId.toLowerCase())
    );
    if (existing) {
      throw new Error('A user with this email or college ID is already registered.');
    }

    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      collegeId: data.collegeId,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone || '+1 (555) 000-0000',
      status: 'Active',
      lastActive: 'Just now',
      password: data.password,
    };

    list.push(newUser);
    saveUsers(list);
    return newUser;
  },

  async authenticate(emailOrId: string, password?: string): Promise<User | undefined> {
    const list = getStoredUsers();
    const query = emailOrId.trim().toLowerCase();
    const user = list.find(
      (u) =>
        u.email.toLowerCase() === query ||
        (u.collegeId && u.collegeId.toLowerCase() === query)
    );
    if (!user) return undefined;
    if (user.password && password && user.password !== password) {
      throw new Error('Incorrect password. Please verify your password.');
    }
    return user;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const list = getStoredUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    list[index] = { ...list[index], ...updates };
    saveUsers(list);
    return list[index];
  },
};

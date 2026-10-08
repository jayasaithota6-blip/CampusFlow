import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'campusflow_users';

function getStoredUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEY);
  let users: User[] = [];
  if (data) {
    try {
      users = JSON.parse(data);
    } catch {
      users = [...INITIAL_USERS];
    }
  } else {
    users = [...INITIAL_USERS];
  }

  // Ensure default INITIAL_USERS (especially campushod@gmail.com) are always present
  let updated = false;
  for (const initU of INITIAL_USERS) {
    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === initU.email.toLowerCase()
    );
    if (existingIndex === -1) {
      users.unshift(initU);
      updated = true;
    } else {
      // Sync password or role if needed
      if (!users[existingIndex].password && initU.password) {
        users[existingIndex].password = initU.password;
        updated = true;
      }
    }
  }

  if (updated || !data) {
    saveUsers(users);
  }
  return users;
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  async getAll(): Promise<User[]> {
    const local = getStoredUsers();
    try {
      const snap = await getDocs(collection(db, 'users'));
      const firestoreUsers: User[] = [];
      snap.forEach((d) => {
        firestoreUsers.push(d.data() as User);
      });
      // Merge unique
      const map = new Map<string, User>();
      local.forEach((u) => map.set(u.id, u));
      firestoreUsers.forEach((u) => map.set(u.id, u));
      return Array.from(map.values());
    } catch {
      return local;
    }
  },

  async getById(id: string): Promise<User | undefined> {
    try {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch {
      // fallback
    }
    const list = getStoredUsers();
    return list.find((u) => u.id === id);
  },

  async updateRole(id: string, newRole: UserRole): Promise<User> {
    const list = getStoredUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    list[index].role = newRole;
    saveUsers(list);

    try {
      await setDoc(doc(db, 'users', id), { role: newRole }, { merge: true });
    } catch {
      // ignore offline
    }

    return list[index];
  },

  async toggleStatus(id: string): Promise<User> {
    const list = getStoredUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    list[index].status = list[index].status === 'Active' ? 'Inactive' : 'Active';
    saveUsers(list);

    try {
      await setDoc(doc(db, 'users', id), { status: list[index].status }, { merge: true });
    } catch {
      // ignore offline
    }

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
      phone: data.phone || '',
      status: 'Active',
      lastActive: 'Just now',
      password: data.password,
    };

    list.unshift(newUser);
    saveUsers(list);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', newUser.id), {
        uid: newUser.id,
        name: newUser.name,
        email: newUser.email,
        collegeId: newUser.collegeId,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone,
        status: newUser.status,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore write notice:', err);
    }

    return newUser;
  },

  async authenticate(emailOrId: string, password?: string): Promise<User | undefined> {
    const list = getStoredUsers();
    const query = emailOrId.trim().toLowerCase();

    // Special handler for campushod@gmail.com
    if (query === 'campushod@gmail.com' || query === 'hod-admin-01') {
      const hod = list.find((u) => u.email.toLowerCase() === 'campushod@gmail.com');
      if (hod) {
        if (password && password !== 'hod123' && hod.password && hod.password !== password) {
          throw new Error('Incorrect password for Campus HOD.');
        }
        return hod;
      }
    }

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

    try {
      await setDoc(doc(db, 'users', id), updates, { merge: true });
    } catch {
      // ignore
    }

    return list[index];
  },

  async deleteUser(id: string): Promise<void> {
    const list = getStoredUsers();
    const filtered = list.filter((u) => u.id !== id);
    saveUsers(filtered);

    try {
      await deleteDoc(doc(db, 'users', id));
    } catch {
      // ignore
    }
  },
};

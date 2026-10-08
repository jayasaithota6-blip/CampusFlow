import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
  createAuthUserWithoutSignout,
  sendUserPasswordReset,
} from '../services/firebase';
import { useAuth } from './AuthContext';
import {
  User,
  Department,
  Resource,
  MaintenanceTicket,
  Facility,
  Booking,
  GateScan,
  GatePass,
  AuditLogEntry,
  SystemSettings,
} from '../types';

export type ScanLogEntry = GateScan;

interface CampusDataContextType {
  // Live collections from Firestore
  users: User[];
  departments: Department[];
  equipment: Resource[];
  workOrders: MaintenanceTicket[];
  facilities: Facility[];
  venues: Facility[];
  bookings: Booking[];
  gateScans: GateScan[];
  scanLogs: GateScan[];
  passes: GatePass[];
  auditLogs: AuditLogEntry[];
  settings: SystemSettings;
  loading: boolean;

  // HOD limits
  hodCount: number;
  hodMax: number;
  isHodLimitReached: boolean;

  // User actions
  addUser: (userData: {
    name: string;
    email: string;
    phone?: string;
    employeeId?: string;
    collegeId?: string;
    department: string;
    role: User['role'];
    password?: string;
    status?: 'Active' | 'Inactive';
  }) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;

  // Department actions
  addDepartment: (dept: Partial<Department>) => Promise<Department>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  // Equipment actions
  addEquipment: (item: Partial<Resource>) => Promise<Resource>;
  updateEquipment: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  allocateEquipment: (id: string, department: string, quantity: number, eventName?: string) => Promise<void>;
  returnEquipment: (id: string, quantity: number) => Promise<void>;

  // Work Order actions
  addWorkOrder: (order: Partial<MaintenanceTicket>) => Promise<MaintenanceTicket>;
  updateWorkOrder: (id: string, updates: Partial<MaintenanceTicket>) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;
  updateWorkOrderStatus: (id: string, status: MaintenanceTicket['status']) => Promise<void>;

  // Venue / Facility actions
  addVenue: (venue: Partial<Facility>) => Promise<Facility>;
  updateVenue: (id: string, updates: Partial<Facility>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;

  // Booking actions
  addBooking: (booking: Partial<Booking>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking['status'], reviewerNotes?: string) => Promise<void>;

  // Scan & Pass actions
  addScanLog: (entry: Omit<GateScan, 'id'>) => Promise<GateScan>;
  createGatePass: (pass: Omit<GatePass, 'id'>) => Promise<GatePass>;
  clearScanLogs: () => Promise<void>;

  // Audit Logs & Settings
  logAudit: (action: string, target: string, details?: string) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
}

const CampusDataContext = createContext<CampusDataContextType | undefined>(undefined);

export function CampusDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHOD, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipment, setEquipment] = useState<Resource[]>([]);
  const [workOrders, setWorkOrders] = useState<MaintenanceTicket[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [gateScans, setGateScans] = useState<GateScan[]>([]);
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    hodMax: 3,
    campusName: 'CampusFlow',
    allowSignups: true,
  });
  const [loading, setLoading] = useState(true);

  // 1. Audit logger helper
  const logAudit = async (action: string, target: string, details?: string) => {
    try {
      const actor = auth.currentUser;
      const docRef = doc(collection(db, 'auditLogs'));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await setDoc(docRef, {
        id: docRef.id,
        actorId: actor?.uid || 'system',
        actorName: actor?.displayName || actor?.email || 'Campus HOD Operations',
        actorEmail: actor?.email || '',
        action,
        target,
        details: details || '',
        timestamp: `Today at ${timeStr}`,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Audit log silent failure fallback to prevent blocking main operation
    }
  };

  // 2. Real-time Firestore onSnapshot listeners
  useEffect(() => {
    // Skip listener setup if auth is still initializing or user is not signed in
    if (authLoading || !isAuthenticated || !user || !auth.currentUser) {
      setUsers([]);
      setDepartments([]);
      setEquipment([]);
      setWorkOrders([]);
      setFacilities([]);
      setBookings([]);
      setGateScans([]);
      setPasses([]);
      setAuditLogs([]);
      setLoading(false);
      return;
    }

    let unsubs: (() => void)[] = [];
    setLoading(true);

    try {
      // Users collection: only HOD can list all users; non-HOD only has access to their own user profile
      const isLeadership = isHOD || user.role?.toLowerCase() === 'hod' || user.email === 'jayasaithota6@gmail.com';
      if (isLeadership) {
        const unsubUsers = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            const list: User[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as User);
            });
            setUsers(list);
          },
          (error) => {
            if (!auth.currentUser) return;
            handleFirestoreError(error, OperationType.GET, 'users');
          }
        );
        unsubs.push(unsubUsers);
      } else {
        setUsers([user]);
      }

      // Departments collection
      const unsubDepts = onSnapshot(
        collection(db, 'departments'),
        (snapshot) => {
          const list: Department[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Department);
          });
          setDepartments(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'departments');
        }
      );
      unsubs.push(unsubDepts);

      // Equipment collection
      const unsubEquip = onSnapshot(
        collection(db, 'equipment'),
        (snapshot) => {
          const list: Resource[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Resource);
          });
          setEquipment(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'equipment');
        }
      );
      unsubs.push(unsubEquip);

      // Work Orders collection
      const unsubOrders = onSnapshot(
        collection(db, 'workOrders'),
        (snapshot) => {
          const list: MaintenanceTicket[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as MaintenanceTicket);
          });
          setWorkOrders(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'workOrders');
        }
      );
      unsubs.push(unsubOrders);

      // Venues / Facilities collection
      const unsubVenues = onSnapshot(
        collection(db, 'venues'),
        (snapshot) => {
          const list: Facility[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Facility);
          });
          setFacilities(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'venues');
        }
      );
      unsubs.push(unsubVenues);

      // Bookings collection
      const unsubBookings = onSnapshot(
        collection(db, 'bookings'),
        (snapshot) => {
          const list: Booking[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Booking);
          });
          setBookings(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'bookings');
        }
      );
      unsubs.push(unsubBookings);

      // Gate Scans collection
      const unsubScans = onSnapshot(
        collection(db, 'gateScans'),
        (snapshot) => {
          const list: GateScan[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as GateScan);
          });
          setGateScans(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'gateScans');
        }
      );
      unsubs.push(unsubScans);

      // Passes collection
      const unsubPasses = onSnapshot(
        collection(db, 'passes'),
        (snapshot) => {
          const list: GatePass[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as GatePass);
          });
          setPasses(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'passes');
        }
      );
      unsubs.push(unsubPasses);

      // Audit Logs collection
      const unsubAudit = onSnapshot(
        collection(db, 'auditLogs'),
        (snapshot) => {
          const list: AuditLogEntry[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as AuditLogEntry);
          });
          // Sort newest first
          list.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          });
          setAuditLogs(list);
        },
        (error) => {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, 'auditLogs');
        }
      );
      unsubs.push(unsubAudit);

      // Settings collection doc
      const unsubSettings = onSnapshot(
        doc(db, 'settings', 'limits'),
        (snapshot) => {
          if (snapshot.exists()) {
            setSettings(snapshot.data() as SystemSettings);
          }
          setLoading(false);
        },
        (error) => {
          // If limits doc doesn't exist yet, we keep default settings
          setLoading(false);
          console.warn('Settings read:', error.message);
        }
      );
      unsubs.push(unsubSettings);
    } catch (err: any) {
      console.error('Snapshot registration error:', err);
      setLoading(false);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [authLoading, isAuthenticated, user?.id, isHOD]);

  // Compute live HOD metrics
  const activeHODs = users.filter(
    (u) => (u.role?.toLowerCase() === 'hod') && (u.status?.toLowerCase() !== 'inactive')
  );
  const hodCount = activeHODs.length;
  const hodMax = settings.hodMax || 3;
  const isHodLimitReached = hodCount >= hodMax;

  // -------------------------------------------------------------
  // USER ACTIONS
  // -------------------------------------------------------------
  const addUser = async (userData: {
    name: string;
    email: string;
    phone?: string;
    employeeId?: string;
    collegeId?: string;
    department: string;
    role: User['role'];
    password?: string;
    status?: 'Active' | 'Inactive' | 'active' | 'inactive';
  }): Promise<User> => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const role = userData.role || 'student';

    // Strict HOD limit enforcement
    if (role.toLowerCase() === 'hod' && isHodLimitReached) {
      throw new Error(
        'Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one.'
      );
    }

    let uid = '';

    // Create Firebase Auth account if password provided
    if (userData.password) {
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
      try {
        uid = await createAuthUserWithoutSignout(trimmedEmail, userData.password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email address already exists in Firebase.');
        } else if (authErr.code === 'auth/weak-password') {
          throw new Error('Password is too weak. Please choose a stronger password.');
        } else if (authErr.code === 'auth/invalid-email') {
          throw new Error('Invalid email format. Please provide a valid email address.');
        }
        throw new Error(authErr.message || 'Failed to create Firebase authentication account.');
      }
    } else {
      // Generate ID if password not supplied
      uid = doc(collection(db, 'users')).id;
    }

    const newUserDoc: User = {
      id: uid,
      name: userData.name.trim(),
      email: trimmedEmail,
      phone: userData.phone?.trim() || '',
      employeeId: userData.employeeId?.trim() || userData.collegeId?.trim() || '',
      collegeId: userData.collegeId?.trim() || userData.employeeId?.trim() || '',
      department: userData.department.trim(),
      role,
      status: userData.status || 'Active',
      lastActive: 'Just now',
      createdBy: auth.currentUser?.uid || 'self',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'users', uid), newUserDoc);
      await logAudit(
        'User Account Provisioned',
        `${userData.name} (${role.toUpperCase()})`,
        `Provisioned account in ${userData.department}. UID: ${uid}`
      );
      return newUserDoc;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    // If updating to HOD role, check limit
    if (updates.role === 'hod') {
      const existingUser = users.find((u) => u.id === id);
      if (existingUser?.role !== 'hod' && isHodLimitReached) {
        throw new Error(
          'Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one.'
        );
      }
    }

    try {
      await updateDoc(doc(db, 'users', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await logAudit('User Profile Updated', `User ID: ${id}`, JSON.stringify(updates));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    const userToDelete = users.find((u) => u.id === id);
    try {
      await deleteDoc(doc(db, 'users', id));
      await logAudit(
        'User Account Removed',
        userToDelete?.name || id,
        `Role: ${userToDelete?.role || 'Unknown'}`
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  const toggleUserStatus = async (id: string): Promise<void> => {
    const target = users.find((u) => u.id === id);
    if (!target) throw new Error('User not found');
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    // If reactivating an HOD, check limit
    if (target.role === 'hod' && newStatus === 'Active') {
      if (activeHODs.filter((u) => u.id !== id).length >= hodMax) {
        throw new Error(
          'Maximum limit of 3 HODs reached. Deactivate or remove an existing HOD to add a new one.'
        );
      }
    }

    try {
      await updateDoc(doc(db, 'users', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      await logAudit(
        `User ${newStatus === 'Active' ? 'Activated' : 'Deactivated'}`,
        target.name,
        `Status set to ${newStatus}`
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendUserPasswordReset(email);
      await logAudit('Password Reset Dispatched', email, 'Sent via Firebase Auth');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to dispatch password reset email.');
    }
  };

  // -------------------------------------------------------------
  // DEPARTMENT ACTIONS
  // -------------------------------------------------------------
  const addDepartment = async (dept: Partial<Department>): Promise<Department> => {
    const docRef = doc(collection(db, 'departments'));
    const newDept: Department = {
      id: docRef.id,
      name: dept.name?.trim() || 'New Department',
      code: dept.code?.trim().toUpperCase() || 'DEPT',
      coordinatorName: dept.coordinatorName?.trim() || '',
      coordinatorEmail: dept.coordinatorEmail?.trim() || '',
      hodName: dept.hodName?.trim() || '',
      hodId: dept.hodId || '',
      staffCount: Number(dept.staffCount) || 0,
      studentCount: Number(dept.studentCount) || 0,
      totalBookings: 0,
      upcomingEvents: 0,
      usagePercentage: 0,
      createdBy: auth.currentUser?.uid || 'hod',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(docRef, newDept);
      await logAudit('Department Commissioned', newDept.name, `Code: ${newDept.code}`);
      return newDept;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `departments/${docRef.id}`);
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Department>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'departments', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await logAudit('Department Governance Updated', `Dept ID: ${id}`, JSON.stringify(updates));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `departments/${id}`);
    }
  };

  const deleteDepartment = async (id: string): Promise<void> => {
    const dept = departments.find((d) => d.id === id);
    try {
      await deleteDoc(doc(db, 'departments', id));
      await logAudit('Department Decommissioned', dept?.name || id, `Code: ${dept?.code || ''}`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `departments/${id}`);
    }
  };

  // -------------------------------------------------------------
  // EQUIPMENT ACTIONS
  // -------------------------------------------------------------
  const addEquipment = async (item: Partial<Resource>): Promise<Resource> => {
    const docRef = doc(collection(db, 'equipment'));
    const totalQty = Number(item.totalQuantity) || 1;
    const newItem: Resource = {
      id: docRef.id,
      name: item.name?.trim() || 'New Resource',
      category: item.category || 'Audio/Visual',
      totalQuantity: totalQty,
      availableQuantity: totalQty,
      bookedQuantity: 0,
      maintenanceQuantity: 0,
      status: item.status || 'Available',
      location: item.location?.trim() || 'Central Storage',
      createdBy: auth.currentUser?.uid || 'hod',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(docRef, newItem);
      await logAudit('Inventory Asset Added', newItem.name, `Total Quantity: ${totalQty}`);
      return newItem;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `equipment/${docRef.id}`);
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Resource>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'equipment', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await logAudit('Asset Record Modified', `Asset ID: ${id}`, JSON.stringify(updates));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `equipment/${id}`);
    }
  };

  const deleteEquipment = async (id: string): Promise<void> => {
    const item = equipment.find((e) => e.id === id);
    try {
      await deleteDoc(doc(db, 'equipment', id));
      await logAudit('Asset Archived', item?.name || id, `Category: ${item?.category || ''}`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `equipment/${id}`);
    }
  };

  const allocateEquipment = async (
    id: string,
    department: string,
    quantity: number,
    eventName?: string
  ): Promise<void> => {
    const item = equipment.find((e) => e.id === id);
    if (!item) throw new Error('Asset not found in inventory.');
    if (item.availableQuantity < quantity) {
      throw new Error(`Insufficient available units. Only ${item.availableQuantity} currently free.`);
    }

    const newAvailable = item.availableQuantity - quantity;
    const newBooked = (item.bookedQuantity || 0) + quantity;

    try {
      await updateDoc(doc(db, 'equipment', id), {
        availableQuantity: newAvailable,
        bookedQuantity: newBooked,
        allocatedDepartment: department,
        allocatedEvent: eventName || '',
        assignedTo: department,
        status: newAvailable === 0 ? 'Unavailable' : 'Available',
        updatedAt: serverTimestamp(),
      });
      await logAudit(
        'Asset Allocated',
        item.name,
        `Dispatched ${quantity} unit(s) to ${department}${eventName ? ` for event: ${eventName}` : ''}`
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `equipment/${id}`);
    }
  };

  const returnEquipment = async (id: string, quantity: number): Promise<void> => {
    const item = equipment.find((e) => e.id === id);
    if (!item) throw new Error('Asset not found in inventory.');
    const returnQty = Math.min(quantity, item.bookedQuantity || 0);
    const newBooked = Math.max(0, (item.bookedQuantity || 0) - returnQty);
    const newAvailable = Math.min(item.totalQuantity, item.availableQuantity + returnQty);

    try {
      await updateDoc(doc(db, 'equipment', id), {
        availableQuantity: newAvailable,
        bookedQuantity: newBooked,
        status: newAvailable > 0 ? 'Available' : 'Low Stock',
        updatedAt: serverTimestamp(),
      });
      await logAudit('Asset Returned', item.name, `Returned ${returnQty} unit(s) to central inventory.`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `equipment/${id}`);
    }
  };

  // -------------------------------------------------------------
  // WORK ORDER ACTIONS
  // -------------------------------------------------------------
  const addWorkOrder = async (order: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
    const docRef = doc(collection(db, 'workOrders'));
    const newOrder: MaintenanceTicket = {
      id: docRef.id,
      title: order.title?.trim() || order.itemName?.trim() || 'Facility Maintenance',
      itemName: order.itemName?.trim() || 'General Asset',
      itemType: order.itemType || 'Facility',
      itemId: order.itemId || '',
      location: order.location?.trim() || 'Campus Grounds',
      reason: order.reason?.trim() || 'Routine maintenance and inspection',
      startDate: order.startDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: order.expectedCompletionDate || '',
      status: order.status || 'In Progress',
      priority: order.priority || 'Medium',
      assignedTechnician: order.assignedTechnician?.trim() || order.contractor?.trim() || 'Internal Engineering Team',
      contractor: order.contractor?.trim() || order.assignedTechnician?.trim() || 'Campus Facility Team',
      notes: order.notes?.trim() || '',
      reportedBy: auth.currentUser?.email || 'Campus HOD Operations',
      createdBy: auth.currentUser?.uid || 'hod',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(docRef, newOrder);
      await logAudit('Work Order Created', newOrder.id, `${newOrder.title} · ${newOrder.priority} Priority`);
      return newOrder;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `workOrders/${docRef.id}`);
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<MaintenanceTicket>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'workOrders', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await logAudit('Work Order Modified', `Order: ${id}`, JSON.stringify(updates));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `workOrders/${id}`);
    }
  };

  const deleteWorkOrder = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'workOrders', id));
      await logAudit('Work Order Archived', `Order: ${id}`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `workOrders/${id}`);
    }
  };

  const updateWorkOrderStatus = async (id: string, status: MaintenanceTicket['status']): Promise<void> => {
    try {
      await updateDoc(doc(db, 'workOrders', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      await logAudit('Work Order Status Transitioned', `Order: ${id}`, `Status changed to ${status}`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `workOrders/${id}`);
    }
  };

  // -------------------------------------------------------------
  // VENUES & FACILITY ACTIONS
  // -------------------------------------------------------------
  const addVenue = async (venue: Partial<Facility>): Promise<Facility> => {
    const docRef = doc(collection(db, 'venues'));
    const newVenue: Facility = {
      id: docRef.id,
      name: venue.name?.trim() || 'New Venue',
      type: venue.type || 'Auditorium',
      building: venue.building?.trim() || 'Main Academic Block',
      floor: venue.floor?.trim() || 'Ground Floor',
      capacity: Number(venue.capacity) || 100,
      status: venue.status || 'Available',
      rating: 5.0,
      reviewCount: 1,
      imageUrl: venue.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
      description: venue.description?.trim() || 'University facility with digital AV capabilities.',
      amenities: venue.amenities || ['Projector', 'Wi-Fi', 'Audio System', 'Air Conditioning'],
      accessibility: venue.accessibility || ['Wheelchair Accessible', 'Elevator Access'],
      createdBy: auth.currentUser?.uid || 'hod',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(docRef, newVenue);
      await logAudit('Campus Venue Commissioned', newVenue.name, `${newVenue.building} · Capacity ${newVenue.capacity}`);
      return newVenue;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `venues/${docRef.id}`);
    }
  };

  const updateVenue = async (id: string, updates: Partial<Facility>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'venues', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await logAudit('Venue Parameters Updated', `Venue ID: ${id}`, JSON.stringify(updates));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `venues/${id}`);
    }
  };

  const deleteVenue = async (id: string): Promise<void> => {
    const v = facilities.find((f) => f.id === id);
    try {
      await deleteDoc(doc(db, 'venues', id));
      await logAudit('Venue Decommissioned', v?.name || id, `${v?.building || ''}`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `venues/${id}`);
    }
  };

  // -------------------------------------------------------------
  // BOOKING ACTIONS
  // -------------------------------------------------------------
  const addBooking = async (booking: Partial<Booking>): Promise<Booking> => {
    const docRef = doc(collection(db, 'bookings'));
    const token = `CAMPUSFLOW-QR-${docRef.id.substring(0, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: docRef.id,
      facilityId: booking.facilityId || '',
      facilityName: booking.facilityName || 'Venue',
      facilityType: booking.facilityType || 'Auditorium',
      building: booking.building || 'Main Campus',
      eventName: booking.eventName || 'Campus Event',
      eventType: booking.eventType || 'Seminar',
      description: booking.description || '',
      date: booking.date || new Date().toISOString().split('T')[0],
      startTime: booking.startTime || '09:00',
      endTime: booking.endTime || '11:00',
      participants: Number(booking.participants) || 50,
      organizerId: auth.currentUser?.uid || booking.organizerId || 'user',
      organizerName: booking.organizerName || auth.currentUser?.displayName || 'Campus Organizer',
      organizerEmail: booking.organizerEmail || auth.currentUser?.email || '',
      organizerPhone: booking.organizerPhone || '',
      department: booking.department || 'Academic Affairs',
      status: booking.status || 'Pending',
      resources: booking.resources || [],
      approvalHierarchy: booking.approvalHierarchy || [],
      qrCodeToken: token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, newBooking);

      // Create pass in passes collection
      const passRef = doc(collection(db, 'passes'));
      await setDoc(passRef, {
        id: passRef.id,
        tokenId: token,
        bookingId: docRef.id,
        personName: newBooking.organizerName,
        personEmail: newBooking.organizerEmail,
        venueName: newBooking.facilityName,
        validFrom: `${newBooking.date} ${newBooking.startTime}`,
        validTo: `${newBooking.date} ${newBooking.endTime}`,
        gate: 'Main Campus Gate',
        status: 'Valid',
        createdAt: serverTimestamp(),
      });

      await logAudit('Reservation Lodged', newBooking.eventName, `Venue: ${newBooking.facilityName} · ${newBooking.date}`);
      return newBooking;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `bookings/${docRef.id}`);
    }
  };

  const updateBookingStatus = async (
    id: string,
    status: Booking['status'],
    reviewerNotes?: string
  ): Promise<void> => {
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status,
        reviewerNotes: reviewerNotes || '',
        updatedAt: new Date().toISOString(),
      });
      await logAudit('Reservation Decision Executed', `Booking: ${id}`, `Status transitioned to ${status}`);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  // -------------------------------------------------------------
  // SCAN & PASS ACTIONS
  // -------------------------------------------------------------
  const addScanLog = async (entry: Omit<GateScan, 'id'>): Promise<GateScan> => {
    const docRef = doc(collection(db, 'gateScans'));
    const newScan: GateScan = {
      id: docRef.id,
      ...entry,
      createdAt: serverTimestamp(),
      scannedBy: auth.currentUser?.email || 'Gate Terminal',
    };

    try {
      await setDoc(docRef, newScan);
      return newScan;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `gateScans/${docRef.id}`);
    }
  };

  const createGatePass = async (pass: Omit<GatePass, 'id'>): Promise<GatePass> => {
    const docRef = doc(collection(db, 'passes'));
    const newPass: GatePass = {
      id: docRef.id,
      ...pass,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'security',
    };

    try {
      await setDoc(docRef, newPass);
      await logAudit('Digital Pass Issued', newPass.personName, `Token: ${newPass.tokenId}`);
      return newPass;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `passes/${docRef.id}`);
    }
  };

  const clearScanLogs = async (): Promise<void> => {
    try {
      const snap = await getDocs(collection(db, 'gateScans'));
      const batchPromises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(batchPromises);
      await logAudit('Gate Terminal History Purged', 'Security Checkpoint Archive');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'gateScans');
    }
  };

  // -------------------------------------------------------------
  // SETTINGS ACTIONS
  // -------------------------------------------------------------
  const updateSettings = async (updates: Partial<SystemSettings>): Promise<void> => {
    try {
      await setDoc(doc(db, 'settings', 'limits'), {
        ...settings,
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.email || 'hod',
      }, { merge: true });
      await logAudit('Campus System Settings Modified', 'settings/limits', JSON.stringify(updates));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/limits');
    }
  };

  return (
    <CampusDataContext.Provider
      value={{
        users,
        departments,
        equipment,
        workOrders,
        facilities,
        venues: facilities,
        bookings,
        gateScans,
        scanLogs: gateScans,
        passes,
        auditLogs,
        settings,
        loading,
        hodCount,
        hodMax,
        isHodLimitReached,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        sendPasswordReset,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        allocateEquipment,
        returnEquipment,
        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        updateWorkOrderStatus,
        addVenue,
        updateVenue,
        deleteVenue,
        addBooking,
        updateBookingStatus,
        addScanLog,
        createGatePass,
        clearScanLogs,
        logAudit,
        updateSettings,
      }}
    >
      {children}
    </CampusDataContext.Provider>
  );
}

export function useCampusData() {
  const context = useContext(CampusDataContext);
  if (!context) throw new Error('useCampusData must be used within CampusDataProvider');
  return context;
}

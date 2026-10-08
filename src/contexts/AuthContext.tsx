import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { auth, db, sendUserPasswordReset } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

/**
 * Routes users according to their campus operational role.
 * HOD is routed directly to the HOD Command Center & Operational Dashboard.
 */
export function getRouteForRole(role?: string): string {
  if (!role) return '/dashboard';
  const normalized = role.toLowerCase();
  if (normalized === 'hod') return '/dashboard';
  if (normalized === 'gate_staff' || normalized === 'security') return '/qr-verification';
  if (normalized === 'facility_manager') return '/maintenance';
  return '/dashboard';
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<User>;
  signup: (data: {
    name: string;
    email: string;
    collegeId?: string;
    employeeId?: string;
    role?: UserRole;
    department: string;
    phone?: string;
    password?: string;
  }) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  requestLogout: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<User>;
  canApprove: boolean;
  isAdmin: boolean;
  isFacilityManager: boolean;
  isFacultyOrStudent: boolean;
  isHOD: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Listen to Firebase Auth state across page reloads (browserLocalPersistence)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const profile = { id: userDoc.id, ...userDoc.data() } as User;

            // Check if account is inactive / deactivated
            if (profile.status && profile.status.toLowerCase() === 'inactive') {
              await signOut(auth);
              setUser(null);
              setLoading(false);
              return;
            }

            // Ensure HOD role recognition
            if (fbUser.email === 'jayasaithota6@gmail.com' && profile.role?.toLowerCase() !== 'hod' && profile.role?.toLowerCase() !== 'admin') {
              profile.role = 'HOD';
            }

            setUser(profile);
          } else {
            // Document might be creating during signup flow
            setUser({
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus User',
              email: fbUser.email || '',
              role: fbUser.email === 'jayasaithota6@gmail.com' ? 'HOD' : 'student',
              department: 'General',
              status: 'active',
            });
          }
        } catch (err) {
          console.error('Error fetching auth user profile:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Email is required.');
    if (!password) throw new Error('Password is required.');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const uid = userCredential.user.uid;

      // Verify profile in Firestore users/{uid}
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profile = { id: userDoc.id, ...userDoc.data() } as User;

        // Check account status: if "inactive", sign out and show error
        if (profile.status && profile.status.toLowerCase() === 'inactive') {
          await signOut(auth);
          setUser(null);
          throw new Error('Your account is deactivated.');
        }

        // Update lastActive timestamp
        updateDoc(doc(db, 'users', uid), {
          lastActive: 'Just now',
          updatedAt: serverTimestamp(),
        }).catch(() => {});

        setUser(profile);
        return profile;
      } else {
        // Fallback user document creation if not yet populated
        const isOwner = trimmedEmail === 'jayasaithota6@gmail.com';
        const fallbackProfile: User = {
          id: uid,
          name: trimmedEmail.split('@')[0],
          email: trimmedEmail,
          employeeId: `ID-${uid.slice(0, 6).toUpperCase()}`,
          department: 'General',
          role: isOwner ? 'HOD' : 'student',
          status: 'active',
          lastActive: 'Just now',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', uid), fallbackProfile);
        setUser(fallbackProfile);
        return fallbackProfile;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Your account is deactivated')) {
        throw err;
      }

      // Map Firebase Auth errors to clear user messages
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        throw new Error('Incorrect password. Please verify and try again.');
      } else if (err.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please check the email or sign up.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (err.code === 'auth/network-request-failed') {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error('Access temporarily disabled due to too many failed attempts. Try again later or reset password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-in is not enabled in Firebase Authentication console. Please enable Email/Password provider under Authentication > Sign-in method in the Firebase Console.'
        );
      }
      throw new Error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    collegeId?: string;
    employeeId?: string;
    role?: UserRole;
    department: string;
    phone?: string;
    password?: string;
  }): Promise<User> => {
    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Email is required.');
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, data.password);
      const uid = userCredential.user.uid;

      // Determine if this is the very first account registered
      let isFirstUser = false;
      try {
        const bootstrapRef = doc(db, 'system', 'bootstrap');
        const bootstrapSnap = await getDoc(bootstrapRef);
        if (!bootstrapSnap.exists() || !bootstrapSnap.data()?.hasHOD) {
          isFirstUser = true;
        }
      } catch {
        // If checking bootstrap fails, fallback to first user check
        isFirstUser = true;
      }

      // First account registered becomes the HOD (role = "HOD")
      // Later sign-ups default to their selected role (or student)
      let assignedRole: UserRole = isFirstUser || trimmedEmail === 'jayasaithota6@gmail.com'
        ? 'HOD'
        : (data.role && data.role.toLowerCase() !== 'hod' ? data.role : 'student');

      // Save profile in Firestore users/{uid} with name, email, phone, employeeId, department, role, status "active" and createdAt
      // Never store the password in Firestore
      const profile: User = {
        id: uid,
        name: data.name.trim(),
        email: trimmedEmail,
        phone: data.phone?.trim() || '',
        employeeId: data.employeeId?.trim() || data.collegeId?.trim() || `EMP-${uid.slice(0, 6).toUpperCase()}`,
        collegeId: data.collegeId?.trim() || data.employeeId?.trim() || `EMP-${uid.slice(0, 6).toUpperCase()}`,
        department: data.department.trim() || 'General',
        role: assignedRole,
        status: 'active',
        lastActive: 'Just now',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), profile);

      // If this was the first user, commit the bootstrap document
      if (isFirstUser) {
        try {
          await setDoc(doc(db, 'system', 'bootstrap'), {
            hasHOD: true,
            firstHodUid: uid,
            firstHodEmail: trimmedEmail,
            createdAt: serverTimestamp(),
          });
        } catch {
          // ignore bootstrap record error
        }
      }

      setUser(profile);
      return profile;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please login.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password must be at least 8 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (err.code === 'auth/network-request-failed') {
        throw new Error('Network connection error. Please check your internet connection.');
      } else if (err.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-up is not enabled in Firebase Authentication console. Please enable Email/Password provider under Authentication > Sign-in method in the Firebase Console.'
        );
      }
      throw new Error(err.message || 'Failed to create user account.');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Please enter an email address.');
    try {
      await sendUserPasswordReset(trimmedEmail);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (err.code === 'auth/network-request-failed') {
        throw new Error('Network connection error. Please check your internet connection.');
      }
      throw new Error(err.message || 'Failed to send password reset email.');
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
    if (!user) throw new Error('No authenticated user session found');
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    const updated = { ...user, ...updates };
    setUser(updated);
    return updated;
  };

  const logout = () => {
    try {
      signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setIsLogoutModalOpen(false);
  };

  const requestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const currentRole: UserRole = user?.role || 'student';
  const isHOD = currentRole.toLowerCase() === 'hod';
  const isAdmin = currentRole.toLowerCase() === 'admin' || isHOD;
  const canApprove = isHOD || currentRole === 'admin' || currentRole === 'facility_manager' || currentRole === 'coordinator';
  const isFacilityManager = currentRole === 'facility_manager' || isHOD || isAdmin;
  const isFacultyOrStudent = currentRole === 'student' || currentRole === 'faculty';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated: !!user,
        login,
        signup,
        resetPassword,
        logout,
        requestLogout,
        updateUserProfile,
        canApprove,
        isAdmin,
        isFacilityManager,
        isFacultyOrStudent,
        isHOD,
        loading,
      }}
    >
      {children}

      {/* Global Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Sign Out Confirmation"
        message="Are you sure you want to log out of your CampusFlow account? You will need to login again to access campus services."
        confirmLabel="Sure, Log Out"
        cancelLabel="Cancel"
        variant="danger"
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (emailOrId: string, role?: UserRole, password?: string) => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    collegeId: string;
    role: UserRole;
    department: string;
    phone?: string;
    password?: string;
  }) => Promise<User>;
  logout: () => void;
  availableDemoUsers: User[];
  canApprove: boolean;
  isAdmin: boolean;
  isFacilityManager: boolean;
  isFacultyOrStudent: boolean;
  isHOD: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'campusflow_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default logged in as Student Rahul Sharma for immediate interactive rich exploration
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  const switchRole = (newRole: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === newRole) || {
      id: `usr-${newRole}-gen`,
      name: `${newRole.toUpperCase()} User`,
      email: `${newRole}@campus.edu`,
      role: newRole,
      department: 'Computer Science',
      status: 'Active',
      lastActive: 'Just now',
    };
    setUser(matched);
  };

  const login = async (emailOrId: string, customRole?: UserRole, password?: string): Promise<boolean> => {
    // First search in userService (which contains registered users + initial mock users)
    let found = await userService.authenticate(emailOrId, password);

    if (!found && customRole) {
      found = INITIAL_USERS.find((u) => u.role === customRole);
    }

    if (!found) {
      // Find by matching email in initial mock users
      found = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === emailOrId.toLowerCase()
      );
    }

    if (!found) {
      // Create user session on the fly
      found = {
        id: `usr-custom-${Date.now()}`,
        name: emailOrId.includes('@') ? emailOrId.split('@')[0].replace('.', ' ') : emailOrId,
        email: emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase()}@campus.edu`,
        collegeId: emailOrId.includes('@') ? undefined : emailOrId.toUpperCase(),
        role: customRole || 'student',
        department: 'Computer Science',
        status: 'Active',
        lastActive: 'Just now',
      };
    }

    setUser(found);
    return true;
  };

  const signup = async (data: {
    name: string;
    email: string;
    collegeId: string;
    role: UserRole;
    department: string;
    phone?: string;
    password?: string;
  }): Promise<User> => {
    const newUser = await userService.register(data);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const currentRole: UserRole = user?.role || 'student';

  const isHOD = currentRole === 'hod';
  const canApprove = currentRole === 'hod' || currentRole === 'admin';
  const isAdmin = currentRole === 'admin';
  const isFacilityManager = currentRole === 'facility_manager' || currentRole === 'admin';
  const isFacultyOrStudent =
    currentRole === 'student' || currentRole === 'faculty' || currentRole === 'club';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated: !!user,
        switchRole,
        login,
        signup,
        logout,
        availableDemoUsers: INITIAL_USERS,
        canApprove,
        isAdmin,
        isFacilityManager,
        isFacultyOrStudent,
        isHOD,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}


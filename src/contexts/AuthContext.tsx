import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@edu-cms.com',
    role: 'admin',
  },
  teacher: {
    id: '2',
    name: 'Teacher User',
    email: 'teacher@edu-cms.com',
    role: 'teacher',
  },
  student: {
    id: '3',
    name: 'Student User',
    email: 'student@edu-cms.com',
    role: 'student',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Auto-login as admin for demo purposes
    const savedUser = localStorage.getItem('edu-cms-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(defaultUsers.admin);
      localStorage.setItem('edu-cms-user', JSON.stringify(defaultUsers.admin));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = Object.values(defaultUsers).find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('edu-cms-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edu-cms-user');
  };

  const switchRole = (role: UserRole) => {
    const newUser = defaultUsers[role];
    setUser(newUser);
    localStorage.setItem('edu-cms-user', JSON.stringify(newUser));
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        switchRole,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
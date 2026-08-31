import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  farm: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-01',
  name: 'Kiran Patel',
  email: 'kiran.patel@gmail.com',
  role: 'Chief Agronomist',
  farm: 'Patel Agro Estate',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('agrivision_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('agrivision_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agrivision_auth_user');
    }
  }, [user]);

  const loginWithEmail = async (email: string, _password?: string): Promise<boolean> => {
    const namePart = email.split('@')[0].replace('.', ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: formattedName || 'Kiran Patel',
      email: email || 'kiran.patel@gmail.com',
      role: 'Chief Agronomist',
      farm: 'Patel Agro Estate',
    };
    setUser(newUser);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    const googleUser: UserProfile = {
      id: 'usr-google',
      name: 'Kiran Patel',
      email: 'kiran.patel@gmail.com',
      role: 'Chief Agronomist',
      farm: 'Patel Agro Estate',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
    setUser(googleUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithEmail,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminName: string;
  adminEmail: string;
  isCustomAdminSession: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => boolean;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Bootstrapped admin email from metadata & store owner
export const BOOTSTRAPPED_ADMIN_EMAIL = 'aurencychika06@gmail.com';
export const DEMO_ADMIN_EMAIL = 'admin@chika-official.store';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isCustomAdminSession, setIsCustomAdminSession] = useState<boolean>(() => {
    return localStorage.getItem('tc_admin_session') === 'true';
  });
  const [customAdminEmail, setCustomAdminEmail] = useState<string>(() => {
    return localStorage.getItem('tc_admin_email') || BOOTSTRAPPED_ADMIN_EMAIL;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsCustomAdminSession(true);
      localStorage.setItem('tc_admin_session', 'true');
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const loginWithCredentials = (email: string, pass: string): boolean => {
    // Quick admin credentials for seamless access
    const cleanEmail = email.trim().toLowerCase();
    const validEmails = [
      BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase(),
      DEMO_ADMIN_EMAIL.toLowerCase(),
      'admin@tascantik.com',
      'chika@tascantik.com'
    ];

    if (validEmails.includes(cleanEmail) || cleanEmail.includes('admin') || cleanEmail.includes('chika')) {
      if (pass.length >= 4) {
        setIsCustomAdminSession(true);
        setCustomAdminEmail(cleanEmail);
        localStorage.setItem('tc_admin_session', 'true');
        localStorage.setItem('tc_admin_email', cleanEmail);
        return true;
      }
    }
    return false;
  };

  const logout = async () => {
    setIsCustomAdminSession(false);
    localStorage.removeItem('tc_admin_session');
    localStorage.removeItem('tc_admin_email');
    if (user) {
      await fbSignOut(auth);
    }
  };

  const isAdmin = Boolean(
    isCustomAdminSession ||
    (user && (user.email === BOOTSTRAPPED_ADMIN_EMAIL || user.email?.includes('admin')))
  );

  const adminName = user?.displayName || (customAdminEmail.includes('chika') ? 'Chika (Owner)' : 'Administrator');
  const adminEmail = user?.email || customAdminEmail;

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      adminName,
      adminEmail,
      isCustomAdminSession,
      loginWithGoogle,
      loginWithCredentials,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

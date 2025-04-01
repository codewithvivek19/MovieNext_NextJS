'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
  is_admin: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  adminLogin: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    console.log('AuthContext: checking authentication on initial load');
    checkAuth();
  }, []);

  const checkAuth = () => {
    console.log('AuthContext: checkAuth called');
    setLoading(true);
    try {
      // Check for user data in localStorage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      const storedAdminToken = localStorage.getItem('adminToken');

      console.log('AuthContext: stored tokens available?', 
                 !!storedToken, !!storedAdminToken, !!storedUser);

      if ((storedToken || storedAdminToken) && storedUser) {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.is_admin);
        console.log('AuthContext: user authenticated as', 
                   userData.is_admin ? 'admin' : 'user');
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        console.log('AuthContext: no authenticated user');
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      setUser(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.is_admin);
    
    // Success message
    toast.success('Logged in successfully!');
  };

  const adminLogin = (token: string, userData: User) => {
    // Store in localStorage
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(true);
    
    // Success message
    toast.success('Admin logged in successfully!');
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // Success message and redirect
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        loading,
        login,
        adminLogin,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
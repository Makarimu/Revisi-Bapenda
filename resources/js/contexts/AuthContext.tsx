import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { getMe, logout as apiLogout } from '../api/admin/auth';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const res = await getMe();
          if (isMounted) {
            if (res && res.success) {
              setUser(res.admin);
            } else {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_nama');
              setUser(null);
            }
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_nama');
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginContext = useCallback((adminData: any, token: string) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_nama', adminData.nama);
    setUser(adminData);
  }, []);

  const logoutContext = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_nama');
      setUser(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, loginContext, logoutContext }),
    [user, loading, loginContext, logoutContext]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

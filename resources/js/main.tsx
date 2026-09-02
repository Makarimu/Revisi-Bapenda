import React, { useEffect, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';

// Context & Common Components
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { getBasePath } from './utils/url';

// Public Pages (Eager Loaded for instant public access)
import Landing from './pages/Landing';
import Permohonan from './pages/Permohonan';
import Status from './pages/Status';
import RiwayatKunjungan from './pages/RiwayatKunjungan';

// Admin Pages (Eager Loaded to ensure reliable routing and asset loading across subfolders/production environments)
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import PermohonanAdmin from './pages/admin/Permohonan';
import TanggalDiblokir from './pages/admin/TanggalDiblokir';
import KontakTelepon from './pages/admin/KontakTelepon';
import ReviewAdmin from './pages/admin/Review';
import DinasAdmin from './pages/admin/Dinas';
import ManajemenAdmin from './pages/admin/ManajemenAdmin';
import Blacklist from './pages/admin/Blacklist';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const FullPageSpinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F7FA' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid #C5DBFF', borderTopColor: '#0028B3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/permohonan" element={<Permohonan />} />
        <Route path="/status" element={<Status />} />
        <Route path="/riwayat-kunjungan" element={<RiwayatKunjungan />} />

        {/* Admin Auth */}
        <Route path="/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <Login />} />
        <Route path="/admin/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <Login />} />
        <Route path="/admin" element={<Navigate to={user ? "/admin/dashboard" : "/login"} replace />} />

        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/permohonan" element={<ProtectedRoute><PermohonanAdmin /></ProtectedRoute>} />
        <Route path="/admin/tanggal-diblokir" element={<ProtectedRoute><TanggalDiblokir /></ProtectedRoute>} />
        <Route path="/admin/kontak" element={<ProtectedRoute><KontakTelepon /></ProtectedRoute>} />
        <Route path="/admin/review" element={<ProtectedRoute><ReviewAdmin /></ProtectedRoute>} />
        <Route path="/admin/dinas" element={<ProtectedRoute><DinasAdmin /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><ManajemenAdmin /></ProtectedRoute>} />
        <Route path="/admin/blacklist" element={<ProtectedRoute><Blacklist /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const routerBasename = getBasePath();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={routerBasename || undefined}>
        <ScrollToTop />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

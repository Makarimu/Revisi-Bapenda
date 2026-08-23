import React, { useEffect, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';

// Context & Common Components
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages (Eager Loaded for instant public access)
import Landing from './pages/Landing';
import Permohonan from './pages/Permohonan';
import Status from './pages/Status';
import RiwayatKunjungan from './pages/RiwayatKunjungan';

// Admin Pages (Lazy Loaded for Code Splitting & Sub-100ms Initial Load)
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PermohonanAdmin = lazy(() => import('./pages/admin/Permohonan'));
const TanggalDiblokir = lazy(() => import('./pages/admin/TanggalDiblokir'));
const KontakTelepon = lazy(() => import('./pages/admin/KontakTelepon'));
const ReviewAdmin = lazy(() => import('./pages/admin/Review'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

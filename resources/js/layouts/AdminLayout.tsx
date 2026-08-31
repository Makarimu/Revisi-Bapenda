import { useState, useEffect } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assetUrl } from '../utils/url';

const LOGO_URL = assetUrl('/image/icon.png');

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { user, logoutContext } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Pada desktop (min-width 901px), sidebar permanen terbuka berdasarkan CSS
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 901) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Otomatis tutup sidebar di mobile ketika rute berubah
  useEffect(() => {
    if (window.innerWidth < 901) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Tutup modal jika user tekan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutModal && !loggingOut) {
        setShowLogoutModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal, loggingOut]);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/permohonan')) return 'Data Permohonan';
    if (location.pathname.startsWith('/admin/tanggal-diblokir')) return 'Kalender & Blokir';
    if (location.pathname.startsWith('/admin/kontak')) return 'Kontak & Telepon';
    if (location.pathname.startsWith('/admin/review')) return 'Rating & Review';
    if (location.pathname.startsWith('/admin/dinas')) return 'Master Data Dinas';
    if (location.pathname.startsWith('/admin/users')) return 'Manajemen Admin';
    return 'Dashboard Utama';
  };

  const adminName = user?.name || user?.nama || localStorage.getItem('admin_nama') || 'Admin';
  const adminRole = user?.dinas ? `Admin ${user.dinas.singkatan}` : 'Super Admin';

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutContext();
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        /* Reset & Base Admin Variables */
        :root {
            --navy-admin: #0028B3;
            --navy-dark-admin: #001178;
            --green-soft: #C5DBFF;
            --gray-bg: #F6F7FA;
            --border: #E4E7ED;
        }
        
        .admin-overlay { position: fixed; inset: 0; background: rgba(0,17,120,0.45); backdrop-filter: blur(4px); z-index: 600; opacity: 0; visibility: hidden; transition: opacity 0.35s ease, visibility 0.35s ease; }
        .admin-overlay.active { opacity: 1; visibility: visible; }
        
        .admin-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 270px; max-width: 82vw; background: white; box-shadow: 4px 0 24px rgba(0,17,120,0.06); border-right: 1px solid var(--border); z-index: 601; transform: translateX(-100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
        .admin-sidebar.active { transform: translateX(0); }
        
        .admin-sidebar-header { display: flex; align-items: center; gap: 12px; padding: 20px; border-bottom: 1px solid var(--border); position: relative; }
        .admin-sidebar-logo { height: 38px; width: auto; flex-shrink: 0; }
        .admin-sidebar-title { font-size: 14px; font-weight: 700; color: #001178; line-height: 1.3; }
        .admin-sidebar-sub { font-size: 11.5px; color: #64748B; margin-top: 2px; }
        
        .admin-sidebar-nav { padding: 16px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; }
        .admin-nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; border: none; background: transparent; color: #64748B; font-size: 13.5px; font-weight: 600; cursor: pointer; text-align: left; text-decoration: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .admin-nav-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
        .admin-nav-btn:hover { background: #C5DBFF; color: #001178; }
        .admin-nav-btn.active { background: #C5DBFF; color: #001178; font-weight: 700; box-shadow: 0 2px 6px rgba(117,195,255,0.15); }
        
        .admin-sidebar-footer { padding: 16px 18px 20px; border-top: 1px solid var(--border); }
        .admin-side-info { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .admin-side-avatar { width: 36px; height: 36px; border-radius: 50%; background: #C5DBFF; color: #001178; font-size: 13.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(117,195,255,0.15); }
        .admin-side-name { font-size: 13.5px; font-weight: 700; color: #0F172A; line-height: 1.3; }
        .admin-side-role { font-size: 11.5px; color: #64748B; margin-top: 1px; }
        
        .admin-logout-btn { width: 100%; background: var(--gray-bg); color: #0F172A; border: 1px solid var(--border); border-radius: 8px; padding: 11px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; min-height: 42px; }
        .admin-logout-btn:hover { background: #FEE2E2; color: #B91C1C; border-color: #FCA5A5; }

        .admin-topbar { background: #fff; color: var(--navy-dark-admin); box-shadow: 0 1px 4px rgba(0,17,120,0.06); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 200; }
        .admin-topbar-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; flex-wrap: wrap; gap: 10px; }
        
        .admin-main { padding: 16px; flex: 1; width: 100%; box-sizing: border-box; background: var(--gray-bg); }

        @media (min-width: 601px) {
            .admin-main { padding: 24px 28px; }
        }

        @media (min-width: 901px) {
            .admin-topbar { display: none !important; }
            .admin-overlay { display: none !important; }
            .admin-sidebar { transform: translateX(0) !important; }
            .admin-main { margin-left: 270px !important; width: calc(100% - 270px) !important; padding: 32px 40px; transition: margin-left 0.35s cubic-bezier(0.4,0,0.2,1); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.94); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Topbar (Hanya muncul di mobile) */}
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka Menu"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={LOGO_URL} alt="Bappenda" style={{ height: '32px', width: 'auto' }} referrerPolicy="no-referrer" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>{getPageTitle()}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Sistem Kunjungan Kerja</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Sidebar Overlay */}
      <div className={`admin-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="admin-sidebar-header">
          <img src={LOGO_URL} alt="Bappenda" className="admin-sidebar-logo" referrerPolicy="no-referrer" />
          <div>
            <div className="admin-sidebar-title">Sistem Kunjungan Kerja</div>
          </div>
        </div>

        <div className="admin-sidebar-nav">
          <Link to="/admin/dashboard" className={`admin-nav-btn ${location.pathname === '/admin/dashboard' || location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
            Dashboard Utama
          </Link>
          <Link to="/admin/permohonan" className={`admin-nav-btn ${location.pathname.startsWith('/admin/permohonan') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            Data Permohonan
          </Link>
          <Link to="/admin/tanggal-diblokir" className={`admin-nav-btn ${location.pathname.startsWith('/admin/tanggal-diblokir') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Kalender & Blokir
          </Link>
          <Link to="/admin/kontak" className={`admin-nav-btn ${location.pathname.startsWith('/admin/kontak') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            Kontak & Telepon
          </Link>
          <Link to="/admin/review" className={`admin-nav-btn ${location.pathname.startsWith('/admin/review') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            Rating & Review
          </Link>
          {user?.dinas_id === null && (
            <>
              <Link to="/admin/dinas" className={`admin-nav-btn ${location.pathname.startsWith('/admin/dinas') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                Master Data Dinas
              </Link>
              <Link to="/admin/users" className={`admin-nav-btn ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Manajemen Admin
              </Link>
            </>
          )}
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-side-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="admin-side-avatar">{adminName ? adminName.charAt(0).toUpperCase() : 'A'}</div>
              <div>
                <div className="admin-side-name">{adminName}</div>
                <div className="admin-side-role">{user?.dinas ? `Admin ${user.dinas.singkatan}` : 'Super Admin'}</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => setShowLogoutModal(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar Sesi
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="admin-main">
        {children || <Outlet />}
      </main>

      {/* Modal Popup Konfirmasi Logout */}
      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loggingOut) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-logout-title"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 20px 40px -8px rgba(0, 17, 120, 0.22), 0 10px 18px -4px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              position: 'relative',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Tombol Close silang */}
            <button
              type="button"
              onClick={() => !loggingOut && setShowLogoutModal(false)}
              disabled={loggingOut}
              aria-label="Tutup"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: loggingOut ? 'not-allowed' : 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Icon Warning/Logout */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#FEE2E2',
                border: '1.5px solid #FECACA',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.12)',
              }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            {/* Judul & Keterangan */}
            <h3
              id="modal-logout-title"
              style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#0F172A',
                marginBottom: '8px',
                letterSpacing: '-0.3px',
              }}
            >
              Apakah kamu ingin logout?
            </h3>
            <p
              style={{
                fontSize: '13.5px',
                color: '#64748B',
                lineHeight: '1.6',
                marginBottom: '18px',
              }}
            >
              Sesi Anda akan diakhiri dan Anda perlu login kembali untuk mengakses panel administrasi.
            </p>

            {/* User Info Badge */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#C5DBFF',
                  color: '#1883FF',
                  fontSize: '14px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {adminName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {adminRole}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '9px',
                  padding: '11px 16px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: loggingOut ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.18s',
                  minHeight: '44px',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                style={{
                  flex: 1,
                  background: loggingOut ? '#F87171' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '11px 16px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: loggingOut ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  minHeight: '44px',
                }}
              >
                {loggingOut ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Keluar...
                  </>
                ) : (
                  'Ya, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

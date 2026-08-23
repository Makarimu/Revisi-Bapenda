import { useState, useEffect } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LOGO_URL = 'https://lh3.googleusercontent.com/d/1UJLWaokvtdtss1PGlPt4skw8lJwIi3Su';

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { user, logoutContext } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/permohonan')) return 'Data Permohonan';
    if (location.pathname.startsWith('/admin/tanggal-diblokir')) return 'Kalender & Blokir';
    if (location.pathname.startsWith('/admin/kontak')) return 'Kontak & Telepon';
    if (location.pathname.startsWith('/admin/review')) return 'Rating & Review';
    return 'Dashboard Utama';
  };

  const adminName = user?.name || user?.nama || localStorage.getItem('admin_nama') || 'Admin';

  const doLogout = () => {
    logoutContext();
  };

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
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
      `}</style>

      {/* Topbar (Hanya muncul di mobile) */}
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button
              style={{width:'36px',height:'36px',borderRadius:'8px',border:'1px solid #E5E7EB',background:'white',color:'#222',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka Menu"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <img src={LOGO_URL} alt="Bappenda" style={{height:'32px',width:'auto'}} referrerPolicy="no-referrer"/>
              <div>
                <div style={{fontSize:'13.5px',fontWeight:'700',color:'#001178',lineHeight:'1.2'}}>{getPageTitle()}</div>
                <div style={{fontSize:'11px',color:'#6B7280'}}>Sistem Kunjungan Kerja</div>
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
          <img src={LOGO_URL} alt="Bappenda" className="admin-sidebar-logo" referrerPolicy="no-referrer"/>
          <div>
            <div className="admin-sidebar-title">Sistem Kunjungan Kerja</div>
            <div className="admin-sidebar-sub">Bappenda Kab. Bogor</div>
          </div>
        </div>

        <div className="admin-sidebar-nav">
          <Link to="/admin/dashboard" className={`admin-nav-btn ${location.pathname === '/admin/dashboard' || location.pathname === '/admin' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            Dashboard Utama
          </Link>
          <Link to="/admin/permohonan" className={`admin-nav-btn ${location.pathname.startsWith('/admin/permohonan') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Data Permohonan
          </Link>
          <Link to="/admin/tanggal-diblokir" className={`admin-nav-btn ${location.pathname.startsWith('/admin/tanggal-diblokir') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Kalender & Blokir
          </Link>
          <Link to="/admin/kontak" className={`admin-nav-btn ${location.pathname.startsWith('/admin/kontak') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Kontak & Telepon
          </Link>
          <Link to="/admin/review" className={`admin-nav-btn ${location.pathname.startsWith('/admin/review') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Rating & Review
          </Link>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-side-info">
            <div className="admin-side-avatar">{adminName ? adminName.charAt(0).toUpperCase() : 'A'}</div>
            <div>
              <div className="admin-side-name">{adminName}</div>
              <div className="admin-side-role">Administrator</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={doLogout}>Keluar Sesi</button>
        </div>
      </div>

      {/* Main content */}
      <main className="admin-main">
        {children || <Outlet />}
      </main>
    </div>
  );
}

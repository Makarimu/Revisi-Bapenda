import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { assetUrl } from '../utils/url';

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 320);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openSidebar = () => {
    setSidebarOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = '';
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Topbar Info Pemerintahan */}
      <div className="gov-topbar">
        <div className="gov-topbar-inner">
          <div className="gov-topbar-left">
            <div className="gov-topbar-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Telp: (021) 875-4064</span>
            </div>
            <div className="gov-topbar-divider" />
            <div className="gov-topbar-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Jam Layanan: Senin – Jumat (08.00 – 16.00 WIB)</span>
            </div>
          </div>
          <div className="gov-topbar-right">
            <a href="https://bogorkab.go.id" target="_blank" rel="noopener noreferrer" className="gov-topbar-link">
              Portal Kab. Bogor
            </a>
            <a href="https://ekabo.bogorkab.go.id" target="_blank" rel="noopener noreferrer" className="gov-topbar-link">
              Portal EKABO
            </a>
            <Link to="/login" className="gov-topbar-link login-pill">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Login Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Header Utama */}
      <header className="header" id="siteHeader">
        <div className="header-inner">
          <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>
            <img src={assetUrl('/image/icon.png')} alt="Kabupaten Bogor" className="header-logo-img" />
          </Link>

          <nav className="header-nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>
            <Link to="/permohonan" className={location.pathname.startsWith('/permohonan') ? 'active' : ''}>Ajukan Permohonan</Link>
            <Link to="/status" className={location.pathname.startsWith('/status') ? 'active' : ''}>Cek Status</Link>
            <Link to="/riwayat-kunjungan" className={location.pathname.startsWith('/riwayat-kunjungan') ? 'active' : ''}>Riwayat Kunjungan</Link>
          </nav>
          
          <div className="header-actions">
            <Link to="/permohonan" className="btn-header-cta">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M9 13h6M9 17h6" />
              </svg>
              <span>Ajukan Kunjungan</span>
            </Link>

            <button className="hamburger-btn" onClick={openSidebar} aria-label="Buka menu navigasi">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`} onClick={closeSidebar} />
      <div className={`sidebar-menu${sidebarOpen ? ' active' : ''}`}>
        <div className="sidebar-menu-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--blue-900)', fontSize: '15px' }}>Menu Navigasi</span>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Tutup menu">✕</button>
        </div>
        <nav>
          <Link to="/" onClick={closeSidebar} className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>
          <Link to="/permohonan" onClick={closeSidebar} className={location.pathname.startsWith('/permohonan') ? 'active' : ''}>Ajukan Permohonan</Link>
          <Link to="/status" onClick={closeSidebar} className={location.pathname.startsWith('/status') ? 'active' : ''}>Cek Status Permohonan</Link>
          <Link to="/riwayat-kunjungan" onClick={closeSidebar} className={location.pathname.startsWith('/riwayat-kunjungan') ? 'active' : ''}>Riwayat Kunjungan</Link>
          <div style={{ margin: '12px 0', borderTop: '1px solid var(--border)' }} />
          <Link to="/login" onClick={closeSidebar} style={{ color: 'var(--blue-500)', fontWeight: 700 }}>
            🔐 Portal Login Admin
          </Link>
        </nav>
      </div>

      {/* Page Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Rich Government Footer */}
      <footer className="gov-footer">
        <div className="gov-footer-main">
          <div className="gov-footer-container">
            <div className="gov-footer-grid">
              
              {/* Kolom 1: Profil & Identitas */}
              <div className="gov-footer-col">
                <div className="gov-footer-brand">
                  <img src={assetUrl('/image/icon.png')} alt="Kabupaten Bogor" style={{ height: '48px', width: 'auto', background: '#fff', padding: '6px 12px', borderRadius: '8px', marginBottom: '16px', display: 'inline-block' }} />
                  <h4 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>
                    Sistem Kunjungan Kerja
                  </h4>
                  <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                    Portal pelayanan terpadu penerimaan permohonan kunjungan kerja, studi komparasi, dan koordinasi kedinasan di lingkungan Pemerintah Kabupaten Bogor.
                  </p>
                </div>
              </div>

              {/* Kolom 2: Navigasi Layanan */}
              <div className="gov-footer-col">
                <h5 className="gov-footer-title">Layanan Utama</h5>
                <ul className="gov-footer-links">
                  <li><Link to="/permohonan">Ajukan Permohonan Baru</Link></li>
                  <li><Link to="/status">Cek Status &amp; Revisi</Link></li>
                  <li><Link to="/riwayat-kunjungan">Riwayat &amp; Ulasan Kunjungan</Link></li>
                  <li><a href="#ketentuan-section">Ketentuan &amp; Dasar Hukum</a></li>
                  <li><Link to="/login">Portal Khusus Admin</Link></li>
                </ul>
              </div>

              {/* Kolom 3: Kontak & Alamat */}
              <div className="gov-footer-col">
                <h5 className="gov-footer-title">Kontak &amp; Alamat</h5>
                <ul className="gov-footer-contact">
                  <li>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Jl. Tegar Beriman No. 1, Cibinong, Kabupaten Bogor, Jawa Barat 16914</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>(021) 875-4064 / Fax: (021) 875-4065</span>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>bappenda@bogorkab.go.id</span>
                  </li>
                </ul>
              </div>

              {/* Kolom 4: Portal Terkait */}
              <div className="gov-footer-col">
                <h5 className="gov-footer-title">Tautan Eksternal</h5>
                <ul className="gov-footer-links">
                  <li><a href="https://bogorkab.go.id" target="_blank" rel="noopener noreferrer">Pemerintah Kab. Bogor</a></li>
                  <li><a href="https://bappenda.bogorkab.go.id" target="_blank" rel="noopener noreferrer">Bappenda Kab. Bogor</a></li>
                  <li><a href="https://diskominfo.bogorkab.go.id" target="_blank" rel="noopener noreferrer">Diskominfo Kab. Bogor</a></li>
                  <li><a href="https://ekabo.bogorkab.go.id" target="_blank" rel="noopener noreferrer">Portal Wisata EKABO</a></li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="gov-footer-bottom">
          <div className="gov-footer-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
              &copy; 2026 Pemerintah Kabupaten Bogor. Seluruh hak cipta dilindungi undang-undang.
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Powered by <a href="https://bappenda.bogorkab.go.id" target="_blank" rel="noopener noreferrer" style={{ color: '#75C3FF', textDecoration: 'none' }}>Bappenda</a> &amp; <a href="https://diskominfo.bogorkab.go.id" target="_blank" rel="noopener noreferrer" style={{ color: '#75C3FF', textDecoration: 'none' }}>Diskominfo</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        type="button"
        className={`back-to-top${showBackToTop ? ' visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}

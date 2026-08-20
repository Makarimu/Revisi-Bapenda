import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://lh3.googleusercontent.com/d/1UJLWaokvtdtss1PGlPt4skw8lJwIi3Su';

export default function PublicLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

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
    <>
      {/* Header */}
      <header className="header" id="siteHeader">
        <div className="header-inner">
          <div className="header-logo">
            <img src={LOGO_URL} alt="Bappenda Juara" className="header-logo-img" referrerPolicy="no-referrer" />
          </div>
          <nav className="header-nav">
            <Link to="/">Beranda</Link>
            <Link to="/status">Cek Status</Link>
            <Link to="/permohonan">Ajukan Permohonan</Link>
            <Link to="/riwayat-kunjungan">Riwayat Kunjungan</Link>
          </nav>
          <button className="hamburger-btn" onClick={openSidebar} aria-label="Buka menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`} onClick={closeSidebar} />
      <div className={`sidebar-menu${sidebarOpen ? ' active' : ''}`}>
        <div className="sidebar-menu-header">
          <span>Menu</span>
          <button className="sidebar-close" onClick={closeSidebar}>✕</button>
        </div>
        <nav>
          <Link to="/" onClick={closeSidebar}>Beranda</Link>
          <Link to="/status" onClick={closeSidebar}>Cek Status</Link>
          <Link to="/permohonan" onClick={closeSidebar}>Ajukan Permohonan</Link>
          <Link to="/riwayat-kunjungan" onClick={closeSidebar}>Riwayat Kunjungan</Link>
        </nav>
      </div>

      {/* Page Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <div className="footer">© {new Date().getFullYear()} Sistem Kunjungan Kerja</div>

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
    </>
  );
}

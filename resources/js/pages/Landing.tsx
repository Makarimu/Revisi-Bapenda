import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { getApprovedReviews } from '../api/review';
import BogorMap from '../components/common/BogorMap';
import { assetUrl } from '../utils/url';

export default function Landing() {
  const navigate = useNavigate();
  const alurRef = useRef<HTMLDivElement>(null);
  const ketentuanRef = useRef<HTMLDivElement>(null);
  const petaRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const [alurBtnLeft, setAlurBtnLeft] = useState(true);
  const [alurBtnRight, setAlurBtnRight] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollAlur = (dir: number) => {
    if (!alurRef.current) return;
    const step = alurRef.current.clientWidth * 0.6;
    alurRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const updateAlurBtnState = () => {
    if (!alurRef.current) return;
    const el = alurRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAlurBtnLeft(el.scrollLeft <= 4);
    setAlurBtnRight(el.scrollLeft >= maxScroll - 4);
  };

  useEffect(() => {
    let isMounted = true;
    const el = alurRef.current;
    if (el) {
      el.addEventListener('scroll', updateAlurBtnState);
      window.addEventListener('resize', updateAlurBtnState);
      updateAlurBtnState();
    }

    getApprovedReviews()
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setReviews(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) console.error('Error fetching approved reviews:', err);
      });

    if (window.location.hash === '#ketentuan-section') {
      setTimeout(() => {
        ketentuanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }

    return () => {
      isMounted = false;
      if (el) {
        el.removeEventListener('scroll', updateAlurBtnState);
      }
      window.removeEventListener('resize', updateAlurBtnState);
    };
  }, []);

  const heroBgImage = assetUrl('/image/tegarberiman.jpeg');

  return (
    <PublicLayout>
      {/* ===== GRAND HERO SECTION ===== */}
      <section
        className="hero gov-grand-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 17, 120, 0.92) 0%, rgba(0, 40, 179, 0.88) 55%, rgba(24, 131, 255, 0.82) 100%), url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="hero-inner gov-hero-inner">
          <div className="gov-hero-badge">
            <span className="gov-badge-dot" />
            <span>PORTAL RESMI PELAYANAN KUNJUNGAN KERJA KABUPATEN BOGOR</span>
          </div>

          <h1 className="gov-hero-title">
            Selamat Datang di Portal Kunjungan Kerja
          </h1>

          <p className="gov-hero-desc">
            Layanan resmi pengajuan permohonan kunjungan kerja, koordinasi dinas, dan studi komparasi ke Badan Pengelolaan Pendapatan Daerah &amp; seluruh instansi Pemerintah Kabupaten Bogor secara cepat, transparan, dan terintegrasi.
          </p>

          <div className="hero-actions gov-hero-actions">
            <button className="btn btn-hero-primary" onClick={() => navigate('/permohonan')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M9 13h6M9 17h6" />
              </svg>
              Ajukan Permohonan Sekarang
            </button>
            <button className="btn btn-hero-ghost" onClick={() => navigate('/status')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Cek Status Permohonan
            </button>
          </div>
        </div>
      </section>

      {/* ===== FLOATING QUICK ACCESS CARDS ===== */}
      <div className="gov-quick-wrapper">
        <div className="gov-quick-container">
          <div className="gov-quick-grid">
            
            {/* Card 1: Peta Wilayah */}
            <div className="gov-quick-card" onClick={() => scrollToSection(petaRef)} role="button" tabIndex={0}>
              <div className="gov-quick-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="gov-quick-title">Peta Wilayah</div>
              <div className="gov-quick-desc">Sebaran kantor &amp; lokasi instansi di Kab. Bogor</div>
            </div>

            {/* Card 2: Ulasan Instansi */}
            <div className="gov-quick-card" onClick={() => navigate('/riwayat-kunjungan')} role="button" tabIndex={0}>
              <div className="gov-quick-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="gov-quick-title">Riwayat Kunjungan</div>
              <div className="gov-quick-desc">Pengalaman instansi yang telah berkunjung</div>
            </div>

            {/* Card 3: Explore Wisata */}
            <a
              href="https://ekabo.bogorkab.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-quick-card"
              style={{ textDecoration: 'none' }}
            >
              <div className="gov-quick-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
              <div className="gov-quick-title">Explore Wisata</div>
              <div className="gov-quick-desc">Portal resmi akomodasi &amp; wisata EKABO</div>
            </a>

          </div>
        </div>
      </div>

      {/* ===== NOTICE RIBBON ===== */}
      <div className="gov-ribbon-wrapper">
        <div className="gov-ribbon-inner">
          <div className="gov-ribbon-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="gov-ribbon-text">
            <strong>Pemberitahuan Wajib:</strong> Sesuai Surat Edaran Bupati Bogor No. 727 Tahun 2025, kunjungan kerja lebih dari 1 (satu) hari <strong>diwajibkan untuk menginap</strong> di hotel/penginapan wilayah Kabupaten Bogor.
          </div>
          <button className="gov-ribbon-btn" onClick={() => scrollToSection(ketentuanRef)}>
            Pelajari Ketentuan &rarr;
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* ===== ALUR PERMOHONAN ===== */}
        <div className="section-head">
          <div className="section-tag">Tahapan Pelayanan</div>
          <h2>Alur Permohonan Kunjungan Kerja</h2>
          <p>Ikuti 6 langkah mudah berikut untuk mengajukan permohonan kunjungan kerja Anda secara tertib dan transparan.</p>
        </div>

        <div className="alur-outer">
          <button
            type="button"
            className="alur-scroll-btn left"
            onClick={() => scrollAlur(-1)}
            aria-label="Geser ke kiri"
            disabled={alurBtnLeft}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="alur-scroll-btn right"
            onClick={() => scrollAlur(1)}
            aria-label="Geser ke kanan"
            disabled={alurBtnRight}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <div className="alur-card-wrap" ref={alurRef}>
            <div className="alur-grid">

              <div className="alur-step">
                <div className="alur-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <p>1. Pilih Tanggal Kunjungan</p>
              </div>
              <div className="alur-connector" />

              <div className="alur-step">
                <div className="alur-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="8" r="3" />
                    <path d="M4 19c0-3 2.5-5 5-5s5 2 5 5" />
                    <path d="M14 9h6M14 13h6M14 17h4" />
                  </svg>
                </div>
                <p>2. Lengkapi Data Pemohon</p>
              </div>
              <div className="alur-connector" />

              <div className="alur-step">
                <div className="alur-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                    <path d="M9 13h6M9 17h6" />
                  </svg>
                </div>
                <p>3. Unggah Surat Pendukung</p>
              </div>
              <div className="alur-connector" />

              <div className="alur-step">
                <div className="alur-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
                  </svg>
                </div>
                <p>4. Kirim &amp; Simpan Kode</p>
              </div>
              <div className="alur-connector" />

              <div className="alur-step">
                <div className="alur-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 21h3M21 14v3" />
                  </svg>
                </div>
                <p>5. Verifikasi &amp; Hasil</p>
              </div>
              <div className="alur-connector" />

              <div className="alur-step">
                <div className="alur-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p>
                  6. Upload Bukti Menginap<br />
                  <span style={{ fontWeight: 400, fontSize: '11px', color: 'var(--text-sub)' }}>(Jika Menginap &gt; 1 Hari)</span>
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ===== PETA INTERAKTIF SECTION ===== */}
        <div id="peta-section" ref={petaRef} style={{ marginTop: '72px' }}>
          <div className="section-head">
            <div className="section-tag">Geografis &amp; Lokasi</div>
            <h2>Peta Wilayah &amp; Sebaran Instansi</h2>
            <p>Eksplorasi batas wilayah administrasi dan lokasi kantor perangkat daerah di Kabupaten Bogor.</p>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <BogorMap />
          </div>
        </div>

        {/* ===== KETENTUAN KUNJUNGAN KERJA ===== */}
        <div id="ketentuan-section" ref={ketentuanRef} style={{ marginTop: '72px' }}>
          <div className="section-head">
            <div className="section-tag">Dasar Regulasi</div>
            <h2>Ketentuan Kunjungan Kerja</h2>
            <p>Mohon membaca dan memahami ketentuan berikut sebelum mengajukan permohonan kunjungan kerja.</p>
          </div>

          <div className="ketentuan-card">
            <p className="ketentuan-dasar">
              <strong>Dasar:</strong> Surat Edaran Bupati Bogor Nomor: 727 Tahun 2025 Tentang Ketentuan Pelaksanaan Pelayanan Kegiatan Penerimaan Kunjungan Kerja Dan/Atau Sejenis di Kabupaten Bogor.
            </p>
            <ol className="ketentuan-list">
              <li>1. Kegiatan Kunjungan Kerja dan/atau sejenis lainnya dilaksanakan pada hari Senin s.d. Jum'at (5 hari kerja).</li>
              <li>2. Menyampaikan surat permohonan kunjungan kerja paling lambat 7 (tujuh) hari sebelum kegiatan dilaksanakan.</li>
              <li>
                3. Kegiatan kunjungan kerja yang dilaksanakan lebih dari 1 (satu) hari di wilayah Kabupaten Bogor{' '}
                <strong>DIHIMBAU UNTUK MENGINAP</strong> di hotel/penginapan yang berada di wilayah Kabupaten Bogor
                dan melampirkan bukti pemesanan akomodasi atau dokumen sejenis lainnya.
              </li>
              <li>
                4. Dalam hal tamu tidak melaksanakan ketentuan maka Bupati/Kepala Perangkat Daerah terkait tidak dapat menerima kegiatan kunjungan kerja dan/atau kegiatan sejenis lainnya.
              </li>
            </ol>
          </div>
        </div>

        {/* ===== INFO CARDS (DOKUMEN & PERSYARATAN) ===== */}
        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-head">
              <div className="info-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                </svg>
              </div>
              <h3>Dokumen yang Diperlukan</h3>
            </div>
            <ul>
              <li>Surat Permohonan Kunjungan Kerja resmi berkop instansi</li>
              <li>Lampiran Daftar Pertanyaan atau agenda topik studi komparasi</li>
              <li>Identitas narahubung/PIC (nama, jabatan, nomor WhatsApp aktif, email)</li>
              <li>Rincian jumlah peserta dan estimasi waktu kunjungan</li>
            </ul>
          </div>

          <div className="info-card">
            <div className="info-card-head">
              <div className="info-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Hal yang Perlu Diperhatikan</h3>
            </div>
            <ul>
              <li>Pengajuan minimal 7 hari sebelum rencana tanggal kunjungan</li>
              <li>Proses review dan disposisi oleh admin memakan waktu 1–3 hari kerja</li>
              <li>Simpan Kode Permohonan unik untuk memantau status secara berkala</li>
              <li>Pemberitahuan status resmi dikirimkan secara otomatis via email</li>
            </ul>
          </div>
        </div>

        {/* ===== TESTIMONIAL REVIEW SECTION ===== */}
        {reviews.length > 0 && (
          <div id="review-section" ref={reviewRef} style={{ marginTop: '72px' }}>
            <div className="section-head">
              <div className="section-tag">Ulasan &amp; Kepuasan</div>
              <h2>Apa Kata Instansi yang Pernah Berkunjung</h2>
              <p>Transparansi dan dedikasi pelayanan terbaik dari Pemerintah Kabupaten Bogor untuk seluruh instansi sahabat.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '28px' }}>
              {reviews.slice(0, 6).map((rev: any) => (
                <div key={rev.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s ease' }}>
                  <div>
                    <div style={{ color: '#F59E0B', fontSize: '18px', marginBottom: '12px' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '18px' }}>
                      "{rev.review}"
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--blue-900)' }}>{rev.instansi || '-'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '3px' }}>PIC: {rev.nama_pic || '-'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                className="btn btn-ghost"
                onClick={() => navigate('/riwayat-kunjungan')}
                style={{ background: 'var(--blue-100)', color: 'var(--blue-900)', border: '1px solid var(--blue-200)', fontWeight: 700 }}
              >
                Lihat Riwayat Kunjungan
              </button>
            </div>
          </div>
        )}

        {/* ===== EKABO EXPLORE CARD ===== */}
        <div
          className="gov-ekabo-card"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0, 17, 120, 0.88) 0%, rgba(24, 131, 255, 0.82) 100%), url(${assetUrl('/image/explore_bogor_banner.jpg')})`,
          }}
        >
          <div className="gov-ekabo-inner">
            <span className="gov-ekabo-tag">Wisata &amp; Akomodasi</span>
            <h3>Jelajahi Keindahan &amp; Akomodasi Kabupaten Bogor</h3>
            <p>Temukan referensi hotel, penginapan resmi, kuliner khas, dan destinasi wisata menarik selama Anda melaksanakan kunjungan kerja di Kabupaten Bogor.</p>
            <a
              href="https://ekabo.bogorkab.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Kunjungi Portal EKABO
            </a>
          </div>
        </div>



      </div>
    </PublicLayout>
  );
}

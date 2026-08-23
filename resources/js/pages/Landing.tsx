import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { getApprovedReviews } from '../api/review';
import BogorMap from '../components/common/BogorMap';

export default function Landing() {
  const navigate = useNavigate();
  const alurRef = useRef(null);
  const ketentuanRef = useRef(null);
  const [alurBtnLeft, setAlurBtnLeft] = useState(true); // disabled by default
  const [alurBtnRight, setAlurBtnRight] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const scrollToKetentuan = () => {
    ketentuanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollAlur = (dir) => {
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

    return () => {
      isMounted = false;
      if (el) {
        el.removeEventListener('scroll', updateAlurBtnState);
      }
      window.removeEventListener('resize', updateAlurBtnState);
    };
  }, []);

  return (
    <PublicLayout>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Selamat Datang!</h1>
          <p>
            Halaman ini menyediakan layanan pengajuan permohonan kunjungan kerja secara online bagi pihak yang ingin
            melakukan kunjungan kerja ke Bappenda Kabupaten Bogor.
          </p>
          <div className="hero-actions">
            <button className="btn btn-gold" onClick={() => navigate('/permohonan')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M9 13h6M9 17h6" />
              </svg>
              Ajukan Permohonan Sekarang
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/status')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Cek Status Permohonan
            </button>
            <button className="btn btn-ghost" onClick={scrollToKetentuan}>
              Lihat Ketentuan Kunjungan Kerja
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ===== ALUR ===== */}
        <div className="section-head">
          <div className="section-tag">Bagaimana Caranya</div>
          <h2>Alur Permohonan Kunjungan Kerja</h2>
          <p>Ikuti 6 langkah sederhana di bawah ini untuk mengajukan permohonan kunjungan kerja Anda.</p>
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
                  <span style={{ fontWeight: 400, fontSize: '11px', color: 'var(--text-sub)' }}>(Jika Ada Rencana Menginap)</span>
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ===== KETENTUAN ===== */}
        <div className="section-head" id="ketentuan-section" ref={ketentuanRef} style={{ marginTop: '48px' }}>
          <div className="section-tag">Dasar Hukum</div>
          <h2>Ketentuan Kunjungan Kerja</h2>
          <p>Mohon membaca dan memahami ketentuan berikut sebelum mengajukan permohonan kunjungan kerja.</p>
        </div>
        <div className="ketentuan-card">
          <p className="ketentuan-dasar">
            <strong>Dasar:</strong> Surat Edaran Bupati Bogor Nomor: 727 Tahun 2025 Tentang Ketentuan Pelaksanaan
            Pelayanan Kegiatan Penerimaan Kunjungan Kerja Dan/Atau Sejenis di Kabupaten Bogor.
          </p>
          <ol className="ketentuan-list">
            <li>1. Kegiatan Kunjungan Kerja dan/atau sejenis lainnya dilaksanakan pada hari Senin s.d. Jum'at (5 hari kerja).</li>
            <li>2. Menyampaikan surat permohonan kunjungan kerja paling lambat 7 (tujuh) hari sebelum kegiatan dilaksanakan.</li>
            <li>
              3. Kegiatan kunjungan kerja yang dilaksanakan lebih dari 1 (satu) hari di wilayah Kabupaten Bogor{' '}
              <strong>DIWAJIBKAN UNTUK MENGINAP</strong> di hotel/penginapan yang berada di wilayah Kabupaten Bogor
              dan melampirkan bukti pemesanan akomodasi atau dokumen sejenis lainnya.
            </li>
            <li>
              4. Dalam hal tamu tidak melaksanakan ketentuan maka Bupati/Kepala Perangkat Daerah terkait tidak dapat
              menerima kegiatan kunjungan kerja dan/atau kegiatan sejenis lainnya.
            </li>
          </ol>
        </div>

        {/* ===== INFO CARDS ===== */}
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
              <li>Surat Permohonan Kunjungan Kerja resmi dari instansi</li>
              <li>Lampiran Daftar Pertanyaan terkait agenda kunjungan</li>
              <li>Data lengkap pemohon (nama, jabatan, kontak, email)</li>
              <li>Rincian agenda dan jumlah peserta kunjungan</li>
            </ul>
          </div>
          <div className="info-card">
            <div className="info-card-head">
              <div className="info-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Hal yang Perlu Diperhatikan</h3>
            </div>
            <ul>
              <li>Pengajuan minimal 7 hari sebelum tanggal kunjungan</li>
              <li>Proses review oleh admin memakan waktu 1–3 hari kerja</li>
              <li>Simpan kode permohonan untuk memantau status &amp; revisi</li>
              <li>Notifikasi setiap perubahan status dikirim melalui email</li>
            </ul>
          </div>
        </div>

        {reviews.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <div className="section-head">
              <div className="section-tag">Testimonial</div>
              <h2>Apa Kata Instansi yang Pernah Berkunjung</h2>
              <p>Ulasan dan pengalaman dari instansi yang telah melaksanakan kunjungan kerja di Bappenda Kabupaten Bogor.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
              {reviews.slice(0, 6).map((rev: any) => (
                <div key={rev.id} style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#F59E0B', fontSize: '18px', marginBottom: '10px' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#374151', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '16px' }}>
                      "{rev.review}"
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{rev.instansi || '-'}</div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>PIC: {rev.nama_pic || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== CTA BOX ===== */}
        <div className="cta-box">
          <h3>Siap mengajukan kunjungan kerja?</h3>
          <p>Proses pengajuan hanya membutuhkan beberapa menit.</p>
          <button className="btn btn-gold" onClick={() => navigate('/permohonan')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M9 13h6M9 17h6" />
            </svg>
            Mulai Ajukan Permohonan
          </button>
        </div>

        {/* ===== LAYANAN & PETA CARD ===== */}
        <div style={{ marginTop: '24px', background: '#ffffff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF3C7', color: '#D97706', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>Layanan &amp; Peta Kabupaten Bogor</h3>
              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '2px 0 0 0' }}>Akses portal integrasi EKABO dan peta sebaran kantor dinas di Kabupaten Bogor.</p>
            </div>
          </div>

          {/* Peta Interaktif Kabupaten Bogor */}
          <BogorMap />

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            <a 
              href="https://ekabo.bogorkab.go.id/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13px', textDecoration: 'none' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Portal EKABO
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

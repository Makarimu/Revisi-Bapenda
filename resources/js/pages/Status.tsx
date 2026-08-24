import { useState, useEffect, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import api from '../services/api';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggal(s: any) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return s; }
}

function formatDateTime(s: any) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    const pad = (n: any) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return s; }
}

function statusClass(s: any) {
  if (s === 'Disetujui' || s === 'Selesai' || s === 'Ringkasan_Terkirim') return 'status-disetujui';
  if (s === 'Ditolak') return 'status-ditolak';
  if (s === 'Revisi') return 'status-revisi';
  return 'status-pending';
}

function statusLabel(s: any) {
  if (s === 'Ringkasan_Terkirim') return 'Ringkasan Tersedia';
  return s;
}

const RatingReviewCard = memo(function RatingReviewCard({ kode, reviewData, onSubmitted, showToast }: any) {
  const [rating, setRating] = useState<number>(reviewData?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>(reviewData?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!reviewData);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Rating wajib dipilih (1 - 5 bintang).');
      return;
    }

    const trimmed = reviewText.trim();
    if (!trimmed) {
      setErrorMsg('Review wajib diisi.');
      return;
    }
    if (trimmed.length < 10) {
      setErrorMsg('Review minimal 10 karakter.');
      return;
    }
    if (trimmed.length > 1000) {
      setErrorMsg('Review maksimal 1000 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/permohonan/${kode}/review`, { rating, review: trimmed });
      setIsSubmitted(true);
      showToast('Terima kasih atas penilaian Anda.', 'success');
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengirim penilaian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid rgba(228, 231, 237, 0.8)', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#F59E0B', fontSize: '18px' }}>★</span> Rating &amp; Review
      </h4>

      {isSubmitted ? (
        <div style={{ background: '#C5DBFF', border: '1px solid rgba(117, 195, 255, 0.6)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#F59E0B', marginBottom: '8px' }}>
            {'★'.repeat(rating || reviewData?.rating || 5)}{'☆'.repeat(5 - (rating || reviewData?.rating || 5))}
          </div>
          <p style={{ fontSize: '14.5px', fontWeight: '700', color: '#001178', marginBottom: '6px' }}>
            Terima kasih atas penilaian Anda.
          </p>
          <p style={{ fontSize: '13.5px', color: '#334155', fontStyle: 'italic', margin: 0, lineHeight: '1.6' }}>
            "{reviewText || reviewData?.review}"
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Rating *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: activeStar ? '#F59E0B' : '#D1D5DB',
                      transition: 'color 0.15s, transform 0.15s',
                      transform: activeStar ? 'scale(1.08)' : 'scale(1)',
                      padding: '0 2px'
                    }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              Review *
            </label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tuliskan pengalaman kunjungan kerja Anda..."
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #D9DEE5',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: '1.6'
              }}
            />
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px', textAlign: 'right' }}>
              {reviewText.length}/1000 karakter (min. 10)
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              background: isSubmitting ? '#9CA3AF' : '#0028B3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '11px 22px',
              minHeight: '44px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              width: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
          </button>
        </form>
      )}
    </div>
  );
});

// Helper: petakan response API ke state result (digunakan bersama handleCek & useEffect)
function mapApiToResult(d: any, kontak: any) {
  // pdf_ready adalah satu-satunya gate: true hanya jika PDF benar-benar ada di storage
  const pdfReady = !!(d.pdf_ready);

  return {
    found: true,
    kode: d.kode,
    nomorSurat: d.nomor_surat,
    instansi: d.instansi,
    namaPic: d.nama_pic,
    jabatanPic: d.jabatan_pic,
    noTelp: d.no_telp,
    email: d.email,
    tujuan: d.tujuan,
    dinasTujuan: d.dinas_tujuan,
    dinasId: d.dinas_id,
    namaKetuaRombongan: d.nama_ketua_rombongan,
    jabatanKetuaRombongan: d.jabatan_ketua_rombongan,
    jumlahPeserta: d.jumlah_peserta,
    tanggalKunjungan: d.tanggal_kunjungan,
    rencanaMenginap: d.rencana_menginap,
    namaHotel: d.nama_hotel,
    status: d.status,
    keterangan: d.keterangan_admin,
    bisaRevisi: d.bisa_revisi,
    narasumber: d.narasumber,
    jamPenerimaan: d.jam_penerimaan,
    linkSurat1: d.link_surat_1,
    linkSurat2: d.link_surat_2,
    linkBuktiMenginap: d.link_bukti_menginap,
    review: d.review,
    hasReview: !!(d.has_review || d.review || d.review_exists),
    // === PDF fields — hanya truthy jika PDF benar-benar sudah diupload ===
    pdf_ready: pdfReady,
    has_pdf: pdfReady,
    pdf_available: pdfReady,
    pdf_filename: pdfReady ? (d.pdf_filename || d.pdf_nama_file || 'Ringkasan-Hasil-Kunjungan.pdf') : null,
    pdf_nama_file: pdfReady ? (d.pdf_filename || d.pdf_nama_file || 'Ringkasan-Hasil-Kunjungan.pdf') : null,
    pdf_uploaded_at: pdfReady ? (d.pdf_uploaded_at || d.ringkasan_uploaded_at || d.hasil_kunjungan_uploaded_at) : null,
    pdf_ukuran_file: pdfReady ? d.pdf_ukuran_file : null,
    // URL download HANYA ada jika pdfReady === true — ini fix utama bug
    pdf_url: pdfReady ? (d.download_url || d.pdf_url || d.pdf_download_url || `/api/permohonan/${d.kode}/download-pdf`) : null,
    pdf_download_url: pdfReady ? (d.download_url || d.pdf_url || d.pdf_download_url || `/api/permohonan/${d.kode}/download-pdf`) : null,
    link_ringkasan_pdf: pdfReady ? d.link_ringkasan_pdf : null,
    // Timestamps lengkap untuk stepper
    tglPengajuanAwal: d.tgl_pengajuan_awal || d.created_at,
    tglDiproses: d.tgl_diproses,
    tglRevisi: d.tgl_revisi,
    tglDisetujui: d.tgl_disetujui,
    tglSelesai: d.tanggal_selesai_kunjungan || d.completed_at,
    tglReview: d.review?.created_at || d.review_submitted_at || null,
    ringkasanSentAt: d.ringkasan_sent_at,
    ringkasanReady: pdfReady,
    kontak,
  };
}

const RingkasanPdfCard = memo(function RingkasanPdfCard({ result }: { result: any }) {
  const isSelesaiOrRingkasan = result.status === 'Selesai' || result.status === 'Ringkasan_Terkirim';
  if (!isSelesaiOrRingkasan) return null;

  // pdf_ready adalah SATU-SATUNYA gate — true hanya jika PDF sudah benar-benar diupload admin
  const hasPdf = !!(result.pdf_ready);
  const pdfNamaFile = result.pdf_filename || result.pdf_nama_file || 'Ringkasan-Hasil-Kunjungan.pdf';
  const pdfUploadedAt = result.pdf_uploaded_at || result.ringkasan_uploaded_at;
  const pdfUkuranFile = result.pdf_ukuran_file || '';
  // URL download hanya digunakan jika hasPdf === true
  const downloadUrl = hasPdf ? (result.pdf_url || result.pdf_download_url || `/api/permohonan/${result.kode}/download-pdf`) : null;

  const handleDownload = useCallback(() => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Ringkasan-Hasil-Kunjungan.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl]);

  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: '#222222' }}>
        Ringkasan Hasil Kunjungan
      </h4>

      {!hasPdf ? (
        // PDF belum diupload Admin — TIDAK ADA tombol Download
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
              Masih diproses Admin
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#78350F', lineHeight: '1.6' }}>
              Ringkasan hasil kunjungan kerja sedang disusun oleh Admin.<br />
              Anda akan menerima email ketika file sudah tersedia.
            </p>
          </div>
        </div>
      ) : (
        // PDF sudah ada — tampilkan tombol Download
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(22,101,52,0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <span style={{ display: 'inline-block', background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Status: Sudah tersedia
                </span>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{pdfNamaFile}</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                  Tanggal Upload: {formatTanggal(pdfUploadedAt)} {pdfUkuranFile ? `• Ukuran: ${pdfUkuranFile}` : ''}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-primary"
            style={{
              background: '#0028B3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '11px 22px',
              minHeight: '44px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              width: 'auto'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Unduh PDF
          </button>
        </div>
      )}
    </div>
  );
});


function LangkahCard({ data, onRevisi, onUploadBukti }: any) {
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const { status, rencanaMenginap, linkBuktiMenginap, bisaRevisi, hasReview, ringkasanReady, pdf_ready } = data;
  const canRevisi = status === 'Ditolak' && bisaRevisi !== 'Tidak';
  const needsMenginap = rencanaMenginap === 'Ya';
  const sudahUploadBukti = !!linkBuktiMenginap;
  const isPdfReady = !!(pdf_ready || ringkasanReady);

  const isKondisiC = (status === 'Selesai' || status === 'Ringkasan_Terkirim') && isPdfReady;
  const isKondisiB = (status === 'Selesai' || status === 'Ringkasan_Terkirim') && hasReview && !isPdfReady;
  const isKondisiA = (status === 'Selesai' || status === 'Ringkasan_Terkirim') && !hasReview;

  const cardBg = isKondisiC ? '#F0FDF4' : isKondisiB ? '#FFFBEB' : isKondisiA ? '#FFFBEB' : '#ffffff';
  const cardBorder = isKondisiC ? '1px solid #86EFAC' : (isKondisiB || isKondisiA) ? '1px solid #FCD34D' : '1px solid rgba(228, 231, 237, 0.8)';
  const titleColor = isKondisiC ? '#15803D' : (isKondisiB || isKondisiA) ? '#92400E' : '#0F172A';

  return (
    <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <h4 style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '10px', color: titleColor }}>
            {isKondisiC ? 'Ringkasan Hasil Kunjungan Sudah Tersedia' : isKondisiB ? 'Menunggu Ringkasan Hasil Kunjungan' : 'Langkah Selanjutnya'}
          </h4>
          {status === 'Pending' && <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7' }}>Permohonan Anda sedang dalam proses review oleh admin. Mohon menunggu konfirmasi melalui email.</p>}
          {status === 'Revisi' && <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7' }}>Revisi permohonan Anda telah dikirim dan sedang menunggu review ulang dari admin.</p>}
          {status === 'Ditolak' && (
            <>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7' }}>Permohonan Anda ditolak. Silakan periksa keterangan admin untuk detail alasan penolakan.</p>
              {!canRevisi && <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7', marginTop: '8px' }}>Permohonan ini tidak dapat direvisi. Silakan ajukan permohonan baru jika masih diperlukan.</p>}
            </>
          )}
          {status === 'Disetujui' && !needsMenginap && <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7' }}>Kunjungan telah disetujui. Silakan datang sesuai jadwal kunjungan yang telah ditentukan.</p>}
          {status === 'Disetujui' && needsMenginap && !sudahUploadBukti && <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7' }}>Kunjungan telah disetujui. Karena Anda berencana menginap, silakan unggah bukti pemesanan penginapan.</p>}
          {status === 'Disetujui' && needsMenginap && sudahUploadBukti && <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.7' }}>Kunjungan telah disetujui. Bukti pemesanan penginapan telah diunggah. Silakan datang sesuai jadwal.</p>}
          {isKondisiA && <p style={{ fontSize: '13.5px', color: '#78350F', lineHeight: '1.7' }}>Kunjungan kerja telah selesai dilaksanakan. Silakan berikan Rating &amp; Review pada kolom di bawah ini terlebih dahulu.</p>}
          {isKondisiB && <p style={{ fontSize: '13.5px', color: '#78350F', lineHeight: '1.7' }}>Terima kasih atas Rating &amp; Review. Ringkasan hasil kunjungan sedang diproses oleh Admin.</p>}
          {isKondisiC && <p style={{ fontSize: '13.5px', color: '#166534', lineHeight: '1.7' }}>Ringkasan hasil kunjungan kerja telah tersedia. Silakan mengunduh PDF pada bagian Ringkasan Hasil Kunjungan.</p>}
        </div>

        {canRevisi && (
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <button
              className="btn-primary"
              onClick={onRevisi}
              style={{ width: '100%', minHeight: '44px' }}
            >
              Revisi Permohonan
            </button>
          </div>
        )}
        {status === 'Disetujui' && needsMenginap && (
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Status Upload</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13.5px', fontWeight: '600', color: '#0F172A' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: sudahUploadBukti ? '#0028B3' : '#CBD5E1', flexShrink: 0, display: 'inline-block' }} />
              {sudahUploadBukti ? 'Sudah diunggah' : 'Belum diunggah'}
            </div>
            {sudahUploadBukti && (
              <a href={linkBuktiMenginap} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#0028B3', fontWeight: '600', textDecoration: 'underline', display: 'block', marginBottom: '8px' }}>
                Lihat File
              </a>
            )}
            <input type="file" id="fileBuktiMenginap" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }}
              onChange={e => e.target.files && setBuktiFile(e.target.files[0])} />
            <button
              className="btn-outline-navy"
              onClick={() => document.getElementById('fileBuktiMenginap')?.click()}
              style={{ minHeight: '42px' }}
            >
              {sudahUploadBukti ? 'Ganti File' : 'Unggah Bukti Pemesanan'}
            </button>
            {buktiFile && (
              <>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#0028B3', fontWeight: '600' }}>{buktiFile.name}</div>
                <button className="btn-primary" style={{ marginTop: '8px', width: '100%', minHeight: '42px' }} onClick={() => onUploadBukti(buktiFile)}>
                  Simpan Bukti Pemesanan
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RevisiDialog({ open, data, onClose, onSubmit }: any) {
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 7);

  const [form, setForm] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [viewDate, setViewDate] = useState(new Date());
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [dinasList, setDinasList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/dinas')
        .then(res => {
          if (res.data.success) {
            setDinasList(res.data.data);
          }
        })
        .catch(err => console.error('Gagal mengambil daftar dinas:', err));
    }
  }, [open]);

  useEffect(() => {
    if (data) {
      setForm({
        nomorSurat: data.nomorSurat || '',
        namaPic: data.namaPic || '',
        instansi: data.instansi || '',
        jabatanPic: data.jabatanPic || '',
        noTelp: data.noTelp || '',
        email: data.email || '',
        tujuan: data.tujuan || '',
        dinasTujuan: data.dinasTujuan || '',
        dinasId: data.dinasId !== null && data.dinasId !== undefined ? data.dinasId.toString() : '',
        namaKetuaRombongan: data.namaKetuaRombongan || '',
        jabatanKetuaRombongan: data.jabatanKetuaRombongan || '',
        jumlahPeserta: data.jumlahPeserta || '',
        rencanaMenginap: data.rencanaMenginap || '',
        namaHotel: data.namaHotel || '',
      });
      setSelectedDate(data.tanggalKunjungan || '');
    }
  }, [data, open]);

  if (!open) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="revisi-overlay active">
      <div className="revisi-dialog">
        <div className="revisi-dialog-header">
          <h3>Revisi Permohonan</h3>
          <button className="revisi-close" onClick={onClose}>✕</button>
        </div>
        <div className="revisi-body">
          {data?.keterangan && (
            <div style={{ background: '#F7F8FA', borderLeft: '3px solid #F0C040', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '13px', lineHeight: '1.6' }}>
              <strong>⚠ Alasan Penolakan Sebelumnya:</strong><br />
              {data.keterangan.replace('Revisi dari penolakan: ', '')}
            </div>
          )}

          <div className="form-title" style={{ marginTop: 0 }}>Pilih Tanggal Baru</div>
          <div className="cal-nav">
            <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }}>&#8249;</button>
            <span className="cal-month">{['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][month]} {year}</span>
            <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }}>&#8250;</button>
          </div>
          <div className="cal-grid">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="cal-day-header">{d}</div>)}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} className="cal-day empty" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const date = new Date(dateStr + 'T00:00:00');
              const dow = date.getDay();
              let cls = 'available';
              if (dow === 0 || dow === 6) cls = 'weekend';
              else if (date < minDate) cls = date < today ? 'past' : 'too-soon';
              const isSelected = selectedDate === dateStr;
              return (
                <div key={dateStr} className={`cal-day ${cls}${isSelected ? ' selected' : ''}`}
                  onClick={() => { if (cls === 'available') setSelectedDate(dateStr); }}>
                  {day}
                </div>
              );
            })}
          </div>
          {selectedDate && (
            <div style={{ marginTop: '10px', padding: '10px 14px', background: '#C5DBFF', borderLeft: '3px solid #0028B3', color: '#001178', borderRadius: '8px', fontSize: '12px' }}>
              Tanggal terpilih: <strong>{selectedDate}</strong>
            </div>
          )}

          <div className="form-title">Data Pemohon</div>
          <div className="form-grid">
            <div className="form-group"><label>Nomor Surat Resmi *</label><input type="text" value={form.nomorSurat || ''} onChange={e => setForm((f: any) => ({ ...f, nomorSurat: e.target.value }))} /></div>
            <div className="form-group"><label>Nama Pemohon/PIC *</label><input type="text" value={form.namaPic || ''} onChange={e => setForm((f: any) => ({ ...f, namaPic: e.target.value }))} /></div>
            <div className="form-group"><label>Instansi/Organisasi *</label><input type="text" value={form.instansi || ''} onChange={e => setForm((f: any) => ({ ...f, instansi: e.target.value }))} /></div>
            <div className="form-group"><label>Jabatan PIC *</label><input type="text" value={form.jabatanPic || ''} onChange={e => setForm((f: any) => ({ ...f, jabatanPic: e.target.value }))} /></div>
            <div className="form-group"><label>No. Telepon *</label><input type="text" value={form.noTelp || ''} onChange={e => setForm((f: any) => ({ ...f, noTelp: e.target.value }))} /></div>
            <div className="form-group"><label>Email *</label><input type="email" value={form.email || ''} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="form-grid full" style={{ marginTop: '14px' }}>
            <div className="form-group">
              <label>Dinas/Instansi yang Dituju *</label>
              <select 
                value={form.dinasId || ''} 
                onChange={e => {
                  const selectedId = e.target.value;
                  const selectedDinas = dinasList.find(d => d.id.toString() === selectedId);
                  setForm((f: any) => ({ 
                    ...f, 
                    dinasId: selectedId,
                    dinasTujuan: selectedDinas ? selectedDinas.nama : ''
                  }));
                }}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontFamily: 'inherit', outline: 'none', background: 'white' }}
              >
                <option value="">-- Pilih Dinas Tujuan --</option>
                {dinasList.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.nama} ({d.singkatan})</option>
                ))}
              </select>
              {form.dinasId && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#0028B3', fontWeight: '600' }}>
                  No. Telp Dinas: {dinasList.find(d => d.id.toString() === form.dinasId)?.nomor_telepon || '-'}
                </div>
              )}
            </div>
            <div className="form-group"><label>Deskripsi Tujuan/Maksud Kunjungan *</label><textarea value={form.tujuan || ''} onChange={e => setForm((f: any) => ({ ...f, tujuan: e.target.value }))} /></div>
          </div>
          <div className="form-grid" style={{ marginTop: '14px' }}>
            <div className="form-group"><label>Nama Ketua Rombongan *</label><input type="text" value={form.namaKetuaRombongan || ''} onChange={e => setForm((f: any) => ({ ...f, namaKetuaRombongan: e.target.value }))} /></div>
            <div className="form-group"><label>Jabatan Ketua Rombongan *</label><input type="text" value={form.jabatanKetuaRombongan || ''} onChange={e => setForm((f: any) => ({ ...f, jabatanKetuaRombongan: e.target.value }))} /></div>
          </div>

          <div className="form-title" style={{ marginTop: '20px' }}>Surat Pendukung (Opsional)</div>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>Kosongkan jika ingin mempertahankan file lama.</p>
          <div className="upload-pair">
            <div>
              <span className="upload-item-label">Surat Permohonan</span>
              <div className={`upload-area${file1 ? ' has-file' : ''}`} onClick={() => document.getElementById('revFile1')?.click()}>
                <input type="file" id="revFile1" style={{ display: 'none' }} accept=".pdf" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                      alert('Surat permohonan harus berformat PDF.');
                      return;
                    }
                    setFile1(f);
                  }
                }} />
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07L14.36 3.88a3.54 3.54 0 0 1 5 5L10.5 17.74a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </div>
                <div className="upload-text">
                  {file1 ? <strong style={{ color: '#0028B3' }}>{file1.name}</strong> : <><strong>Klik untuk upload</strong> (opsional)</>}
                </div>
              </div>
            </div>
            <div>
              <span className="upload-item-label">Daftar Pertanyaan</span>
              <div className={`upload-area${file2 ? ' has-file' : ''}`} onClick={() => document.getElementById('revFile2')?.click()}>
                <input type="file" id="revFile2" style={{ display: 'none' }} accept=".pdf" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                      alert('Daftar pertanyaan harus berformat PDF.');
                      return;
                    }
                    setFile2(f);
                  }
                }} />
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07L14.36 3.88a3.54 3.54 0 0 1 5 5L10.5 17.74a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </div>
                <div className="upload-text">
                  {file2 ? <strong style={{ color: '#0028B3' }}>{file2.name}</strong> : <><strong>Klik untuk upload</strong> (opsional)</>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="revisi-footer">
          <button className="btn-revisi-batal" onClick={onClose}>Batal</button>
          <button className="btn-revisi-kirim" disabled={!selectedDate} onClick={() => onSubmit({ ...form, tanggalKunjungan: selectedDate, file1, file2 })}>
            Kirim Revisi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Status() {
  const [searchParams] = useSearchParams();
  const kodeFromUrl = searchParams.get('kode') || '';
  const [kodeInput, setKodeInput] = useState(kodeFromUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showRevisi, setShowRevisi] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = useCallback((msg: any, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  const handleCek = useCallback(async (kodeTarget?: string) => {
    const target = (kodeTarget !== undefined ? kodeTarget : kodeInput).trim();
    if (!target) { showToast('Masukkan kode permohonan.', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.get(`/permohonan/${target.toUpperCase()}`);
      setResult(mapApiToResult(res.data.data, res.data.kontak));
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResult({ found: false });
      } else {
        showToast('Terjadi kesalahan sistem.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [kodeInput, showToast]);

  useEffect(() => {
    let isMounted = true;
    if (kodeFromUrl) {
      const fetchStatus = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/permohonan/${kodeFromUrl.toUpperCase()}`);
          if (!isMounted) return;
          setResult(mapApiToResult(res.data.data, res.data.kontak));
        } catch (err: any) {
          if (!isMounted) return;
          if (err.response?.status === 404) {
            setResult({ found: false });
          } else {
            showToast('Terjadi kesalahan sistem.', 'error');
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchStatus();
    }
    return () => {
      isMounted = false;
    };
  }, [kodeFromUrl, showToast]);

  const handleUploadBukti = useCallback(async (file: any) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('bukti_menginap', file);
      await api.post(`/permohonan/${result?.kode}/bukti-penginapan`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Bukti pemesanan berhasil diunggah!', 'success');
      handleCek();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengunggah bukti.', 'error');
    }
  }, [result?.kode, showToast, handleCek]);

  const handleOpenRevisi = useCallback(() => setShowRevisi(true), []);
  const handleCloseRevisi = useCallback(() => setShowRevisi(false), []);

  const handleRevisiSubmit = useCallback(async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('tanggal_kunjungan', data.tanggalKunjungan);
      formData.append('nomor_surat', data.nomorSurat);
      formData.append('nama_pic', data.namaPic);
      formData.append('instansi', data.instansi);
      formData.append('jabatan_pic', data.jabatanPic);
      formData.append('no_telp', data.noTelp);
      formData.append('email', data.email);
      formData.append('tujuan', data.tujuan);
      formData.append('dinas_id', data.dinasId);
      formData.append('nama_ketua_rombongan', data.namaKetuaRombongan);
      formData.append('jabatan_ketua_rombongan', data.jabatanKetuaRombongan);
      formData.append('jumlah_peserta', data.jumlahPeserta);
      formData.append('rencana_menginap', data.rencanaMenginap);
      if (data.rencanaMenginap === 'Ya') formData.append('nama_hotel', data.namaHotel || '');
      if (data.file1) formData.append('surat_permohonan', data.file1);
      if (data.file2) formData.append('daftar_pertanyaan', data.file2);

      await api.post(`/permohonan/${result?.kode}/revisi`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Revisi berhasil dikirim!', 'success');
      setShowRevisi(false);
      handleCek();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengirim revisi.', 'error');
    }
  }, [result?.kode, showToast, handleCek]);

  const handleReviewSubmitted = useCallback(() => handleCek(), [handleCek]);

  return (
    <PublicLayout>
      {/* Status-specific inline CSS additions */}
      <style>{`
        .card-header { padding:20px 24px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #E4E7ED; background:#fff; border-radius:16px 16px 0 0; }
        .card-header h3 { font-size:16px; font-weight:700; color:#001178; margin:0; letter-spacing:-0.2px; }
        .btn-outline-navy { background:#fff; border:1.5px solid #0028B3; color:#0028B3; padding:10px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .2s; width:100%; display:inline-flex; align-items:center; justify-content:center; }
        .btn-outline-navy:hover { background:#C5DBFF; color:#001178; }
        .revisi-overlay { position:fixed; inset:0; background:rgba(0,17,120,0.45); backdrop-filter:blur(4px); display:none; align-items:flex-start; justify-content:center; z-index:1000; padding:20px; overflow-y:auto; }
        .revisi-overlay.active { display:flex; }
        .revisi-dialog { background:white; border-radius:20px; max-width:680px; width:100%; box-shadow:var(--shadow-modal); margin:auto; border:1px solid #E4E7ED; overflow:hidden; }
        .revisi-dialog-header { padding:18px 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #E4E7ED; background:#0028B3; color:white; }
        .revisi-dialog-header h3 { font-size:16px; font-weight:700; }
        .revisi-close { background:rgba(255,255,255,0.15); border:none; color:white; width:32px; height:32px; border-radius:8px; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
        .revisi-close:hover { background:rgba(255,255,255,0.25); }
        .revisi-body { padding:24px; max-height:80vh; overflow-y:auto; }
        .revisi-footer { display:flex; gap:12px; padding:18px 24px; border-top:1px solid #E4E7ED; }
        .btn-revisi-batal { flex:none; background:#ffffff; color:#111827; border:1px solid #E4E7ED; border-radius:8px; padding:11px 20px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .btn-revisi-batal:hover { background:#F6F7FA; }
        .btn-revisi-kirim { flex:1; background:#0028B3; color:white; border:none; border-radius:8px; padding:11px; font-size:13.5px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .btn-revisi-kirim:hover { background:#001178; }
        .btn-revisi-kirim:disabled { background:#aaa; cursor:not-allowed; }
        .stepper { display:flex; align-items:flex-start; margin-bottom:32px; }
        .stepper-item { display:flex; flex-direction:column; align-items:center; text-align:center; flex:1; min-width:0; }
        .stepper-line { flex:0 0 40px; height:2px; background:#E4E7ED; margin-top:17px; }
        .stepper-line.done { background:#1883FF; }
        .stepper-title { font-size:13px; font-weight:700; margin-top:10px; color:#0F172A; }
        .stepper-date { font-size:11.5px; color:#64748B; margin-top:3px; }
        @media (max-width:560px) {
          .stepper-title { font-size:11px; } .stepper-date { font-size:9.5px; }
          .stepper-line { flex-basis:18px; margin-top:14px; }
        }
      `}</style>

      <div style={{ background: '#F6F7FA', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 64px' }}>

          {/* Search Card */}
          <div className="card">
            <div className="card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#0028B3' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <h3>Cek Status Permohonan</h3>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '16px', lineHeight: '1.6' }}>Masukkan kode permohonan yang Anda terima melalui email.</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: result ? '24px' : 0 }}>
                <input
                  type="text"
                  value={kodeInput}
                  onChange={e => setKodeInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleCek()}
                  placeholder="Contoh: KUNKER-20260808-84A12"
                  style={{ flex: 1, padding: '11px 14px', minHeight: '44px', border: '1px solid #D9DEE5', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '1px', color: '#0F172A' }}
                />
                <button
                  onClick={() => handleCek()}
                  className="btn btn-primary"
                  style={{ padding: '11px 24px', minHeight: '44px', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', background: '#0028B3', color: 'white', fontFamily: 'inherit', width: 'auto' }}
                >
                  {loading ? '...' : 'Cek'}
                </button>
              </div>

              {/* Result Area */}
              {result && !result.found && (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#6B7280' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '38px', height: '38px', color: '#C7CCD3', marginBottom: '14px', display: 'block', margin: '0 auto 14px' }}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" />
                  </svg>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '7px' }}>Permohonan Tidak Ditemukan</h3>
                  <p style={{ fontSize: '13px' }}>Pastikan kode permohonan yang Anda masukkan benar.</p>
                </div>
              )}

              {result && result.found && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />

                  {/* Header Result */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kode Permohonan</p>
                      <p style={{ fontSize: '17px', fontWeight: '800', color: '#001178', letterSpacing: '1px' }}>{result.kode}</p>
                    </div>
                    <span className={`status-badge ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
                  </div>

                  {/* Langkah Selanjutnya */}
                  <LangkahCard data={result} onRevisi={handleOpenRevisi} onUploadBukti={handleUploadBukti} />

                  {/* Ringkasan Hasil Kunjungan (PDF) Card */}
                  {(result.status === 'Selesai' || result.status === 'Ringkasan_Terkirim') && (
                    <RingkasanPdfCard result={result} />
                  )}

                  {/* Rating & Review Card */}
                  {(result.status === 'Selesai' || result.status === 'Ringkasan_Terkirim') && (
                    <RatingReviewCard
                      kode={result.kode}
                      reviewData={result.review}
                      onSubmitted={handleReviewSubmitted}
                      showToast={showToast}
                    />
                  )}

                  {/* Stepper (Alur 6 Langkah Dinamis) */}
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '18px' }}>Progres Permohonan</p>
                  <div className="stepper">
                    {/* Step 1: Diajukan */}
                    <div className="stepper-item">
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#0028B3', color: 'white' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L19 7" /></svg>
                      </div>
                      <div className="stepper-title">Diajukan</div>
                      <div className="stepper-date">{result.tglPengajuanAwal ? formatDateTime(result.tglPengajuanAwal) : '-'}</div>
                    </div>
                    <div className={`stepper-line${result.status !== 'Pending' ? ' done' : ''}`} />

                    {/* Step 2: Diproses / Review */}
                    {(() => {
                      const isPending = result.status === 'Pending';
                      const isRevisi = result.status === 'Revisi';
                      const bg = isPending ? '#B45309' : isRevisi ? '#6D28D9' : '#0028B3';
                      const title = isPending ? 'Menunggu Review' : isRevisi ? 'Revisi Dikirim' : 'Diproses';
                      const date = result.tglDiproses ? formatDateTime(result.tglDiproses) : result.tglRevisi ? formatDateTime(result.tglRevisi) : 'Dalam antrian review';
                      return (
                        <div className="stepper-item">
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg, color: '#fff' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2" /></svg>
                          </div>
                          <div className="stepper-title">{title}</div>
                          <div className="stepper-date">{date}</div>
                        </div>
                      );
                    })()}
                    <div className={`stepper-line${['Disetujui', 'Ditolak', 'Selesai', 'Ringkasan_Terkirim'].includes(result.status) ? ' done' : ''}`} />

                    {/* Step 3: Keputusan (Disetujui / Ditolak) */}
                    {(() => {
                      const isApproved = ['Disetujui', 'Selesai', 'Ringkasan_Terkirim'].includes(result.status);
                      const isRejected = result.status === 'Ditolak';
                      const bg = isApproved ? '#0028B3' : isRejected ? '#B91C1C' : '#E4E7ED';
                      const title = isApproved ? 'Disetujui' : isRejected ? 'Ditolak' : 'Keputusan Final';
                      const date = result.tglDisetujui ? formatDateTime(result.tglDisetujui) : result.tglDiproses ? formatDateTime(result.tglDiproses) : 'Belum diproses';
                      return (
                        <div className="stepper-item">
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg, color: '#fff' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {isApproved ? <path d="m5 12 5 5L19 7" /> : isRejected ? <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></> : <path d="M5 12h14" />}
                            </svg>
                          </div>
                          <div className="stepper-title">{title}</div>
                          <div className="stepper-date">{date}</div>
                        </div>
                      );
                    })()}
                    <div className={`stepper-line${['Selesai', 'Ringkasan_Terkirim'].includes(result.status) ? ' done' : ''}`} />

                    {/* Step 4: Selesai Kunjungan */}
                    {(() => {
                      const isFinished = ['Selesai', 'Ringkasan_Terkirim'].includes(result.status);
                      const isWaitingVisit = result.status === 'Disetujui';
                      const bg = isFinished ? '#0028B3' : isWaitingVisit ? '#B45309' : '#E4E7ED';
                      const title = isFinished ? 'Selesai' : isWaitingVisit ? 'Menunggu Kunjungan' : 'Pelaksanaan';
                      const date = result.tglSelesai ? formatDateTime(result.tglSelesai) : isWaitingVisit ? 'Sesuai jadwal' : 'Belum dilaksanakan';
                      return (
                        <div className="stepper-item">
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg, color: '#fff' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {isFinished ? <path d="m5 12 5 5L19 7" /> : <path d="M5 12h14" />}
                            </svg>
                          </div>
                          <div className="stepper-title">{title}</div>
                          <div className="stepper-date">{date}</div>
                        </div>
                      );
                    })()}
                    <div className={`stepper-line${(['Selesai', 'Ringkasan_Terkirim'].includes(result.status) && result.hasReview) ? ' done' : ''}`} />

                    {/* Step 5: Rating & Review */}
                    {(() => {
                      const hasReview = result.hasReview;
                      const isSelesaiStage = ['Selesai', 'Ringkasan_Terkirim'].includes(result.status);
                      const bg = hasReview ? '#0028B3' : isSelesaiStage ? '#B45309' : '#E4E7ED';
                      const title = hasReview ? 'Rating & Review' : isSelesaiStage ? 'Menunggu Review' : 'Rating & Review';
                      const date = result.tglReview ? formatDateTime(result.tglReview) : hasReview ? 'Selesai' : isSelesaiStage ? 'Belum diisi' : 'Belum tersedia';
                      return (
                        <div className="stepper-item">
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg, color: '#fff' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {hasReview ? <path d="m5 12 5 5L19 7" /> : <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />}
                            </svg>
                          </div>
                          <div className="stepper-title">{title}</div>
                          <div className="stepper-date">{date}</div>
                        </div>
                      );
                    })()}
                    <div className={`stepper-line${result.pdf_ready ? ' done' : ''}`} />

                    {/* Step 6: Ringkasan Hasil Kunjungan */}
                    {(() => {
                      // pdf_ready adalah satu-satunya gate — true hanya jika PDF sudah diupload
                      const isReady = !!(result.pdf_ready);
                      const isWaitingSummary = result.hasReview && ['Selesai', 'Ringkasan_Terkirim'].includes(result.status) && !isReady;
                      const bg = isReady ? '#0028B3' : isWaitingSummary ? '#B45309' : '#E4E7ED';
                      const title = isReady ? 'Ringkasan Tersedia' : isWaitingSummary ? 'Menunggu Ringkasan' : 'Ringkasan PDF';
                      const date = result.ringkasanSentAt ? formatDateTime(result.ringkasanSentAt) : isReady ? 'Dokumen tersedia' : isWaitingSummary ? 'Dalam proses admin' : 'Belum tersedia';
                      return (
                        <div className="stepper-item">
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg, color: '#fff' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {isReady ? <path d="m5 12 5 5L19 7" /> : <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />}
                            </svg>
                          </div>
                          <div className="stepper-title">{title}</div>
                          <div className="stepper-date">{date}</div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Detail Grid */}
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#222222', marginBottom: '18px' }}>Informasi Permohonan</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 16px', marginBottom: '24px' }}>
                    {[
                      ['NAMA PEMOHON/PIC (PENANGGUNG JAWAB)', result.namaPic || '-'],
                      ['JABATAN/POSISI PIC (PENANGGUNG JAWAB)', result.jabatanPic || '-'],
                      ['INSTANSI', result.instansi || '-'],
                      ['NAMA KETUA ROMBONGAN', result.namaKetuaRombongan || '-'],
                      ['JABATAN KETUA ROMBONGAN', result.jabatanKetuaRombongan || '-'],
                      ['NO. TELEPON', result.noTelp || '-'],
                      ['EMAIL', result.email || '-'],
                      ['NOMOR SURAT', result.nomorSurat || '-'],
                      ['TANGGAL KUNJUNGAN', formatTanggal(result.tanggalKunjungan)],
                      ['JUMLAH PESERTA', result.jumlahPeserta ? result.jumlahPeserta + ' orang' : '-'],
                      ['RENCANA MENGINAP', result.rencanaMenginap || '-'],
                      ['NARASUMBER/PENERIMA & JADWAL', result.narasumber || '-'],
                      ['JAM PENERIMAAN KUNJUNGAN', result.jamPenerimaan ? result.jamPenerimaan + ' WIB' : '-'],
                      ['', null],
                      ['DINAS TUJUAN', result.dinasTujuan || '-'],
                      ['DESKRIPSI TUJUAN/MAKSUD', result.tujuan || '-'],
                      ['', null],
                      ['SURAT PERMOHONAN', result.linkSurat1 ? <a href={result.linkSurat1} target="_blank" rel="noreferrer" style={{color: '#0028B3', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Lihat Surat</a> : '-'],
                      ['SURAT DAFTAR PERTANYAAN', result.linkSurat2 ? <a href={result.linkSurat2} target="_blank" rel="noreferrer" style={{color: '#0028B3', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Lihat Surat</a> : '-'],
                      ['TGL PENGAJUAN', result.tglPengajuanAwal ? formatDateTime(result.tglPengajuanAwal) : '-'],
                      ['TGL DIPROSES', result.tglDiproses ? formatDateTime(result.tglDiproses) : '-']
                    ].map(([label, value], i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', visibility: label ? 'visible' : 'hidden' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                        <span style={{ fontSize: '13px', color: '#222222', fontWeight: '500' }}>{value || '-'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kontak Box */}
                  <div style={{ background: '#F7F8FA', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span style={{ fontSize: '12.5px', color: '#222222' }}>
                      <strong>Kontak yang dapat dihubungi:</strong> {result.kontak ? `${result.kontak.nomor_telepon} (${result.kontak.nama_pic})` : '-'}
                    </span>
                  </div>

                  {/* Keterangan Admin */}
                  {result.keterangan && result.status !== 'Revisi' && (
                    <div style={{ borderRadius: '8px', padding: '12px 14px', marginTop: '14px', fontSize: '13px', lineHeight: '1.6', background: '#F7F8FA', borderLeft: `3px solid ${result.status === 'Ditolak' ? '#B91C1C' : result.status === 'Disetujui' ? '#0028B3' : '#6D28D9'}` }}>
                      <strong>Keterangan Admin:</strong><br />{result.keterangan}
                    </div>
                  )}

                  {/* Tips */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#F7F8FA', borderRadius: '10px', padding: '14px 16px', marginTop: '24px', fontSize: '12.5px', color: '#6B7280', lineHeight: '1.6' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px' }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <div><strong>Tips:</strong> Simpan kode permohonan Anda untuk memantau status kapan saja.</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revisi Dialog */}
      <RevisiDialog
        open={showRevisi}
        data={result}
        onClose={handleCloseRevisi}
        onSubmit={handleRevisiSubmit}
      />

      {/* Toast */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '11px 18px', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '500', zIndex: 9999, maxWidth: '320px', boxShadow: '0 4px 16px rgba(0,17,120,0.18)', background: toast.type === 'error' ? '#B91C1C' : '#001178' }}>
          {toast.msg}
        </div>
      )}
    </PublicLayout>
  );
}

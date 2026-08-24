import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import api from '../services/api';
import { loadRecaptchaScript, resetRecaptchaPromise } from '../services/recaptcha';


// ---- Static Constants (keluar dari komponen agar tidak dibuat ulang setiap render) ----
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const STAR_NUMBERS = [1, 2, 3, 4, 5];
const DROPDOWN_OPTIONS = [{ value: 'Ya', label: 'Ya' }, { value: 'Tidak', label: 'Tidak' }];
const STEP_LABELS = ['Pilih Tanggal', 'Data Pemohon', 'Konfirmasi', 'Detail Kunjungan'];
const LEGEND_DOT_STYLE_TERSEDIA = { background: '#C5DBFF', border: '1.5px solid #1883FF' };
const LEGEND_DOT_STYLE_USER_BOOKED = { background: '#FEF3C7', border: '1.5px solid #F59E0B' };
const LEGEND_DOT_STYLE_TERPAKAI = { background: '#FEE2E2', border: '1.5px solid #B91C1C' };
const LEGEND_DOT_STYLE_TIDAK = { background: '#F1F3F6', border: '1.5px solid #9CA3AF' };
const INITIAL_FORM = {
  instansi: '', namaPic: '', jabatanPic: '',
  noTelp: '', email: '', tujuan: '', dinasId: '', dinasTujuan: '', namaKetuaRombongan: '',
  jabatanKetuaRombongan: '', jumlahPeserta: '', rencanaMenginap: '', namaHotel: '', nomorSurat: '',
};
// Style pesan validasi inline
const ERR_MSG_STYLE: React.CSSProperties = { color: '#B91C1C', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' };
// Urutan field yang akan digulung saat ada error pertama
const FIELD_ORDER = ['nomorSurat', 'namaPic', 'instansi', 'jabatanPic', 'noTelp', 'email', 'dinasId', 'tujuan', 'namaKetuaRombongan', 'jabatanKetuaRombongan', 'jumlahPeserta', 'rencanaMenginap', 'namaHotel', 'file1', 'file2'];

function formatDate(date: any) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(s: any) {
  if (!s) return '-';
  const [y, m, d] = s.split('-');
  return `${parseInt(d)} ${MONTHS_ID[parseInt(m) - 1]} ${y}`;
}

// ---- Calendar Component — React.memo untuk isolasi dari re-render form ----
const Calendar = memo(function Calendar({ busyDates, selectedDate, onSelect, minDateStr, userBookedDates = [] }: any) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => formatDate(today), [today]);
  const minDate = useMemo(() => {
    if (minDateStr) {
      const [y, m, d] = minDateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDateStr]);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const prevMonth = useCallback(() => {
    setViewDate(d => {
      const next = new Date(d);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate(d => {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const getDayClass = useCallback((dateStr: string, dayOfWeek: number) => {
    const date = new Date(dateStr + 'T00:00:00');
    // Hari sudah lewat — selalu tampilkan sebagai past terlepas dari status lain
    if (date < today) return 'past';
    // Akhir pekan — tidak tersedia
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend';
    // Sudah diajukan oleh email yang sedang digunakan — PRIORITAS UTAMA sebelum busy/too-soon/available
    if (userBookedDates.includes(dateStr)) return 'user-booked';
    // Slot penuh — tampilkan merah
    if (busyDates.includes(dateStr)) return 'busy';
    // Terlalu dekat (H+7 belum terpenuhi)
    if (date < minDate) return 'too-soon';
    return 'available';
  }, [userBookedDates, busyDates, minDate, today]);

  return (
    <div className="card">
      <div className="card-header cal-card-header">
        <h3>Jadwal Ketersediaan</h3>
      </div>
      <div className="card-body">
        <div className="cal-nav">
          <button onClick={prevMonth}>&#8249;</button>
          <span className="cal-month">{MONTHS_ID[month]} {year}</span>
          <button onClick={nextMonth}>&#8250;</button>
        </div>
        <div className="cal-grid">
          {DAYS_ID.map(d => <div key={d} className="cal-day-header">{d}</div>)}
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="cal-day empty" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dow = new Date(dateStr + 'T00:00:00').getDay();
            const cls = getDayClass(dateStr, dow);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            return (
              <CalendarDay
                key={dateStr}
                dateStr={dateStr}
                day={day}
                cls={cls}
                isSelected={isSelected}
                isToday={isToday}
                onSelect={onSelect}
              />
            );
          })}
        </div>
        <div className="cal-legend">
          <div className="legend-item">
            <div className="legend-dot" style={LEGEND_DOT_STYLE_TERSEDIA} />
            <span>Tersedia</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={LEGEND_DOT_STYLE_USER_BOOKED} />
            <span>Sudah diajukan oleh Anda</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={LEGEND_DOT_STYLE_TERPAKAI} />
            <span>Terpakai (Penuh)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={LEGEND_DOT_STYLE_TIDAK} />
            <span>Tidak Tersedia</span>
          </div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '12px', lineHeight: '1.6' }}>
          Maks. <strong>2 kunjungan/hari</strong>. Pengajuan minimal <strong>7 hari</strong> sebelum tanggal kunjungan.
        </p>
      </div>
    </div>
  );
});

// CalendarDay diisolasi agar hanya hari yang berubah yang re-render
const CalendarDay = memo(function CalendarDay({ dateStr, day, cls, isSelected, isToday, onSelect }: any) {
  const isDisabled = cls !== 'available';
  const handleClick = useCallback(() => {
    if (cls === 'available') onSelect(dateStr);
  }, [cls, dateStr, onSelect]);

  const title = cls === 'busy'
    ? 'Tanggal ini sudah penuh (maksimal 2 kunjungan kerja)'
    : cls === 'user-booked'
    ? 'Anda sudah memiliki pengajuan pada tanggal ini'
    : undefined;

  return (
    <div
      className={`cal-day ${cls}${isSelected && cls !== 'user-booked' ? ' selected' : ''}${isToday ? ' today' : ''}`}
      onClick={handleClick}
      title={title}
    >
      {day}
    </div>
  );
});

// ---- Step Indicator — React.memo agar tidak re-render saat form berubah ----
const StepIndicator = memo(function StepIndicator({ step }: any) {
  return (
    <div className="step-indicator" id="stepIndicator">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const isActive = n === step;
        const isDone = n < step;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
            <div className="step" style={{ gap: '7px' }}>
              <div className={`step-num${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>{n}</div>
              <span className={`step-label${isActive ? ' active' : ''}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className={`step-line${isDone ? ' done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
});

// ---- Custom Dropdown — React.memo + useCallback ----
const CustomDropdown = memo(function CustomDropdown({ value, onChange, error }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = useMemo(() => DROPDOWN_OPTIONS.find(o => o.value === value), [value]);
  const toggleOpen = useCallback(() => setOpen(v => !v), []);

  return (
    <div className={`custom-select${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger${error ? ' error' : ''}`}
        onClick={toggleOpen}
      >
        {selected
          ? <span>{selected.label}</span>
          : <span className="custom-select-placeholder">Pilih...</span>
        }
        <svg className="custom-select-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="custom-select-options">
        {DROPDOWN_OPTIONS.map(o => (
          <DropdownOption
            key={o.value}
            option={o}
            isSelected={value === o.value}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        ))}
      </div>
    </div>
  );
});

const DropdownOption = memo(function DropdownOption({ option, isSelected, onChange, onClose }: any) {
  const handleClick = useCallback(() => {
    onChange(option.value);
    onClose();
  }, [onChange, onClose, option.value]);

  return (
    <div
      className={`custom-select-option${isSelected ? ' selected' : ''}`}
      onClick={handleClick}
    >
      {option.label}
    </div>
  );
});

// ---- Upload Area — React.memo ----
const UploadArea = memo(function UploadArea({ file, onChange, error, id }: any) {
  const handleClick = useCallback(() => {
    document.getElementById(id)?.click();
  }, [id]);

  return (
    <div
      className={`upload-area${file ? ' has-file' : ''}${error ? ' error' : ''}`}
      onClick={handleClick}
    >
      <input
        type="file"
        id={id}
        style={{ display: 'none' }}
        accept=".pdf"
        onChange={onChange}
      />
      <div className="upload-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07L14.36 3.88a3.54 3.54 0 0 1 5 5L10.5 17.74a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </div>
      <div className="upload-text"><strong>Klik untuk upload</strong><br />PDF (Maks. 10 MB)</div>
      {file && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#0028B3', fontWeight: '600' }}>{file.name}</div>
      )}
    </div>
  );
});

// ---- Disclaimer Modal — React.memo ----
const DisclaimerModal = memo(function DisclaimerModal({ open, onClose }: any) {
  const [checked, setChecked] = useState(false);
  const handleCheck = useCallback((e: any) => setChecked(e.target.checked), []);
  return (
    <div className={`modal-overlay${open ? ' active' : ''}`}>
      <div className="modal">
        <div className="modal-header">
          <h3>Ketentuan Kunjungan Kerja</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '12.5px', color: 'var(--text-sub)', marginBottom: '12px', lineHeight: '1.6' }}>
            Sebelum mengajukan permohonan, harap baca dan pahami ketentuan berikut:
          </p>
          <ol className="disclaimer-list">
            <li>Kunjungan kerja dilaksanakan pada hari Senin s.d. Jum'at.</li>
            <li>Surat permohonan disampaikan paling lambat 7 hari sebelum kegiatan.</li>
            <li>Kunjungan lebih dari 1 hari <strong>WAJIB MENGINAP di hotel wilayah Kabupaten Bogor.</strong></li>
            <li>Pelanggaran ketentuan mengakibatkan permohonan tidak dapat diterima.</li>
          </ol>
          <label className="disclaimer-check">
            <input type="checkbox" checked={checked} onChange={handleCheck} />
            <span>Saya telah membaca dan memahami ketentuan kunjungan kerja di atas.</span>
          </label>
          <div className="modal-actions">
            <button className="btn-primary" disabled={!checked} onClick={onClose}>Lanjutkan</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---- Info Menginap Modal — React.memo ----
const InfoMenginapModal = memo(function InfoMenginapModal({ open, onClose }: any) {
  const [checked, setChecked] = useState(false);
  const handleCheck = useCallback((e: any) => setChecked(e.target.checked), []);
  return (
    <div className={`modal-overlay${open ? ' active' : ''}`}>
      <div className="modal">
        <div className="modal-header">
          <h3>Info Rencana Menginap</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-main)' }}>
            Karena Anda berencana menginap, setelah permohonan <strong>disetujui</strong>, Anda wajib mengunggah{' '}
            <strong>bukti pemesanan akomodasi</strong> (hotel/penginapan di wilayah Kabupaten Bogor).
          </p>
          <label className="disclaimer-check">
            <input type="checkbox" checked={checked} onChange={handleCheck} />
            <span>Saya mengerti dan akan menyiapkan bukti pemesanan penginapan.</span>
          </label>
          <div className="modal-actions">
            <button className="btn-primary" disabled={!checked} onClick={onClose}>Mengerti</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---- Konfirmasi Kirim Modal — React.memo ----
const KonfirmasiKirimModal = memo(function KonfirmasiKirimModal({ open, onYes, onNo, loading }: any) {
  if (!open) return null;
  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="konfirmasi-kirim-title">
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 id="konfirmasi-kirim-title">Konfirmasi Permohonan</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', margin: 0 }}>
            Apakah semua data dan dokumen yang diisi sudah benar?
          </p>
          <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
            <button className="btn-outline" onClick={onNo} disabled={loading} style={{ flex: 1 }}>Tidak</button>
            <button className="btn-primary" onClick={onYes} disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Mengirim...' : 'Ya'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---- Google reCAPTCHA v2 — React.memo ----
const RecaptchaModal = memo(function RecaptchaModal({ open, onVerified, onClose, loading }: any) {
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const renderingRef = useRef(false);
  const onVerifiedRef = useRef(onVerified);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [captchaError, setCaptchaError] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  const initCaptcha = useCallback(() => {
    if (!open || !siteKey) return;
    let isSubscribed = true;
    setCaptchaError('');

    loadRecaptchaScript()
      .then(() => {
        if (!isSubscribed || !captchaRef.current || !window.grecaptcha) return;
        window.grecaptcha.ready(() => {
          if (!isSubscribed || !captchaRef.current || !window.grecaptcha) return;
          if (renderingRef.current || captchaRef.current.children.length > 0) {
            if (widgetIdRef.current !== null) {
              try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
            }
            return;
          }
          renderingRef.current = true;
          try {
            const id = window.grecaptcha.render(captchaRef.current, {
              sitekey: siteKey,
              callback: (token: string) => { onVerifiedRef.current(token); },
              'expired-callback': () => {
                if (widgetIdRef.current !== null && window.grecaptcha) {
                  try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
                }
              },
              'error-callback': () => {
                setCaptchaError('reCAPTCHA tidak dapat dimuat. Periksa koneksi internet Anda lalu coba lagi.');
              },
            });
            widgetIdRef.current = id;
          } catch {
            setCaptchaError('reCAPTCHA gagal dimuat. Pastikan site key terdaftar untuk domain ini.');
          } finally {
            renderingRef.current = false;
          }
        });
      })
      .catch((err: any) => {
        if (isSubscribed) {
          setCaptchaError(err.message || 'Skrip reCAPTCHA tidak dapat dimuat. Periksa koneksi internet Anda.');
        }
      });

    return () => { isSubscribed = false; };
  }, [open, siteKey]);

  useEffect(() => {
    const cleanup = initCaptcha();
    return () => { if (cleanup) cleanup(); };
  }, [initCaptcha]);

  useEffect(() => {
    if (!open) {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
      }
      widgetIdRef.current = null;
      renderingRef.current = false;
      setCaptchaError('');
    }
  }, [open]);

  const handleRetry = useCallback(() => {
    resetRecaptchaPromise();
    setRetrying(true);
    setCaptchaError('');
    initCaptcha();
    setTimeout(() => setRetrying(false), 500);
  }, [initCaptcha]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="recaptcha-title">
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 id="recaptcha-title">Verifikasi Keamanan</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-sub)', marginBottom: '18px' }}>
            Silakan selesaikan verifikasi reCAPTCHA sebelum mengirim permohonan.
          </p>
          {siteKey ? (
            <div ref={captchaRef} style={{ minHeight: '78px' }} />
          ) : (
            <p style={{ fontSize: '13px', color: '#B91C1C' }}>reCAPTCHA belum dikonfigurasi.</p>
          )}
          {captchaError && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#B91C1C', lineHeight: '1.5', marginBottom: '8px' }}>
                {captchaError}
              </p>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '12px', padding: '4px 12px' }}
                onClick={handleRetry}
                disabled={retrying}
              >
                {retrying ? 'Memuat...' : 'Coba Lagi'}
              </button>
            </div>
          )}
          <div className="modal-actions" style={{ marginTop: '18px' }}>
            <button className="btn-outline" onClick={handleClose} disabled={loading}>
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---- Main Page ----
export default function Permohonan() {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showInfoMenginap, setShowInfoMenginap] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [submittedKode, setSubmittedKode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Salin');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadRecaptchaScript().catch(() => {});
  }, []);

  const [form, setForm] = useState<any>(INITIAL_FORM);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [busyDates, setBusyDates] = useState<any[]>([]);
  const [minDateStr, setMinDateStr] = useState<string>('');
  const [userBookedDates, setUserBookedDates] = useState<string[]>([]);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [dinasList, setDinasList] = useState<any[]>([]);

  useEffect(() => {
    api.get('/dinas')
      .then(res => {
        if (res.data.success) {
          setDinasList(res.data.data);
        }
      })
      .catch(err => console.error('Gagal mengambil daftar dinas:', err));
  }, []);

  const showToast = useCallback((msg: any, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const params: any = {};
    // Tangkap emailParam di closure — digunakan untuk memutuskan apakah perlu update userBookedDates
    const emailParam = (form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      ? form.email.trim()
      : null;

    if (emailParam) {
      params.email = emailParam;
    } else {
      // Email kosong/tidak valid — langsung reset user-booked agar tidak ada sisa data email lama
      setUserBookedDates([]);
    }

    api.get('/permohonan/tanggal-terpakai', { params, signal: controller.signal })
      .then(res => {
        setBusyDates(res.data.data || []);
        if (res.data.min_date) {
          setMinDateStr(res.data.min_date);
        }
        // Hanya update userBookedDates jika request dikirim dengan email valid.
        // Jika request dikirim tanpa email (saat mengetik sebagian email), abaikan user_booked_dates
        // dari response ini agar tidak menimpa data yang sudah benar.
        if (emailParam) {
          const booked: string[] = res.data.user_booked_dates || [];
          setUserBookedDates(booked);
          // Batalkan pilihan tanggal jika ternyata sudah pernah diajukan oleh email ini
          setSelectedDate(prev => (prev && booked.includes(prev) ? '' : prev));
        }
      })
      .catch(err => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Gagal mengambil jadwal:', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [form.email]);

  const handleDateSelect = useCallback((dateStr: any) => {
    setSelectedDate(dateStr);
    setStep(2);
  }, []);

  const handleRencanaMenginap = useCallback((val: any) => {
    setForm((f: any) => ({ ...f, rencanaMenginap: val }));
    if (val === 'Ya') setShowInfoMenginap(true);
    else setShowInfoMenginap(false);
  }, []);

  const handleCloseDisclaimer = useCallback(() => setShowDisclaimer(false), []);
  const handleCloseInfoMenginap = useCallback(() => setShowInfoMenginap(false), []);
  const handleCloseSubmitConfirm = useCallback(() => setShowSubmitConfirm(false), []);
  const handleCloseRecaptcha = useCallback(() => setShowRecaptcha(false), []);
  const handleYesSubmitConfirm = useCallback(() => {
    setShowSubmitConfirm(false);
    setShowRecaptcha(true);
  }, []);

  // Helper: hapus error satu field tertentu
  const clearError = useCallback((field: string) => {
    setErrors((prev: any) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFile1Change = useCallback((e: any) => {
    const f = e.target.files[0];
    if (f) {
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        showToast('Surat permohonan harus berformat PDF.', 'error');
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        showToast('Ukuran file maksimal 10 MB.', 'error');
        return;
      }
      setFile1(f);
      clearError('file1');
    }
  }, [showToast, clearError]);

  const handleFile2Change = useCallback((e: any) => {
    const f = e.target.files[0];
    if (f) {
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        showToast('Daftar pertanyaan harus berformat PDF.', 'error');
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        showToast('Ukuran file maksimal 10 MB.', 'error');
        return;
      }
      setFile2(f);
      clearError('file2');
    }
  }, [showToast, clearError]);

  const validate = useCallback(() => {
    const e: any = {};
    if (!form.nomorSurat) e.nomorSurat = 'Nomor Surat Resmi wajib diisi.';
    if (!form.namaPic) e.namaPic = 'Nama Pemohon/PIC wajib diisi.';
    if (!form.instansi) e.instansi = 'Instansi/Organisasi wajib diisi.';
    if (!form.jabatanPic) e.jabatanPic = 'Jabatan/Posisi PIC wajib diisi.';
    if (!form.noTelp) e.noTelp = 'Nomor Telepon wajib diisi.';
    else if (form.noTelp.replace(/\D/g, '').length < 10) e.noTelp = 'Nomor Telepon tidak valid (min 10 digit).';
    if (!form.email) e.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.dinasId) e.dinasId = 'Dinas/Instansi yang Dituju wajib diisi.';
    if (!form.tujuan) e.tujuan = 'Deskripsi Tujuan/Maksud Kunjungan wajib diisi.';
    if (!form.namaKetuaRombongan) e.namaKetuaRombongan = 'Nama Ketua Rombongan wajib diisi.';
    if (!form.jabatanKetuaRombongan) e.jabatanKetuaRombongan = 'Jabatan Ketua Rombongan wajib diisi.';
    if (!form.jumlahPeserta) e.jumlahPeserta = 'Jumlah Peserta wajib diisi.';
    if (!form.rencanaMenginap) e.rencanaMenginap = 'Silakan pilih apakah ada rencana menginap.';
    if (form.rencanaMenginap === 'Ya' && !form.namaHotel) e.namaHotel = 'Nama Hotel/Penginapan wajib diisi.';
    if (!file1) e.file1 = 'Surat Permohonan Kunjungan Kerja belum diupload.';
    if (!file2) e.file2 = 'Daftar Pertanyaan belum diupload.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, file1, file2]);

  const goToKonfirmasi = useCallback(() => {
    if (validate()) {
      setStep(3);
    } else {
      // Scroll ke field pertama yang error
      setTimeout(() => {
        for (const field of FIELD_ORDER) {
          const el = document.getElementById(`field-${field}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const input = el.querySelector('input, textarea, select') as HTMLElement | null;
            if (input) input.focus();
            break;
          }
        }
      }, 50);
    }
  }, [validate]);

  const handleGoToStep1 = useCallback(() => setStep(1), []);
  const handleGoToStep2 = useCallback(() => setStep(2), []);
  const handleOpenSubmitConfirm = useCallback(() => setShowSubmitConfirm(true), []);

  const copyKode = useCallback(() => {
    navigator.clipboard.writeText(submittedKode).then(() => {
      setCopyLabel('Tersalin!');
      setTimeout(() => setCopyLabel('Salin'), 2000);
    });
  }, [submittedKode]);

  const submitPermohonan = useCallback(async (recaptchaToken: string) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tanggal_kunjungan', selectedDate);
      formData.append('nomor_surat', form.nomorSurat);
      formData.append('nama_pic', form.namaPic);
      formData.append('instansi', form.instansi);
      formData.append('jabatan_pic', form.jabatanPic);
      formData.append('no_telp', form.noTelp);
      formData.append('email', form.email);
      formData.append('tujuan', form.tujuan);
      formData.append('dinas_id', form.dinasId);
      formData.append('nama_ketua_rombongan', form.namaKetuaRombongan);
      formData.append('jabatan_ketua_rombongan', form.jabatanKetuaRombongan);
      formData.append('jumlah_peserta', form.jumlahPeserta);
      formData.append('rencana_menginap', form.rencanaMenginap);
      formData.append('recaptcha_token', recaptchaToken);
      if (form.rencanaMenginap === 'Ya') formData.append('nama_hotel', form.namaHotel);
      formData.append('surat_permohonan', file1 as Blob);
      formData.append('daftar_pertanyaan', file2 as Blob);

      const res = await api.post('/permohonan', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowSubmitConfirm(false);
      setShowRecaptcha(false);
      setSubmittedKode(res.data.data.kode);
      setStep(4);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errData = err.response.data.errors || {};
        if (errData.recaptcha_token) {
          setShowRecaptcha(false);
          setShowSubmitConfirm(true);
          alert(errData.recaptcha_token[0] || 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.');
          return;
        }
        const newErrors: any = {};
        if (errData.nomor_surat) newErrors.nomorSurat = true;
        if (errData.nama_pic) newErrors.namaPic = true;
        if (errData.instansi) newErrors.instansi = true;
        if (errData.jabatan_pic) newErrors.jabatanPic = true;
        if (errData.no_telp) newErrors.noTelp = true;
        if (errData.email) newErrors.email = true;
        if (errData.tujuan) newErrors.tujuan = true;
        if (errData.dinas_id) newErrors.dinasId = true;
        if (errData.nama_ketua_rombongan) newErrors.namaKetuaRombongan = true;
        if (errData.jabatan_ketua_rombongan) newErrors.jabatanKetuaRombongan = true;
        if (errData.jumlah_peserta) newErrors.jumlahPeserta = true;
        if (errData.rencana_menginap) newErrors.rencanaMenginap = true;
        if (errData.nama_hotel) newErrors.namaHotel = true;
        if (errData.surat_permohonan) newErrors.file1 = true;
        if (errData.daftar_pertanyaan) newErrors.file2 = true;
        setErrors(newErrors);
        setShowSubmitConfirm(false);
        setShowRecaptcha(false);
        alert('Mohon periksa kembali form anda. ' + err.response.data.message);
        setStep(2);
      } else {
        alert('Terjadi kesalahan sistem. Silakan coba lagi nanti.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [selectedDate, form, file1, file2]);

  // Bypass reCAPTCHA di localhost/development — useEffect ini harus di BAWAH submitPermohonan
  useEffect(() => {
    if (!showRecaptcha) return;
    const isDev = import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isDev) {
      setShowRecaptcha(false);
      submitPermohonan('dev-bypass');
    }
  }, [showRecaptcha, submitPermohonan]);

  const handleGoToStatus = useCallback(() => {
    navigate('/status?kode=' + submittedKode);
  }, [navigate, submittedKode]);

  const handleResetForm = useCallback(() => {
    setStep(1);
    setSelectedDate('');
    setSubmittedKode('');
    setForm(INITIAL_FORM);
    setFile1(null);
    setFile2(null);
  }, []);

  return (
    <PublicLayout>
      <DisclaimerModal open={showDisclaimer} onClose={handleCloseDisclaimer} />
      <InfoMenginapModal open={showInfoMenginap} onClose={handleCloseInfoMenginap} />
      <KonfirmasiKirimModal open={showSubmitConfirm} onYes={handleYesSubmitConfirm} onNo={handleCloseSubmitConfirm} loading={submitting} />
      <RecaptchaModal open={showRecaptcha} onVerified={submitPermohonan} onClose={handleCloseRecaptcha} loading={submitting} />

      <div style={{ background: 'var(--gray-bg)', minHeight: 'calc(100vh - 80px)' }}>
        {/* Step 4: Sukses */}
        {step === 4 ? (
          <div style={{ maxWidth: '580px', margin: '0 auto', padding: '48px 20px 64px' }}>
            <div className="card">
              <div className="card-body" style={{ padding: '36px 32px' }}>
                <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
                  <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#C5DBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,40,179,0.15)' }}>
                      <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#0028B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="M22 4 12 14.01l-3-3" />
                      </svg>
                    </div>
                  </div>
                  <h3 style={{ color: '#001178', marginBottom: '10px', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px' }}>Permohonan Berhasil Diajukan!</h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-sub)', lineHeight: '1.7', marginBottom: '24px' }}>
                    Simpan kode permohonan Anda untuk memantau status. Konfirmasi telah dikirim ke email Anda.
                  </p>
                  <div className="kode-wrapper">
                    <div className="kode-box">{submittedKode}</div>
                    <button className="btn-copy-kode" onClick={copyKode}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      {copyLabel}
                    </button>
                  </div>
                </div>
                <div className="modal-actions" style={{ gap: '12px' }}>
                  <button className="btn-primary" onClick={handleGoToStatus}>
                    Pantau Status Permohonan
                  </button>
                  <button className="btn-outline" onClick={handleResetForm}>
                    Ajukan Permohonan Lain
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="layout-grid">
            {/* Kalender — terisolasi via React.memo, tidak ikut render saat form berubah */}
            {/* key berubah saat userBookedDates berubah isinya → memaksa remount Calendar */}
            <div id="calendarColumn">
              <Calendar
                key={userBookedDates.join(',')}
                busyDates={busyDates}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                minDateStr={minDateStr}
                userBookedDates={userBookedDates}
              />
            </div>

            {/* Form */}
            <div>
              <div className="card">
                <div className="card-header form-card-header" id="formCardHeader">
                  <h3>Form Pengajuan Kunjungan Kerja</h3>
                </div>
                <div className="card-body">
                  <StepIndicator step={step} />

                  {/* Step 1 */}
                  {step === 1 && (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-sub)' }}>
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#C5DBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,40,179,0.1)' }}>
                          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#0028B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                        </div>
                      </div>
                      <h3 style={{ color: '#001178', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>Pilih Tanggal Kunjungan</h3>
                      <p style={{ fontSize: '13.5px', lineHeight: '1.7' }}>Klik tanggal yang <strong style={{ color: '#0028B3' }}>tersedia</strong> pada kalender di sebelah untuk memulai pengajuan.</p>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div>
                      <div className="selected-date-display">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0028B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <span>Tanggal terpilih: <strong>{formatDisplayDate(selectedDate)}</strong></span>
                      </div>

                      <div className="form-title">Data Pemohon</div>
                      <div className="form-grid">
                        <div className="form-group" id="field-nomorSurat">
                          <label>Nomor Surat Resmi *</label>
                          <input type="text" className={errors.nomorSurat ? 'error' : ''} value={form.nomorSurat} onChange={e => { setForm((f: any) => ({ ...f, nomorSurat: e.target.value })); if (e.target.value) clearError('nomorSurat'); }} placeholder="001/ORG/XII/2024" />
                          {errors.nomorSurat && <p style={ERR_MSG_STYLE}>⚠ {errors.nomorSurat}</p>}
                        </div>
                        <div className="form-group" id="field-namaPic">
                          <label>Nama Pemohon/PIC (Penanggung Jawab) *</label>
                          <input type="text" className={errors.namaPic ? 'error' : ''} value={form.namaPic} onChange={e => { setForm((f: any) => ({ ...f, namaPic: e.target.value })); if (e.target.value) clearError('namaPic'); }} placeholder="Nama Pemohon" />
                          {errors.namaPic && <p style={ERR_MSG_STYLE}>⚠ {errors.namaPic}</p>}
                        </div>
                        <div className="form-group" id="field-instansi">
                          <label>Instansi/Organisasi *</label>
                          <input type="text" className={errors.instansi ? 'error' : ''} value={form.instansi} onChange={e => { setForm((f: any) => ({ ...f, instansi: e.target.value })); if (e.target.value) clearError('instansi'); }} placeholder="Nama instansi" />
                          {errors.instansi && <p style={ERR_MSG_STYLE}>⚠ {errors.instansi}</p>}
                        </div>
                        <div className="form-group" id="field-jabatanPic">
                          <label>Jabatan/Posisi PIC (Penanggung Jawab) *</label>
                          <input type="text" className={errors.jabatanPic ? 'error' : ''} value={form.jabatanPic} onChange={e => { setForm((f: any) => ({ ...f, jabatanPic: e.target.value })); if (e.target.value) clearError('jabatanPic'); }} placeholder="Jabatan Anda" />
                          {errors.jabatanPic && <p style={ERR_MSG_STYLE}>⚠ {errors.jabatanPic}</p>}
                        </div>
                        <div className="form-group" id="field-noTelp">
                          <label>Nomor Telepon *</label>
                          <input type="text" inputMode="numeric" className={errors.noTelp ? 'error' : ''} value={form.noTelp} onChange={e => { setForm((f: any) => ({ ...f, noTelp: e.target.value })); if (e.target.value && e.target.value.replace(/\D/g, '').length >= 10) clearError('noTelp'); }} placeholder="08xxxxxxxxxx" />
                          {errors.noTelp && <p style={ERR_MSG_STYLE}>⚠ {errors.noTelp}</p>}
                        </div>
                        <div className="form-group" id="field-email">
                          <label>Email *</label>
                          <input type="email" className={errors.email ? 'error' : ''} value={form.email} onChange={e => { setForm((f: any) => ({ ...f, email: e.target.value })); if (e.target.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) clearError('email'); }} placeholder="email@domain.com" />
                          {errors.email && <p style={ERR_MSG_STYLE}>⚠ {errors.email}</p>}
                        </div>
                      </div>

                      <div className="form-title">Detail Kunjungan</div>
                      <div className="form-grid full">
                        <div className="form-group" id="field-dinasId">
                          <label>Dinas/Instansi yang Dituju *</label>
                          <select 
                            className={errors.dinasId ? 'error' : ''} 
                            value={form.dinasId} 
                            onChange={e => { 
                              const selectedId = e.target.value;
                              const selectedDinas = dinasList.find(d => d.id.toString() === selectedId);
                              setForm((f: any) => ({ 
                                ...f, 
                                dinasId: selectedId,
                                dinasTujuan: selectedDinas ? selectedDinas.nama : ''
                              })); 
                              if (selectedId) clearError('dinasId'); 
                            }}
                            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', fontFamily: 'inherit', outline: 'none', background: 'white' }}
                          >
                            <option value="">-- Pilih Dinas Tujuan --</option>
                            {dinasList.map((d: any) => (
                              <option key={d.id} value={d.id}>
                                {d.nama} ({d.singkatan})
                              </option>
                            ))}
                          </select>
                          {errors.dinasId && <p style={ERR_MSG_STYLE}>⚠ {errors.dinasId}</p>}
                          {form.dinasId && (
                            <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#0028B3', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              <span>No. Telp Dinas: {dinasList.find(d => d.id.toString() === form.dinasId)?.nomor_telepon || '-'}</span>
                            </div>
                          )}
                        </div>
                        <div className="form-group" id="field-tujuan">
                          <label>Deskripsi Tujuan/Maksud Kunjungan *</label>
                          <textarea className={errors.tujuan ? 'error' : ''} value={form.tujuan} onChange={e => { setForm((f: any) => ({ ...f, input: e.target.value, tujuan: e.target.value })); if (e.target.value) clearError('tujuan'); }} placeholder="Jelaskan tujuan kunjungan secara singkat dan jelas" />
                          {errors.tujuan && <p style={ERR_MSG_STYLE}>⚠ {errors.tujuan}</p>}
                        </div>
                      </div>
                      <div className="form-grid" style={{ marginTop: '18px' }}>
                        <div className="form-group" id="field-namaKetuaRombongan">
                          <label>Nama Ketua Rombongan *</label>
                          <input type="text" className={errors.namaKetuaRombongan ? 'error' : ''} value={form.namaKetuaRombongan} onChange={e => { setForm((f: any) => ({ ...f, namaKetuaRombongan: e.target.value })); if (e.target.value) clearError('namaKetuaRombongan'); }} placeholder="Nama Ketua Rombongan" />
                          {errors.namaKetuaRombongan && <p style={ERR_MSG_STYLE}>⚠ {errors.namaKetuaRombongan}</p>}
                        </div>
                        <div className="form-group" id="field-jabatanKetuaRombongan">
                          <label>Jabatan Ketua Rombongan *</label>
                          <input type="text" className={errors.jabatanKetuaRombongan ? 'error' : ''} value={form.jabatanKetuaRombongan} onChange={e => { setForm((f: any) => ({ ...f, jabatanKetuaRombongan: e.target.value })); if (e.target.value) clearError('jabatanKetuaRombongan'); }} placeholder="Jabatan Ketua Rombongan" />
                          {errors.jabatanKetuaRombongan && <p style={ERR_MSG_STYLE}>⚠ {errors.jabatanKetuaRombongan}</p>}
                        </div>
                      </div>
                      <div className="form-grid" style={{ marginTop: '16px' }}>
                        <div className="form-group" id="field-jumlahPeserta">
                          <label>Jumlah Peserta *</label>
                          <input type="number" min="1" className={errors.jumlahPeserta ? 'error' : ''} value={form.jumlahPeserta} onChange={e => { setForm((f: any) => ({ ...f, jumlahPeserta: e.target.value })); if (e.target.value) clearError('jumlahPeserta'); }} placeholder="Jumlah peserta" />
                          {errors.jumlahPeserta && <p style={ERR_MSG_STYLE}>⚠ {errors.jumlahPeserta}</p>}
                        </div>
                      </div>

                      <div className="form-title" style={{ marginTop: '28px' }}>Rencana Menginap</div>
                      <div className="form-grid full">
                        <div className="form-group" id="field-rencanaMenginap">
                          <label>Apakah ada rencana menginap? *</label>
                          <CustomDropdown value={form.rencanaMenginap} onChange={(val: any) => { handleRencanaMenginap(val); if (val) clearError('rencanaMenginap'); }} error={!!errors.rencanaMenginap} />
                          {errors.rencanaMenginap && <p style={ERR_MSG_STYLE}>⚠ {errors.rencanaMenginap}</p>}
                        </div>
                      </div>
                      {form.rencanaMenginap === 'Ya' && (
                        <div className="form-grid full" style={{ marginTop: '16px' }}>
                          <div className="form-group" id="field-namaHotel">
                            <label>Nama Hotel/Penginapan *</label>
                            <input type="text" className={errors.namaHotel ? 'error' : ''} value={form.namaHotel} onChange={e => { setForm((f: any) => ({ ...f, namaHotel: e.target.value })); if (e.target.value) clearError('namaHotel'); }} placeholder="Nama hotel atau penginapan" />
                            {errors.namaHotel && <p style={ERR_MSG_STYLE}>⚠ {errors.namaHotel}</p>}
                          </div>
                        </div>
                      )}

                      <div className="form-title" style={{ marginTop: '28px' }}>Surat Pendukung</div>
                      <div className="upload-pair">
                        <div id="field-file1">
                          <span className="upload-item-label">Surat Permohonan Kunjungan Kerja <span style={{ color: '#e74c3c' }}>*</span></span>
                          <UploadArea file={file1} error={!!errors.file1} id="fileSurat1" onChange={handleFile1Change} />
                          {errors.file1 && <p style={ERR_MSG_STYLE}>⚠ {errors.file1}</p>}
                        </div>
                        <div id="field-file2">
                          <span className="upload-item-label">Daftar Pertanyaan <span style={{ color: '#e74c3c' }}>*</span></span>
                          <UploadArea file={file2} error={!!errors.file2} id="fileSurat2" onChange={handleFile2Change} />
                          {errors.file2 && <p style={ERR_MSG_STYLE}>⚠ {errors.file2}</p>}
                        </div>
                      </div>

                      <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                        <button className="btn-outline" onClick={handleGoToStep1} style={{ width: 'auto', paddingLeft: '22px', paddingRight: '22px' }}>
                          ← Kembali
                        </button>
                        <button className="btn-primary" onClick={goToKonfirmasi} style={{ flex: 1 }}>
                          Lanjut ke Konfirmasi →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Konfirmasi */}
                  {step === 3 && (
                    <div>
                      <div className="confirm-block">
                        <div className="confirm-block-title">Tanggal &amp; Identitas</div>
                        <table className="confirm-table">
                          <tbody>
                            <tr><td>Tanggal Kunjungan</td><td>{formatDisplayDate(selectedDate)}</td></tr>
                            <tr><td>Nomor Surat</td><td>{form.nomorSurat}</td></tr>
                            <tr><td>Nama PIC</td><td>{form.namaPic}</td></tr>
                            <tr><td>Instansi</td><td>{form.instansi}</td></tr>
                            <tr><td>Jabatan PIC</td><td>{form.jabatanPic}</td></tr>
                            <tr><td>No. Telepon</td><td>{form.noTelp}</td></tr>
                            <tr><td>Email</td><td>{form.email}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="confirm-block">
                        <div className="confirm-block-title">Detail Kunjungan</div>
                        <table className="confirm-table">
                          <tbody>
                            <tr><td>Dinas Tujuan</td><td>{form.dinasTujuan}</td></tr>
                            <tr><td>Deskripsi Tujuan</td><td>{form.tujuan}</td></tr>
                            <tr><td>Ketua Rombongan</td><td>{form.namaKetuaRombongan} ({form.jabatanKetuaRombongan})</td></tr>
                            <tr><td>Jumlah Peserta</td><td>{form.jumlahPeserta} orang</td></tr>
                            <tr><td>Rencana Menginap</td><td>{form.rencanaMenginap}</td></tr>
                            {form.rencanaMenginap === 'Ya' && <tr><td>Hotel/Penginapan</td><td>{form.namaHotel}</td></tr>}
                          </tbody>
                        </table>
                      </div>
                      <div className="confirm-block">
                        <div className="confirm-block-title">Dokumen</div>
                        <table className="confirm-table">
                          <tbody>
                            <tr><td>Surat Permohonan</td><td style={{ color: '#0028B3', fontWeight: '600' }}>{file1?.name}</td></tr>
                            <tr><td>Daftar Pertanyaan</td><td style={{ color: '#0028B3', fontWeight: '600' }}>{file2?.name}</td></tr>
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                        <button className="btn-outline" onClick={handleGoToStep2} style={{ width: 'auto', paddingLeft: '22px', paddingRight: '22px' }}>
                          ← Kembali
                        </button>
                        <button
                          className="btn-primary"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          disabled={submitting}
                          onClick={handleOpenSubmitConfirm}
                        >
                          {submitting && <span className="spinner" />}
                          {submitting ? 'Mengirim...' : 'Kirim Permohonan'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', padding: '14px 22px', borderRadius: '12px', color: 'white', fontSize: '13.5px', fontWeight: '600', zIndex: 9999, maxWidth: '340px', boxShadow: '0 8px 24px rgba(0,17,120,0.22)', background: toast.type === 'error' ? '#B91C1C' : '#001178' }}>
          {toast.msg}
        </div>
      )}
      </div>
    </PublicLayout>
  );
}

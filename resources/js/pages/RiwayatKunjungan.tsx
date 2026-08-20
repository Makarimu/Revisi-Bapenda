import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import {
  getRiwayatKunjungan,
  RiwayatKunjunganItem,
  RiwayatKunjunganStatistik,
} from '../api/riwayatKunjungan';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggalIndo(dateStr: string | null) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// Sub-komponen Bintang Rating — React.memo
const StarRating = memo(function StarRating({ rating }: { rating: number }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars.map((s) => (
        <span
          key={s}
          style={{
            color: s <= rating ? '#F59E0B' : '#E5E7EB',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
      <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: '700', color: '#374151' }}>
        {rating.toFixed(1)} / 5
      </span>
    </div>
  );
});

// Sub-komponen StatCard — React.memo
const StatCard = memo(function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#EAFAF1',
          color: '#2E7D32',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginTop: '4px' }}>
          {value}
        </div>
      </div>
    </div>
  );
});

// Sub-komponen Modal Detail Review — React.memo
const ReviewDetailModal = memo(function ReviewDetailModal({
  item,
  onClose,
}: {
  item: RiwayatKunjunganItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Detail Ulasan Kunjungan</h3>
          <button className="sidebar-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="modal-body" style={{ paddingTop: '16px' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Instansi</span>
            <strong style={{ fontSize: '15px', color: '#1E293B' }}>{item.instansi}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Tanggal Kunjungan</span>
              <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{formatTanggalIndo(item.tanggal_kunjungan)}</span>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Jumlah Peserta</span>
              <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{item.jumlah_peserta} orang</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Penilaian</span>
            <StarRating rating={item.rating} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Ulasan & Kesan</span>
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '13.5px',
                color: '#334155',
                lineHeight: '1.6',
                whiteSpace: 'pre-line',
              }}
            >
              {item.review}
            </div>
          </div>

          {item.created_at_review && (
            <div style={{ fontSize: '11.5px', color: '#94A3B8', textAlign: 'right' }}>
              Dikirim pada: {formatTanggalIndo(item.created_at_review)}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="btn-primary" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Sub-komponen Card Item — React.memo
const RiwayatCard = memo(function RiwayatCard({
  item,
  onOpenDetail,
}: {
  item: RiwayatKunjunganItem;
  onOpenDetail: (item: RiwayatKunjunganItem) => void;
}) {
  const isLongText = item.review && item.review.length > 110;

  const handleDetail = useCallback(() => {
    onOpenDetail(item);
  }, [item, onOpenDetail]);

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        background: '#FFFFFF',
        transition: 'transform 0.2s, box-shadow 0.2s',
        padding: '20px',
      }}
    >
      <div>
        {/* Header Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1E293B', lineHeight: '1.4' }}>
            {item.instansi}
          </h4>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#EAFAF1',
              color: '#2E7D32',
              fontSize: '11px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Selesai
          </span>
        </div>

        {/* Info Meta */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px', color: '#64748B', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>{formatTanggalIndo(item.tanggal_kunjungan)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{item.jumlah_peserta} orang</span>
          </div>
        </div>

        {/* Tujuan */}
        {item.tujuan && (
          <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            <strong style={{ color: '#475569' }}>Maksud:</strong> {item.tujuan}
          </div>
        )}

        {/* Rating */}
        <div style={{ marginBottom: '12px' }}>
          <StarRating rating={item.rating} />
        </div>

        {/* Isi Review */}
        <div
          style={{
            fontSize: '13px',
            color: '#334155',
            lineHeight: '1.5',
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontStyle: 'italic',
            background: '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            borderLeft: '3px solid #2E7D32',
          }}
        >
          "{item.review}"
        </div>
      </div>

      <div>
        {isLongText && (
          <button
            type="button"
            onClick={handleDetail}
            style={{
              background: 'none',
              border: 'none',
              color: '#2E7D32',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Lihat Selengkapnya →
          </button>
        )}

        {item.created_at_review && (
          <div style={{ fontSize: '11px', color: '#94A3B8', borderTop: '1px border #F1F5F9', paddingTop: '8px', marginTop: '4px' }}>
            Ulasan diberikan pada {formatTanggalIndo(item.created_at_review)}
          </div>
        )}
      </div>
    </div>
  );
});

export default function RiwayatKunjungan() {
  const [items, setItems] = useState<RiwayatKunjunganItem[]>([]);
  const [statistik, setStatistik] = useState<RiwayatKunjunganStatistik>({
    total_selesai: 0,
    total_review: 0,
    rata_rata_rating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Selected item untuk Modal
  const [selectedItem, setSelectedItem] = useState<RiwayatKunjunganItem | null>(null);

  const fetchRiwayat = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRiwayatKunjungan({
        search,
        rating,
        sort,
        page,
        per_page: 9,
      });

      if (res.success) {
        setItems(res.data || []);
        if (res.statistik) setStatistik(res.statistik);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Gagal mengambil data riwayat kunjungan:', err);
    } finally {
      setLoading(false);
    }
  }, [search, rating, sort, page]);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleRatingChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRating(e.target.value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }, []);

  const handleOpenDetail = useCallback((item: RiwayatKunjunganItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const paginationButtons = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= meta.last_page; i++) {
      pages.push(i);
    }
    return pages;
  }, [meta.last_page]);

  return (
    <PublicLayout>
      <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: '32px 16px 64px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>
              Riwayat Kunjungan Kerja
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Daftar seluruh kunjungan kerja yang telah selesai beserta ulasan & tingkat kepuasan dari instansi pemohon.
            </p>
          </div>

          {/* Ringkasan Statistik */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <StatCard
              title="Total Kunjungan Selesai"
              value={statistik.total_selesai}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
            />
            <StatCard
              title="Total Ulasan Menerima"
              value={statistik.total_review}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
            <StatCard
              title="Rata-rata Rating Kepuasan"
              value={`${statistik.rata_rata_rating} / 5`}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
            />
          </div>

          {/* Filter & Search Bar */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              marginBottom: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Input Search */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari nama instansi..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Dropdown Filters */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Filter Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Rating:</span>
                <select
                  value={rating}
                  onChange={handleRatingChange}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Semua Rating</option>
                  <option value="5">5 Bintang (★★★★★)</option>
                  <option value="4">4 Bintang (★★★★☆)</option>
                  <option value="3">3 Bintang (★★★☆☆)</option>
                  <option value="2">2 Bintang (★★☆☆☆)</option>
                  <option value="1">1 Bintang (★☆☆☆☆)</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Urutkan:</span>
                <select
                  value={sort}
                  onChange={handleSortChange}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                  <option value="rating_tertinggi">Rating Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
              <div className="spinner" style={{ margin: '0 auto 12px', width: '32px', height: '32px' }} />
              <p style={{ fontSize: '14px' }}>Memuat riwayat kunjungan...</p>
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '48px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #E2E8F0',
                color: '#64748B',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <h4 style={{ fontSize: '16px', color: '#334155', marginBottom: '4px' }}>Belum Ada Data Riwayat Kunjungan</h4>
              <p style={{ fontSize: '13px', margin: 0 }}>Tidak ada ulasan kunjungan yang sesuai dengan kriteria filter Anda.</p>
            </div>
          ) : (
            <>
              {/* Responsive Grid: 3 col Desktop, 2 col Tablet, 1 col Mobile */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px',
                  marginBottom: '36px',
                }}
              >
                {items.map((item) => (
                  <RiwayatCard key={item.id} item={item} onOpenDetail={handleOpenDetail} />
                ))}
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={meta.current_page === 1}
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                  >
                    ← Sebelum
                  </button>

                  {paginationButtons.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: p === meta.current_page ? '#2E7D32' : '#FFFFFF',
                        color: p === meta.current_page ? '#FFFFFF' : '#334155',
                        fontWeight: p === meta.current_page ? '700' : '500',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="btn-outline"
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    style={{ padding: '6px 14px', fontSize: '13px' }}
                  >
                    Sesudah →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal Detail Review */}
          <ReviewDetailModal item={selectedItem} onClose={handleCloseDetail} />

        </div>
      </div>
    </PublicLayout>
  );
}

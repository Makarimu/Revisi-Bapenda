import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllReviews, prosesReview } from '../../api/admin/review';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatDisplayDate(s: any) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return s;
  }
}

function StatusReviewBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending: { bg: '#FEF3C7', color: '#B45309', border: '#F59E0B', label: 'Pending' },
    approved: { bg: '#DCFCE7', color: '#15803D', border: '#86EFAC', label: 'Approved' },
    rejected: { bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5', label: 'Rejected' },
  };
  const s = cfg[status] || cfg.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: '15px', letterSpacing: '1px' }}>
      {'★'.repeat(rating)}
      <span style={{ color: '#D1D5DB' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

const STATUS_TABS = ['Semua', 'pending', 'approved', 'rejected'];

export default function KelolaReview() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async (f: any) => {
    setLoading(true);
    try {
      const params: any = {
        page: f.page || 1,
        per_page: 15,
      };
      if (f.status && f.status !== 'Semua') params.status = f.status;
      if (f.search) params.search = f.search;

      const res = await getAllReviews(params);
      setData(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (e) {
      console.error(e);
      showToast('Gagal memuat data review', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchData({ status: tab, search, page: 1 });
  }, [tab, fetchData]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    fetchData({ status: tab, search: val, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData({ status: tab, search, page: newPage });
  };

  const handleProses = async (id: number, aksi: 'approve' | 'reject') => {
    setActionLoadingId(id);
    try {
      const res = await prosesReview(id, aksi);
      showToast(res.message || `Review berhasil di-${aksi}`, 'success');
      fetchData({ status: tab, search, page });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memproses review', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '11px 18px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            zIndex: 9999,
            maxWidth: '320px',
            boxShadow: '0 4px 16px rgba(0,17,120,0.18)',
            background: toast.type === 'error' ? '#B91C1C' : '#001178',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#001178', letterSpacing: '-0.3px' }}>Kelola Rating &amp; Review</h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '3px' }}>Moderasi ulasan dan penilaian dari instansi yang berkunjung</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              border: '1.5px solid',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              background: tab === t ? '#0028B3' : 'white',
              color: tab === t ? 'white' : '#64748B',
              borderColor: tab === t ? '#0028B3' : '#E5E7EB',
              textTransform: 'capitalize',
              boxShadow: tab === t ? '0 2px 8px rgba(0,40,179,0.2)' : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(228, 231, 237, 0.8)', padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ maxWidth: '360px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Pencarian
          </label>
          <input
            type="text"
            placeholder="Cari kode, instansi, nama PIC..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', minHeight: '42px', border: '1px solid #D9DEE5', borderRadius: '8px', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(228, 231, 237, 0.8)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E7ED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Daftar Rating &amp; Review</h3>
          <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>{loading ? 'Memuat...' : `${data.length} data`}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tanggal', 'Kode Permohonan', 'Nama Instansi', 'PIC', 'Rating', 'Review', 'Status Review', 'Aksi'].map((h) => (
                  <th key={h} style={{ background: '#F8FAFC', padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E2E8F0' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #C5DBFF', borderTopColor: '#0028B3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <div style={{ marginTop: '12px', color: '#64748B', fontSize: '13.5px' }}>Memuat data review...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B', fontSize: '13.5px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                    Belum ada review.
                  </td>
                </tr>
              ) : (
                data.map((d: any) => (
                  <tr key={d.id} style={{ borderTop: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155', whiteSpace: 'nowrap' }}>
                      {formatDisplayDate(d.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#0028B3', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {d.kode_permohonan || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13.5px', fontWeight: '600', color: '#0F172A' }}>
                      {d.instansi || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>
                      {d.nama_pic || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <StarRating rating={d.rating} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155', maxWidth: '300px', lineHeight: '1.6' }}>
                      {d.review}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusReviewBadge status={d.status} />
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {d.status !== 'approved' && (
                          <button
                            onClick={() => handleProses(d.id, 'approve')}
                            disabled={actionLoadingId === d.id}
                            style={{
                              padding: '6px 14px',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: actionLoadingId === d.id ? 'not-allowed' : 'pointer',
                              background: '#0028B3',
                              color: 'white',
                              fontFamily: 'inherit',
                              boxShadow: '0 2px 6px rgba(0,40,179,0.2)',
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {d.status !== 'rejected' && (
                          <button
                            onClick={() => handleProses(d.id, 'reject')}
                            disabled={actionLoadingId === d.id}
                            style={{
                              padding: '6px 14px',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: actionLoadingId === d.id ? 'not-allowed' : 'pointer',
                              background: '#B91C1C',
                              color: 'white',
                              fontFamily: 'inherit',
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #E4E7ED', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#64748B' }}>
            <div>
              Menampilkan <strong>{meta.from || 0}</strong> - <strong>{meta.to || 0}</strong> dari <strong>{meta.total || 0}</strong> review
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
                style={{
                  padding: '7px 14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  background: page <= 1 || loading ? '#F1F5F9' : 'white',
                  color: page <= 1 || loading ? '#94A3B8' : '#334155',
                  cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12.5px',
                  fontFamily: 'inherit',
                }}
              >
                ‹ Sebelumnya
              </button>
              <button
                disabled={page >= meta.last_page || loading}
                onClick={() => handlePageChange(page + 1)}
                style={{
                  padding: '7px 14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  background: page >= meta.last_page || loading ? '#F1F5F9' : 'white',
                  color: page >= meta.last_page || loading ? '#94A3B8' : '#334155',
                  cursor: page >= meta.last_page || loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12.5px',
                  fontFamily: 'inherit',
                }}
              >
                Selanjutnya ›
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

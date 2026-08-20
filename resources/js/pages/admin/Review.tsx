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
    pending: { bg: '#FEF9E7', color: '#B7791F', border: '#F0C040', label: 'Pending' },
    approved: { bg: '#EAFAF1', color: '#256628', border: '#2E7D32', label: 'Approved' },
    rejected: { bg: '#FDEDEC', color: '#922B21', border: '#e74c3c', label: 'Rejected' },
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
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            background: toast.type === 'error' ? '#e74c3c' : '#2E7D32',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>Kelola Rating & Review</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>Moderasi ulasan dan penilaian dari instansi yang berkunjung</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1.5px solid',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              background: tab === t ? '#2E7D32' : 'white',
              color: tab === t ? 'white' : '#6B7280',
              borderColor: tab === t ? '#2E7D32' : '#E5E7EB',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', padding: '14px 18px', marginBottom: '14px' }}>
        <div style={{ maxWidth: '320px' }}>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
            Pencarian
          </label>
          <input
            type="text"
            placeholder="Cari kode, instansi, nama PIC..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #D9DEE5', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Daftar Rating & Review</h3>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>{loading ? 'Memuat...' : `${data.length} data`}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tanggal', 'Kode Permohonan', 'Nama Instansi', 'PIC', 'Rating', 'Review', 'Status Review', 'Aksi'].map((h) => (
                  <th key={h} style={{ background: '#F7F8FA', padding: '9px 13px', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '44px 20px' }}>
                    <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E5E7EB', borderTopColor: '#2E7D32', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <div style={{ marginTop: '10px', color: '#6B7280', fontSize: '13px' }}>Memuat data review...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '44px 20px', color: '#6B7280', fontSize: '13px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                    Belum ada review.
                  </td>
                </tr>
              ) : (
                data.map((d: any) => (
                  <tr key={d.id} style={{ borderTop: '1px solid #E5E7EB', transition: 'background 0.15s' }}>
                    <td style={{ padding: '11px 13px', fontSize: '12.5px', color: '#444', whiteSpace: 'nowrap' }}>
                      {formatDisplayDate(d.created_at)}
                    </td>
                    <td style={{ padding: '11px 13px', fontSize: '12.5px', fontWeight: '700', color: '#2E7D32', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {d.kode_permohonan || '-'}
                    </td>
                    <td style={{ padding: '11px 13px', fontSize: '13px', fontWeight: '600', color: '#222' }}>
                      {d.instansi || '-'}
                    </td>
                    <td style={{ padding: '11px 13px', fontSize: '12.5px', color: '#444' }}>
                      {d.nama_pic || '-'}
                    </td>
                    <td style={{ padding: '11px 13px', whiteSpace: 'nowrap' }}>
                      <StarRating rating={d.rating} />
                    </td>
                    <td style={{ padding: '11px 13px', fontSize: '12.5px', color: '#374151', maxWidth: '300px', lineHeight: '1.5' }}>
                      {d.review}
                    </td>
                    <td style={{ padding: '11px 13px' }}>
                      <StatusReviewBadge status={d.status} />
                    </td>
                    <td style={{ padding: '11px 13px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {d.status !== 'approved' && (
                          <button
                            onClick={() => handleProses(d.id, 'approve')}
                            disabled={actionLoadingId === d.id}
                            style={{
                              padding: '5px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: actionLoadingId === d.id ? 'not-allowed' : 'pointer',
                              background: '#2E7D32',
                              color: 'white',
                              fontFamily: 'inherit',
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
                              padding: '5px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: actionLoadingId === d.id ? 'not-allowed' : 'pointer',
                              background: '#e74c3c',
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
          <div style={{ padding: '12px 18px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px', color: '#6B7280' }}>
            <div>
              Menampilkan <strong>{meta.from || 0}</strong> - <strong>{meta.to || 0}</strong> dari <strong>{meta.total || 0}</strong> review
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: page <= 1 || loading ? '#F3F4F6' : 'white',
                  color: page <= 1 || loading ? '#9CA3AF' : '#374151',
                  cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                ‹ Sebelumnya
              </button>
              <button
                disabled={page >= meta.last_page || loading}
                onClick={() => handlePageChange(page + 1)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: page >= meta.last_page || loading ? '#F3F4F6' : 'white',
                  color: page >= meta.last_page || loading ? '#9CA3AF' : '#374151',
                  cursor: page >= meta.last_page || loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
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

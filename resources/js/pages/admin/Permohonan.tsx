import { useState, useEffect, useCallback, useRef, memo } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllPermohonan } from '../../api/admin/permohonan';
import DetailPermohonanPanel from '../../modals/ProsesPermohonanModal';
import ExportPermohonanModal from '../../modals/ExportPermohonanModal';

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function formatDisplayDate(s: any) {
  if (!s) return '-';
  try { const d = new Date(s); return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`; }
  catch { return s; }
}

const STATUS_TABS = ['Semua','Pending','Revisi','Disetujui','Ditolak'];
const STATUS_COLORS: any = { Revisi:'#7D3C98', Ditolak:'#e74c3c', Disetujui:'#2E7D32', Pending:'#B7791F', Semua:'#2E7D32' };
const TABLE_HEADERS = ['Kode Permohonan','Instansi/Pemohon','Tgl Kunjungan','Peserta','Status','Aksi'];

const STATUS_BADGE_CFG: any = {
  Pending: { bg:'#FEF9E7', color:'#B7791F', border:'#F0C040' },
  Disetujui: { bg:'#EAFAF1', color:'#256628', border:'#2E7D32' },
  Ditolak: { bg:'#FDEDEC', color:'#922B21', border:'#e74c3c' },
  Revisi: { bg:'#F5EEF8', color:'#7D3C98', border:'#A569BD' },
};

const StatusBadge = memo(function StatusBadge({ status }: any) {
  const s: any = STATUS_BADGE_CFG[status] || STATUS_BADGE_CFG.Pending;
  return (
    <span style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:'12px',fontSize:'11px',fontWeight:'700',background:s.bg,color:s.color,border:`1px solid ${s.border}`,whiteSpace:'nowrap'}}>
      {status}
    </span>
  );
});

export default function KelolaPermohonan() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const searchTimer = useRef<any>(null);
  const searchRef = useRef('');

  const isMountedRef = useRef(true);

  const showToast = useCallback((msg: any, type='success') => {
    setToast({msg, type});
    setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 3500);
  }, []);

  const fetchData = useCallback(async (f: any) => {
    setLoading(true);
    try {
      const params: any = {
        page: f.page || 1,
        per_page: 15
      };
      if (f.status && f.status !== 'Semua') params.status = f.status;
      if (f.search) params.search = f.search;
      if (f.start_date) params.start_date = f.start_date;
      if (f.end_date) params.end_date = f.end_date;

      const res = await getAllPermohonan(params);
      if (isMountedRef.current) {
        setData(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (e) {
      console.error(e);
      if (isMountedRef.current) showToast('Gagal memuat data permohonan', 'error');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setPage(1);
    const f = { status: tab, search: searchRef.current, start_date: startDate, end_date: endDate, page: 1 };
    fetchData(f);

    return () => {
      isMountedRef.current = false;
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [tab, startDate, endDate, fetchData]);

  const handleSearchChange = useCallback((val: any) => {
    setSearch(val);
    searchRef.current = val;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchData({ status: tab, search: val, start_date: startDate, end_date: endDate, page: 1 });
    }, 400);
  }, [tab, startDate, endDate, fetchData]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    fetchData({ status: tab, search: searchRef.current, start_date: startDate, end_date: endDate, page: newPage });
  }, [tab, startDate, endDate, fetchData]);

  const loadData = useCallback(() => {
    setTab('Semua'); setSearch(''); searchRef.current = ''; setStartDate(''); setEndDate(''); setPage(1);
    fetchData({ status:'Semua', search:'', start_date:'', end_date:'', page: 1 });
  }, [fetchData]);

  const handleSuccess = useCallback((msg: any) => {
    showToast(msg);
    setSelected(null);
    fetchData({ status: tab, search, start_date: startDate, end_date: endDate });
  }, [showToast, tab, search, startDate, endDate, fetchData]);

  return (
    <AdminLayout>
      <style>{`
        .permohonan-header {
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .permohonan-filter-bar {
          background: white;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
          border: 1px solid #E5E7EB;
          padding: 14px 18px;
          margin-bottom: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
        }
        .permohonan-search { flex: 1 1 220px; min-width: 0; }
        .permohonan-date-filter { flex: 0 0 auto; min-width: 140px; max-width: 100%; }
        @media (max-width: 480px) {
          .permohonan-date-filter { flex: 1 1 100%; }
        }
      `}</style>
      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',bottom:'20px',right:'20px',padding:'11px 18px',borderRadius:'8px',color:'white',fontSize:'13px',fontWeight:'500',zIndex:9999,maxWidth:'320px',boxShadow:'0 4px 16px rgba(0,0,0,0.15)',background:toast.type==='error'?'#e74c3c':'#2E7D32'}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{marginBottom:'20px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#000'}}>Kelola Permohonan</h2>
          <p style={{fontSize:'13px',color:'#6B7280',marginTop:'3px'}}>Proses dan kelola permohonan kunjungan kerja</p>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={() => setShowExport(true)}
            style={{display:'flex',alignItems:'center',gap:'7px',padding:'9px 16px',border:'1px solid #2E7D32',borderRadius:'8px',background:'#2E7D32',color:'white',cursor:'pointer',fontSize:'12.5px',fontWeight:'600',fontFamily:'inherit',transition:'all 0.2s'}}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Unduh Spreadsheet
          </button>
          <button onClick={loadData}
            style={{display:'flex',alignItems:'center',gap:'7px',padding:'9px 16px',border:'1px solid #E5E7EB',borderRadius:'8px',background:'white',color:'#6B7280',cursor:'pointer',fontSize:'12.5px',fontWeight:'600',fontFamily:'inherit'}}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Filter
          </button>
        </div>
      </div>

      {/* Tab Status */}
      <div style={{display:'flex',gap:'6px',marginBottom:'14px',flexWrap:'wrap'}}>
        {STATUS_TABS.map((t: any) => (
          <button key={t} onClick={() => setTab(t)}
            style={{padding:'7px 16px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',border:'1.5px solid',transition:'all 0.2s',fontFamily:'inherit',
              background: tab===t ? (STATUS_COLORS[t]||'#2E7D32') : 'white',
              color: tab===t ? 'white' : '#6B7280',
              borderColor: tab===t ? (STATUS_COLORS[t]||'#2E7D32') : '#E5E7EB',
            }}>
            {t === 'Pending' ? 'Menunggu Review' : t}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #E5E7EB',padding:'14px 18px',marginBottom:'14px',display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'flex-end'}}>
        <div style={{flex:'1 1 220px'}}>
          <label style={{fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>Pencarian</label>
          <div style={{position:'relative'}}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'#AAB2BC'}}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" placeholder="Kode, instansi, nama PIC..." value={search}
              onChange={e => handleSearchChange(e.target.value)}
              style={{width:'100%',paddingLeft:'32px',paddingRight:'12px',paddingTop:'8px',paddingBottom:'8px',border:'1px solid #D9DEE5',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{flex:'0 0 160px'}}>
          <label style={{fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>Dari Tanggal</label>
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
            style={{width:'100%',padding:'8px 10px',border:'1px solid #D9DEE5',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
        <div style={{flex:'0 0 160px'}}>
          <label style={{fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
            style={{width:'100%',padding:'8px 10px',border:'1px solid #D9DEE5',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
      </div>

      {/* Table */}
      <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #E5E7EB',overflow:'hidden'}}>
        <div style={{padding:'13px 18px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h3 style={{fontSize:'14px',fontWeight:'700',color:'#000'}}>Daftar Permohonan</h3>
          <span style={{fontSize:'12px',color:'#6B7280'}}>{loading?'Memuat...':data.length+' data'}</span>
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['Kode Permohonan','Instansi/Pemohon','Tgl Kunjungan','Peserta','Status','Aksi'].map(h => (
                  <th key={h} style={{background:'#F7F8FA',padding:'9px 13px',fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{textAlign:'center',padding:'44px 20px'}}>
                    <div style={{display:'inline-block',width:'28px',height:'28px',border:'3px solid #E5E7EB',borderTopColor:'#2E7D32',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                    <div style={{marginTop:'10px',color:'#6B7280',fontSize:'13px'}}>Memuat data...</div>
                    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign:'center',padding:'44px 20px',color:'#6B7280',fontSize:'13px'}}>
                    <div style={{fontSize:'32px',marginBottom:'8px'}}>📋</div>
                    Tidak ada data permohonan.
                  </td>
                </tr>
              ) : data.map((d: any, i: any) => (
                <tr key={d.id || i} style={{borderTop:'1px solid #E5E7EB',transition:'background 0.15s',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  onClick={() => setSelected(d)}>
                  <td style={{padding:'11px 13px',fontSize:'12.5px',fontWeight:'700',color:'#2E7D32',fontFamily:'monospace',whiteSpace:'nowrap'}}>
                    {d.kode}
                  </td>
                  <td style={{padding:'11px 13px'}}>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'#222'}}>{d.instansi}</div>
                    <div style={{fontSize:'11.5px',color:'#6B7280',marginTop:'2px'}}>{d.nama_pic}</div>
                  </td>
                  <td style={{padding:'11px 13px',fontSize:'13px',color:'#444',whiteSpace:'nowrap'}}>{formatDisplayDate(d.tanggal_kunjungan)}</td>
                  <td style={{padding:'11px 13px',fontSize:'13px',textAlign:'center',color:'#444'}}>{d.jumlah_peserta}</td>
                  <td style={{padding:'11px 13px'}}>
                    <StatusBadge status={d.status}/>
                    {d.status === 'Selesai' && (
                      <div style={{marginTop:'4px',fontSize:'10px',fontWeight:'600',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'3px',color: (d.pdf_ready || d.ringkasan_pdf || d.ringkasan_uploaded_at) ? '#16A34A' : '#D97706'}}>
                        {(d.pdf_ready || d.ringkasan_pdf || d.ringkasan_uploaded_at) ? '🟢 PDF sudah dikirim' : '🟡 PDF belum dikirim'}
                      </div>
                    )}
                  </td>
                  <td style={{padding:'11px 13px'}}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(d); }}
                      style={{padding:'6px 14px',border:'1px solid #E5E7EB',borderRadius:'7px',fontSize:'12px',fontWeight:'600',cursor:'pointer',background:'#F7F8FA',color:'#444',transition:'all 0.2s',fontFamily:'inherit'}}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{padding:'12px 18px',borderTop:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px',fontSize:'12.5px',color:'#6B7280'}}>
          <div>
            {meta ? (
              <>Menampilkan <strong>{meta.from || 0}</strong> - <strong>{meta.to || 0}</strong> dari <strong>{meta.total || 0}</strong> data</>
            ) : (
              <>Menampilkan <strong>{data.length}</strong> data</>
            )}
          </div>

          {meta && meta.last_page > 1 && (
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <button
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
                style={{
                  padding:'6px 12px',
                  border:'1px solid #E5E7EB',
                  borderRadius:'6px',
                  background: page <= 1 || loading ? '#F3F4F6' : 'white',
                  color: page <= 1 || loading ? '#9CA3AF' : '#374151',
                  cursor: page <= 1 || loading ? 'not-allowed' : 'pointer',
                  fontWeight:'600',
                  fontSize:'12px',
                  fontFamily:'inherit'
                }}>
                ‹ Sebelumnya
              </button>

              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <span key={p} style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
                      {showEllipsis && <span style={{color:'#9CA3AF',padding:'0 2px'}}>...</span>}
                      <button
                        onClick={() => handlePageChange(p)}
                        disabled={loading}
                        style={{
                          padding:'6px 11px',
                          border: page === p ? '1px solid #2E7D32' : '1px solid #E5E7EB',
                          borderRadius:'6px',
                          background: page === p ? '#2E7D32' : 'white',
                          color: page === p ? 'white' : '#374151',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontWeight: page === p ? '700' : '600',
                          fontSize:'12px',
                          fontFamily:'inherit'
                        }}>
                        {p}
                      </button>
                    </span>
                  );
                })}

              <button
                disabled={page >= meta.last_page || loading}
                onClick={() => handlePageChange(page + 1)}
                style={{
                  padding:'6px 12px',
                  border:'1px solid #E5E7EB',
                  borderRadius:'6px',
                  background: page >= meta.last_page || loading ? '#F3F4F6' : 'white',
                  color: page >= meta.last_page || loading ? '#9CA3AF' : '#374151',
                  cursor: page >= meta.last_page || loading ? 'not-allowed' : 'pointer',
                  fontWeight:'600',
                  fontSize:'12px',
                  fontFamily:'inherit'
                }}>
                Selanjutnya ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <DetailPermohonanPanel
          data={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
          onUpdate={(updatedData: any) => {
            setSelected(updatedData);
            setData((prevList: any[]) =>
              prevList.map((item) => (item.id === updatedData.id || item.kode === updatedData.kode ? updatedData : item))
            );
          }}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportPermohonanModal onClose={() => setShowExport(false)} />
      )}
    </AdminLayout>
  );
}

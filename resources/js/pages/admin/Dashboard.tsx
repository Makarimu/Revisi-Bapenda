import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getStatistik,
  getPermohonanHariIni,
  getGrafikBulanan,
  getAktivitasTerbaru,
} from '../../api/admin/dashboard';

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Static style objects (keluar dari komponen agar tidak dibuat ulang setiap render)
const STATUS_BADGE_CFG: Record<string, any> = {
  Pending: { bg: '#FEF9E7', color: '#B7791F', border: '#F0C040' },
  Disetujui: { bg: '#EAFAF1', color: '#256628', border: '#2E7D32' },
  Ditolak: { bg: '#FDEDEC', color: '#922B21', border: '#e74c3c' },
  Revisi: { bg: '#F5EEF8', color: '#7D3C98', border: '#A569BD' },
};
const STAT_CARD_STYLES: Record<string, any> = {
  total: { bg: '#F3FAF5', color: '#2E7D32', valColor: '#2E7D32' },
  pending: { bg: '#FEF9E7', color: '#B7791F', valColor: '#B7791F' },
  revisi: { bg: '#F5EEF8', color: '#7D3C98', valColor: '#7D3C98' },
  disetujui: { bg: '#EAFAF1', color: '#256628', valColor: '#256628' },
  ditolak: { bg: '#FDEDEC', color: '#922B21', valColor: '#922B21' },
};
const DONUT_SEGMENT_DEFS = [
  { key: 'Pending', label: 'Pending', color: '#F0C040' },
  { key: 'Disetujui', label: 'Disetujui', color: '#2E7D32' },
  { key: 'Ditolak', label: 'Ditolak', color: '#e74c3c' },
  { key: 'Revisi', label: 'Revisi', color: '#A569BD' },
];

function formatTanggal(s: any) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return s; }
}

const StatusBadge = memo(function StatusBadge({ status }: any) {
  const s = STATUS_BADGE_CFG[status] || STATUS_BADGE_CFG.Pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
});

const StatCard = memo(function StatCard({ title, value, icon, type, loading }: any) {
  const s = STAT_CARD_STYLES[type] || STAT_CARD_STYLES.total;
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: s.bg, color: s.color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        {loading ? (
          <div style={{ height: '28px', background: '#F0F0F0', borderRadius: '6px', width: '50px', marginTop: '6px', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <div style={{ fontSize: '26px', fontWeight: '800', marginTop: '5px', color: s.valColor }}>{value}</div>
        )}
      </div>
    </div>
  );
});

// Grafik Bar Chart — React.memo agar tidak re-render jika data sama
const BarChart = memo(function BarChart({ data }: any) {
  const max = useMemo(() => Math.max(...(data?.map((d: any) => d.total) ?? [0]), 1), [data]);

  if (!data || data.length === 0) return (
    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAB2BC', fontSize: '13px' }}>
      Belum ada data grafik
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '16px 4px 8px', minWidth: '400px' }}>
        {data.map((d: any, i: number) => {
          const h = Math.max(4, Math.round((d.total / max) * 160));
          return (
            <div key={d.bulan ?? i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, minWidth: '30px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#2E7D32' }}>{d.total || ''}</span>
              <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: `${h}px`, background: 'linear-gradient(180deg,#3D9142,#2E7D32)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} />
              </div>
              <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '600' }}>{d.bulan || MONTHS_ID[i] || ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Donut Chart — React.memo + useMemo untuk kalkulasi SVG path
const DonutChart = memo(function DonutChart({ stats }: any) {
  const total = stats.Total || 0;

  const { segments, paths } = useMemo(() => {
    const segs = DONUT_SEGMENT_DEFS
      .map(def => ({ ...def, count: stats[def.key] || 0 }))
      .filter(s => s.count > 0);

    const cx = 90, cy = 90, r = 72;
    let cumPct = 0;
    const ps = segs.map((seg: any) => {
      const pct = seg.count / total;
      const startAngle = cumPct * 360 - 90;
      const endAngle = (cumPct + pct) * 360 - 90;
      cumPct += pct;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const x1 = cx + r * Math.cos(toRad(startAngle));
      const y1 = cy + r * Math.sin(toRad(startAngle));
      const x2 = cx + r * Math.cos(toRad(endAngle));
      const y2 = cy + r * Math.sin(toRad(endAngle));
      const largeArc = pct > 0.5 ? 1 : 0;
      return { ...seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
    });
    return { segments: segs, paths: ps };
  }, [stats, total]);

  if (!total) return (
    <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAB2BC', fontSize: '13px' }}>
      Belum ada data
    </div>
  );

  const cx = 90, cy = 90;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
        {paths.map((seg: any) => (
          <path key={seg.key} d={seg.d} fill={seg.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx={cx} cy={cy} r="48" fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#222" fontSize="22" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#6B7280" fontSize="10">Total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((seg: any) => (
          <div key={seg.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{seg.label}</span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#222', marginLeft: '4px' }}>{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ Total: 0, Pending: 0, Revisi: 0, Disetujui: 0, Ditolak: 0 });
  const [hariIni, setHariIni] = useState<any[]>([]);
  const [grafik, setGrafik] = useState<any[]>([]);
  const [aktivitas, setAktivitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async (isMountedRef?: { current: boolean }) => {
    setLoading(true);
    try {
      const [resStats, resHariIni, resGrafik, resAktivitas] = await Promise.all([
        getStatistik(),
        getPermohonanHariIni(),
        getGrafikBulanan(),
        getAktivitasTerbaru(),
      ]);

      if (isMountedRef && !isMountedRef.current) return;

      const st = resStats.data || resStats;
      setStats({
        Total: st.Total || st.total_permohonan || st.total || 0,
        Pending: st.Pending || st.menunggu_review || st.pending || 0,
        Revisi: st.Revisi || st.revisi || 0,
        Disetujui: st.Disetujui || st.disetujui || 0,
        Ditolak: st.Ditolak || st.ditolak || 0,
      });
      setHariIni(resHariIni.data || resHariIni || []);
      setGrafik(resGrafik.data || resGrafik || []);
      setAktivitas(resAktivitas.data || resAktivitas || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      if (!isMountedRef || isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const isMountedRef = { current: true };
    loadAll(isMountedRef);
    return () => {
      isMountedRef.current = false;
    };
  }, []);


  return (
    <AdminLayout>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .dash-grafik-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 16px;
          margin-bottom: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .dash-grafik-grid { grid-template-columns: 1fr; }
        }
        .dash-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 480px) {
          .dash-stat-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>


      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>Dashboard</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>Ringkasan sistem kunjungan kerja</p>
        </div>
        <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', color: '#6B7280', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          Refresh
        </button>
      </div>

      {/* 5 Stat Cards */}
      <div className="dash-stat-grid">
        <StatCard loading={loading} title="Total Permohonan" value={stats.Total} type="total" icon={
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
        } />
        <StatCard loading={loading} title="Menunggu Review" value={stats.Pending} type="pending" icon={
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        } />
        <StatCard loading={loading} title="Revisi" value={stats.Revisi} type="revisi" icon={
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        } />
        <StatCard loading={loading} title="Disetujui" value={stats.Disetujui} type="disetujui" icon={
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        } />
        <StatCard loading={loading} title="Ditolak" value={stats.Ditolak} type="ditolak" icon={
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        } />
      </div>

      {/* Kunjungan Hari Ini */}
      <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#FEF9E7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#B7791F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Kunjungan Hari Ini</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          <span style={{ background: '#FEF9E7', color: '#B7791F', border: '1px solid #F0C040', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: '700' }}>
            {hariIni.length} kunjungan
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '24px 18px', color: '#AAB2BC', fontSize: '13px', textAlign: 'center' }}>Memuat data...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Kode', 'Instansi', 'Nama PIC', 'Peserta', 'Jam', 'Status'].map(h => (
                    <th key={h} style={{ background: '#F7F8FA', padding: '9px 13px', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hariIni.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',padding:'32px 16px',color:'#6B7280',fontSize:'13px'}}>Tidak ada kunjungan yang dijadwalkan hari ini.</td></tr>}
                {hariIni.map((d: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '10px 13px', fontSize: '12px', fontWeight: '700', color: '#2E7D32', fontFamily: 'monospace' }}>{d.kode_permohonan}</td>
                    <td style={{ padding: '10px 13px', fontSize: '13px' }}>{d.instansi}</td>
                    <td style={{ padding: '10px 13px', fontSize: '13px', color: '#6B7280' }}>{d.nama_pic}</td>
                    <td style={{ padding: '10px 13px', fontSize: '13px', textAlign: 'center' }}>{d.jumlah_peserta}</td>
                    <td style={{ padding: '10px 13px', fontSize: '13px', color: '#6B7280' }}>{d.jam_penerimaan || '-'}</td>
                    <td style={{ padding: '10px 13px' }}><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grafik + Aktivitas Terbaru */}
      <div className="dash-grafik-grid">
        {/* Bar Chart */}
        <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#F3FAF5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Permohonan per Bulan</div>
          </div>
          <div style={{ padding: '16px 18px' }}>
            {loading ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAB2BC', fontSize: '13px' }}>Memuat grafik...</div>
            ) : (
              <BarChart data={grafik} />
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#F5EEF8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#7D3C98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Distribusi Status</div>
          </div>
          <div style={{ padding: '20px 18px' }}>
            {loading ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAB2BC', fontSize: '13px' }}>Memuat...</div>
            ) : (
              <DonutChart stats={stats} />
            )}
          </div>
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#F3FAF5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Aktivitas Terbaru</div>
          </div>
          <button onClick={() => navigate('/admin/permohonan')}
            style={{ fontSize: '12px', color: '#2E7D32', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
            Lihat Semua →
          </button>
        </div>
        {loading ? (
          <div style={{ padding: '24px', color: '#AAB2BC', fontSize: '13px', textAlign: 'center' }}>Memuat aktivitas...</div>
        ) : (
          <div>
            {aktivitas.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Belum ada aktivitas terbaru.</div>}
            {aktivitas.map((a: any, i: number) => (
              <div key={i} style={{ padding: '13px 18px', borderTop: i > 0 ? '1px solid #E5E7EB' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12.5px', fontWeight: '700', color: '#2E7D32' }}>{a.kode_permohonan}</div>
                  <div style={{ fontSize: '12.5px', color: '#444', marginTop: '2px' }}>{a.instansi}</div>
                  <div style={{ fontSize: '11px', color: '#AAB2BC', marginTop: '2px' }}>{formatTanggal(a.created_at || a.tgl_pengajuan_awal)}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

     {/* CTA ke Halaman Permohonan */}
      <div style={{ background: 'linear-gradient(135deg,#2E7D32,#3D9142)', borderRadius: '14px', padding: '20px 24px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ color: 'white' }}>
          <div style={{ fontSize: '15px', fontWeight: '700' }}>Lihat semua permohonan</div>
          <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '3px' }}>Proses, filter, dan kelola seluruh permohonan kunjungan kerja</div>
        </div>
        <button onClick={() => navigate('/admin/permohonan')}
          style={{ background: 'white', color: '#2E7D32', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          Buka Daftar Permohonan →
        </button>
      </div>
    </AdminLayout>
  );
}
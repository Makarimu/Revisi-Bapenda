import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllTanggalDiblokir, blokirTanggal, bukaBlokirTanggal } from '../../api/admin/tanggalDiblokir';

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function formatTanggalFull(s) {
  if (!s) return '-';
  try { const d = new Date(s); return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`; }
  catch { return s; }
}

export default function KelolaKalender() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formKet, setFormKet] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calendar state
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState('');

  const showToast = (msg, type='success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
  try {
    const res = await getAllTanggalDiblokir();
    setData(res.data || res || []);
  } catch {
    showToast('Gagal memuat data', 'error');
  } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const blockedDates = new Set(data.map(d => d.tanggal?.split('T')[0] || d.tanggal));

  const handleCalendarClick = (dateStr) => {
    setSelectedDate(dateStr);
    setFormDate(dateStr);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDate) { showToast('Tanggal wajib dipilih', 'error'); return; }
    setSubmitting(true);
    try {
      await blokirTanggal({ tanggal: formDate, keterangan: formKet });
      showToast('Tanggal berhasil diblokir!');
      setShowForm(false); setFormDate(''); setFormKet(''); setSelectedDate('');
      fetchData();
    } catch {
      showToast('Gagal memblokir tanggal', 'error');
    } finally { setSubmitting(false); }
  };

  const handleHapus = async (tgl) => {
    if (!confirm('Yakin ingin membuka blokir tanggal ini?')) return;
    try {
      await bukaBlokirTanggal(tgl);
      showToast('Blokir tanggal berhasil dibuka!');
      fetchData();
    } catch {
      showToast('Gagal membuka blokir', 'error');
    }
  };

  // Render calendar
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDayClass = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return 'weekend';
    if (d < today && d.toDateString() !== today.toDateString()) return 'past';
    if (blockedDates.has(dateStr)) return 'blocked';
    return 'available';
  };

  const dayStyle = (cls, isSelected) => {
    const base = {
      width:'36px', height:'36px', borderRadius:'8px', display:'flex', alignItems:'center',
      justifyContent:'center', fontSize:'13px', fontWeight:'600', cursor:'default', margin:'1px', transition:'all 0.15s'
    };
    if (isSelected) return { ...base, background:'#2E7D32', color:'white', cursor:'pointer', boxShadow:'0 2px 8px rgba(46,125,50,0.3)' };
    if (cls === 'blocked') return { ...base, background:'#FDEDEC', color:'#922B21', border:'1px solid #FBCFCB', cursor:'pointer' };
    if (cls === 'available') return { ...base, background:'#F3FAF5', color:'#256628', cursor:'pointer' };
    return { ...base, background:'transparent', color:'#D1D5DB' };
  };

  return (
    <AdminLayout>
      <style>{`
        .kalender-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .kalender-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {toast && (
        <div style={{position:'fixed',bottom:'20px',right:'20px',padding:'11px 18px',borderRadius:'8px',color:'white',fontSize:'13px',fontWeight:'500',zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,0.15)',background:toast.type==='error'?'#e74c3c':'#2E7D32'}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{marginBottom:'20px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#000'}}>Kelola Kalender</h2>
          <p style={{fontSize:'13px',color:'#6B7280',marginTop:'3px'}}>Blokir atau buka tanggal untuk kunjungan kerja</p>
        </div>
        <button onClick={() => { setShowForm(true); setFormDate(''); setSelectedDate(''); }}
          style={{display:'flex',alignItems:'center',gap:'7px',padding:'9px 16px',border:'none',borderRadius:'8px',background:'#2E7D32',color:'white',cursor:'pointer',fontSize:'13px',fontWeight:'700',fontFamily:'inherit'}}>
          + Blokir Tanggal
        </button>
      </div>

      <div className="kalender-grid">
        {/* Kalender */}
        <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #E5E7EB',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <button onClick={()=>{const d=new Date(viewDate);d.setMonth(d.getMonth()-1);setViewDate(d);}}
              style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid #E5E7EB',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              ‹
            </button>
            <span style={{fontSize:'15px',fontWeight:'700',color:'#000'}}>{MONTHS_ID[month]} {year}</span>
            <button onClick={()=>{const d=new Date(viewDate);d.setMonth(d.getMonth()+1);setViewDate(d);}}
              style={{width:'32px',height:'32px',borderRadius:'8px',border:'1px solid #E5E7EB',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              ›
            </button>
          </div>
          <div style={{padding:'16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'0',marginBottom:'4px'}}>
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>(
                <div key={d} style={{textAlign:'center',fontSize:'10px',fontWeight:'700',color:'#6B7280',padding:'6px 0',textTransform:'uppercase'}}>{d}</div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
              {Array.from({length:firstDay},(_,i)=><div key={'e'+i}/>)}
              {Array.from({length:daysInMonth},(_,i)=>{
                const day = i+1;
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const cls = getDayClass(dateStr);
                const isSelected = selectedDate === dateStr;
                const isClickable = cls === 'available' || cls === 'blocked';
                return (
                  <div key={dateStr} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <div
                      style={dayStyle(cls, isSelected)}
                      title={cls==='blocked'?'Klik untuk buka blokir':cls==='available'?'Klik untuk blokir':''}
                      onClick={() => {
                        if (!isClickable) return;
                        if (cls === 'blocked') {
                          if(confirm(`Buka blokir tanggal ${formatTanggalFull(dateStr)}?`)){
                            handleHapus(dateStr);
                          }
                        } else {
                          handleCalendarClick(dateStr);
                        }
                      }}>
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legenda */}
            <div style={{display:'flex',gap:'14px',flexWrap:'wrap',marginTop:'14px',paddingTop:'12px',borderTop:'1px solid #E5E7EB'}}>
              {[
                {color:'#F3FAF5',border:'none',label:'Tersedia'},
                {color:'#FDEDEC',border:'1px solid #FBCFCB',label:'Diblokir'},
                {color:'transparent',border:'none',label:'Weekend/Lalu',textColor:'#D1D5DB'},
              ].map(l=>(
                <div key={l.label} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                  <div style={{width:'14px',height:'14px',borderRadius:'4px',background:l.color,border:l.border||'1px solid #E5E7EB',flexShrink:0}}/>
                  <span style={{fontSize:'11px',color:l.textColor||'#6B7280',fontWeight:'500'}}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel kanan: Form + Daftar Blokir */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {/* Form Blokir */}
          {showForm && (
            <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1.5px solid #2E7D32',overflow:'hidden'}}>
              <div style={{padding:'14px 18px',borderBottom:'1px solid #E5E7EB',background:'#2E7D32',color:'white'}}>
                <div style={{fontSize:'14px',fontWeight:'700'}}>Blokir Tanggal</div>
                <div style={{fontSize:'11px',opacity:0.8,marginTop:'2px'}}>Tanggal yang diblokir tidak dapat dipilih pemohon</div>
              </div>
              <form onSubmit={handleSubmit} style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
                <div>
                  <label style={{fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>Tanggal *</label>
                  <input type="date" value={formDate} onChange={e=>setFormDate(e.target.value)} required
                    style={{width:'100%',padding:'9px 11px',border:'1px solid #D9DEE5',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>
                <div>
                  <label style={{fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>Keterangan / Alasan</label>
                  <input type="text" value={formKet} onChange={e=>setFormKet(e.target.value)}
                    placeholder="Contoh: Libur Nasional / Rapat Internal"
                    style={{width:'100%',padding:'9px 11px',border:'1px solid #D9DEE5',borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box'}}/>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <button type="button" onClick={()=>setShowForm(false)}
                    style={{flex:'none',background:'white',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'9px 16px',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                    Batal
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{flex:1,background:submitting?'#aaa':'#2E7D32',color:'white',border:'none',borderRadius:'8px',padding:'9px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                    {submitting?'Menyimpan...':'Blokir Tanggal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Daftar Diblokir */}
          <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #E5E7EB',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#000'}}>Daftar Tanggal Diblokir</div>
              <span style={{background:'#FDEDEC',color:'#922B21',border:'1px solid #FBCFCB',borderRadius:'20px',padding:'2px 10px',fontSize:'11px',fontWeight:'700'}}>
                {data.length} tanggal
              </span>
            </div>
            {loading ? (
              <div style={{padding:'24px',textAlign:'center',color:'#6B7280',fontSize:'13px'}}>Memuat...</div>
            ) : data.length === 0 ? (
              <div style={{padding:'28px',textAlign:'center',color:'#6B7280'}}>
                <div style={{fontSize:'28px',marginBottom:'8px'}}>📅</div>
                <div style={{fontSize:'13px'}}>Belum ada tanggal yang diblokir.</div>
              </div>
            ) : (
              <div style={{maxHeight:'380px',overflowY:'auto'}}>
                {data.map((item, i) => {
                  const tgl = item.tanggal?.split('T')[0] || item.tanggal;
                  return (
                    <div key={i} style={{padding:'12px 18px',borderTop:i>0?'1px solid #E5E7EB':'none',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px'}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:'13px',fontWeight:'700',color:'#922B21'}}>{formatTanggalFull(tgl)}</div>
                        <div style={{fontSize:'11.5px',color:'#6B7280',marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.keterangan||'Tidak ada keterangan'}</div>
                        <div style={{fontSize:'11px',color:'#AAB2BC',marginTop:'2px'}}>oleh {item.diblokir_oleh||'Admin'}</div>
                      </div>
                      <button onClick={()=>handleHapus(tgl)}
                        style={{flexShrink:0,background:'#FDEDEC',border:'1px solid #FBCFCB',borderRadius:'7px',padding:'6px 10px',fontSize:'11px',fontWeight:'700',color:'#922B21',cursor:'pointer',fontFamily:'inherit'}}>
                        Buka
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

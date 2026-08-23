import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  getAllKontakTelepon,
  tambahKontakTelepon,
  editKontakTelepon,
  toggleStatusKontakTelepon,
  hapusKontakTelepon
} from '../../api/admin/kontakTelepon';

const EMPTY_FORM = { nama_pic: '', nomor_telepon: '', keterangan: '' };

function FormInput({ label, name, type = 'text', placeholder, required, value, error, onChange }: any) {
  return (
    <div>
      <label style={{fontSize:'11px',fontWeight:'700',color:'#64748B',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'6px'}}>
        {label}{required&&<span style={{color:'#B91C1C'}}> *</span>}
      </label>
      <input type={type} value={value} placeholder={placeholder} onChange={onChange}
        style={{width:'100%',padding:'10px 12px',minHeight:'42px',border:`1px solid ${error?'#B91C1C':'#D9DEE5'}`,borderRadius:'8px',fontSize:'13.5px',fontFamily:'inherit',boxSizing:'border-box'}}/>
      {error&&<div style={{fontSize:'11.5px',color:'#B91C1C',marginTop:'4px'}}>{error}</div>}
    </div>
  );
}

export default function KontakTeleponPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: any, type = 'success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
  try {
    const res = await getAllKontakTelepon();
    setData(res.data || res || []);
  } catch {
    showToast('Gagal memuat data kontak', 'error');
  } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const validate = () => {
    const errs: any = {};
    if (!form.nama_pic.trim()) errs.nama_pic = 'Wajib diisi';
    if (!form.nomor_telepon.trim()) errs.nomor_telepon = 'Wajib diisi';
    else if (form.nomor_telepon.trim().length < 8) errs.nomor_telepon = 'Minimal 8 karakter';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenAdd = () => {
    setForm({ ...EMPTY_FORM }); setErrors({}); setEditId(null); setShowForm(true);
  };

  const handleOpenEdit = (item: any) => {
    setForm({ nama_pic: item.nama_pic, nomor_telepon: item.nomor_telepon, keterangan: item.keterangan || '' });
    setErrors({}); setEditId(item.id); setShowForm(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editId) {
        await editKontakTelepon(editId, form);
        showToast('Data kontak berhasil diperbarui!');
      } else {
        await tambahKontakTelepon(form);
        showToast('Kontak berhasil ditambahkan!');
      }
      setShowForm(false); setForm({ ...EMPTY_FORM }); setEditId(null);
      fetchData();
    } catch {
      showToast('Gagal menyimpan kontak', 'error');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (id: any) => {
    try {
      await toggleStatusKontakTelepon(id);
      fetchData();
    } catch {
      showToast('Gagal mengubah status', 'error');
    }
  };

  const handleHapus = async (id: any, nama: any) => {
    if (!confirm(`Hapus kontak "${nama}"?`)) return;
    try {
      await hapusKontakTelepon(id);
      showToast('Kontak berhasil dihapus!');
      fetchData();
    } catch {
      showToast('Gagal menghapus kontak', 'error');
    }
  };

  const handleFormChange = (name: keyof typeof EMPTY_FORM) => (e: any) => {
    setForm((current: any) => ({ ...current, [name]: e.target.value }));
  };

  return (
    <AdminLayout>
      <style>{`
        .kontak-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .kontak-form-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .kontak-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {toast && (
        <div style={{position:'fixed',bottom:'24px',right:'24px',padding:'12px 20px',borderRadius:'10px',color:'white',fontSize:'13.5px',fontWeight:'600',zIndex:9999,boxShadow:'var(--shadow-lg)',background:toast.type==='error'?'#B91C1C':'#001178'}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{marginBottom:'24px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontSize:'22px',fontWeight:'800',color:'#001178',letterSpacing:'-0.3px'}}>Kontak Telepon</h2>
          <p style={{fontSize:'13.5px',color:'#64748B',marginTop:'3px'}}>Kelola kontak yang ditampilkan pada email persetujuan kunjungan</p>
        </div>
        <button onClick={handleOpenAdd}
          style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',minHeight:'42px',border:'none',borderRadius:'8px',background:'#0028B3',color:'white',cursor:'pointer',fontSize:'13px',fontWeight:'700',fontFamily:'inherit',boxShadow:'0 2px 8px rgba(0,40,179,0.2)'}}>
          + Tambah Kontak
        </button>
      </div>

      {/* Info Box */}
      <div style={{background:'#F0F6FF',border:'1px solid #C5DBFF',borderRadius:'14px',padding:'14px 18px',marginBottom:'20px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0028B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:'2px'}}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p style={{fontSize:'13.5px',color:'#001178',lineHeight:'1.6',margin:0}}>
          Kontak yang berstatus <strong>Aktif</strong> akan otomatis dicantumkan dalam email notifikasi persetujuan kunjungan, sehingga pemohon dapat menghubungi kontak tersebut.
        </p>
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div style={{background:'white',borderRadius:'16px',boxShadow:'var(--shadow-md)',border:'1.5px solid #0028B3',overflow:'hidden',marginBottom:'20px'}}>
          <div style={{padding:'16px 20px',background:'#0028B3',color:'white',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:'15px',fontWeight:'700'}}>{editId ? 'Edit Kontak' : 'Tambah Kontak Baru'}</div>
            <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',width:'30px',height:'30px',borderRadius:'8px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="kontak-form-grid" style={{padding:'20px'}}>
            <FormInput label="Nama/Bagian" name="nama_pic" value={form.nama_pic} error={errors.nama_pic} onChange={handleFormChange('nama_pic')} placeholder="Misal: Bp. Budi / Resepsionis" required/>
            <FormInput label="Nomor Telepon" name="nomor_telepon" value={form.nomor_telepon} error={errors.nomor_telepon} onChange={handleFormChange('nomor_telepon')} placeholder="08xxxxxxxxxx" required/>
            <FormInput label="Keterangan (Opsional)" name="keterangan" value={form.keterangan} error={errors.keterangan} onChange={handleFormChange('keterangan')} placeholder="Catatan tambahan"/>
            <div style={{gridColumn:'1/-1',display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'4px'}}>
              <button type="button" onClick={()=>setShowForm(false)}
                style={{background:'white',border:'1px solid #CBD5E1',borderRadius:'8px',padding:'10px 18px',minHeight:'42px',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                Batal
              </button>
              <button type="submit" disabled={submitting}
                style={{background:submitting?'#94A3B8':'#0028B3',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',minHeight:'42px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 2px 8px rgba(0,40,179,0.2)'}}>
                {submitting?'Menyimpan...':(editId?'Simpan Perubahan':'Tambah Kontak')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Kontak */}
      <div style={{background:'white',borderRadius:'16px',boxShadow:'var(--shadow-sm)',border:'1px solid rgba(228, 231, 237, 0.8)',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #E4E7ED',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h3 style={{fontSize:'15px',fontWeight:'700',color:'#0F172A'}}>Daftar Kontak</h3>
          <span style={{fontSize:'12.5px',color:'#64748B',fontWeight:'500'}}>{data.length} kontak</span>
        </div>

        {loading ? (
          <div style={{padding:'36px',textAlign:'center',color:'#64748B',fontSize:'13.5px'}}>Memuat data...</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Nama PIC','No. Telepon','Keterangan','Status','Aksi'].map(h=>(
                    <th key={h} style={{background:'#F8FAFC',padding:'12px 16px',fontSize:'11px',fontWeight:'700',color:'#64748B',textTransform:'uppercase',letterSpacing:'0.6px',textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #E2E8F0'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'36px',color:'#64748B',fontSize:'13.5px'}}>Belum ada data kontak</td></tr>}
                {data.map((item: any) => (
                  <tr key={item.id} style={{borderTop:'1px solid #F1F5F9',opacity:item.status==='Nonaktif'?0.65:1,transition:'background 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'14px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <div style={{width:'36px',height:'36px',borderRadius:'50%',background:item.status==='Aktif'?'#C5DBFF':'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={item.status==='Aktif'?'#0028B3':'#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </div>
                        <span style={{fontSize:'13.5px',fontWeight:'700',color:'#0F172A'}}>{item.nama_pic}</span>
                      </div>
                    </td>
                    <td style={{padding:'14px 16px',fontSize:'13.5px',fontFamily:'monospace',color:'#334155'}}>{item.nomor_telepon}</td>
                    <td style={{padding:'14px 16px',fontSize:'13px',color:'#64748B'}}>{item.keterangan||'-'}</td>
                    <td style={{padding:'14px 16px'}}>
                      <button onClick={()=>handleToggle(item.id)}
                        style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 12px',borderRadius:'20px',fontSize:'11.5px',fontWeight:'700',cursor:'pointer',border:'1.5px solid',transition:'all 0.2s',fontFamily:'inherit',
                          background: item.status==='Aktif'?'#DCFCE7':'#F8FAFC',
                          color: item.status==='Aktif'?'#15803D':'#64748B',
                          borderColor: item.status==='Aktif'?'#86EFAC':'#CBD5E1',
                        }}>
                        <span style={{width:'7px',height:'7px',borderRadius:'50%',background:item.status==='Aktif'?'#15803D':'#94A3B8',flexShrink:0,display:'inline-block'}}/>
                        {item.status}
                      </button>
                    </td>
                    <td style={{padding:'14px 16px'}}>
                      <div style={{display:'flex',gap:'8px'}}>
                        <button onClick={()=>handleOpenEdit(item)}
                          style={{padding:'6px 14px',border:'1px solid #CBD5E1',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer',background:'#F8FAFC',color:'#334155',fontFamily:'inherit'}}>
                          Edit
                        </button>
                        <button onClick={()=>handleHapus(item.id, item.nama_pic)}
                          style={{padding:'6px 14px',border:'1px solid #FECACA',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer',background:'#FEF2F2',color:'#B91C1C',fontFamily:'inherit'}}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

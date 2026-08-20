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
      <label style={{fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>
        {label}{required&&<span style={{color:'#e74c3c'}}> *</span>}
      </label>
      <input type={type} value={value} placeholder={placeholder} onChange={onChange}
        style={{width:'100%',padding:'9px 11px',border:`1px solid ${error?'#e74c3c':'#D9DEE5'}`,borderRadius:'8px',fontSize:'13px',fontFamily:'inherit',boxSizing:'border-box'}}/>
      {error&&<div style={{fontSize:'11px',color:'#e74c3c',marginTop:'3px'}}>{error}</div>}
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
          gap: 12px;
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
        <div style={{position:'fixed',bottom:'20px',right:'20px',padding:'11px 18px',borderRadius:'8px',color:'white',fontSize:'13px',fontWeight:'500',zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,0.15)',background:toast.type==='error'?'#e74c3c':'#2E7D32'}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{marginBottom:'20px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#000'}}>Kontak Telepon</h2>
          <p style={{fontSize:'13px',color:'#6B7280',marginTop:'3px'}}>Kelola kontak yang ditampilkan pada email persetujuan kunjungan</p>
        </div>
        <button onClick={handleOpenAdd}
          style={{display:'flex',alignItems:'center',gap:'7px',padding:'9px 16px',border:'none',borderRadius:'8px',background:'#2E7D32',color:'white',cursor:'pointer',fontSize:'13px',fontWeight:'700',fontFamily:'inherit'}}>
          + Tambah Kontak
        </button>
      </div>

      {/* Info Box */}
      <div style={{background:'#F3FAF5',border:'1px solid #C6DCC8',borderRadius:'10px',padding:'12px 16px',marginBottom:'16px',display:'flex',gap:'10px',alignItems:'flex-start'}}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:'2px'}}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p style={{fontSize:'13px',color:'#256628',lineHeight:'1.6',margin:0}}>
          Kontak yang berstatus <strong>Aktif</strong> akan otomatis dicantumkan dalam email notifikasi persetujuan kunjungan, sehingga pemohon dapat menghubungi kontak tersebut.
        </p>
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1.5px solid #2E7D32',overflow:'hidden',marginBottom:'16px'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #E5E7EB',background:'#2E7D32',color:'white',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:'14px',fontWeight:'700'}}>{editId ? 'Edit Kontak' : 'Tambah Kontak Baru'}</div>
            <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'white',width:'28px',height:'28px',borderRadius:'6px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="kontak-form-grid" style={{padding:'16px'}}>
            <FormInput label="Nama/Bagian" name="nama_pic" value={form.nama_pic} error={errors.nama_pic} onChange={handleFormChange('nama_pic')} placeholder="Misal: Bp. Budi / Resepsionis" required/>
            <FormInput label="Nomor Telepon" name="nomor_telepon" value={form.nomor_telepon} error={errors.nomor_telepon} onChange={handleFormChange('nomor_telepon')} placeholder="08xxxxxxxxxx" required/>
            <FormInput label="Keterangan (Opsional)" name="keterangan" value={form.keterangan} error={errors.keterangan} onChange={handleFormChange('keterangan')} placeholder="Catatan tambahan"/>
            <div style={{gridColumn:'1/-1',display:'flex',gap:'8px',justifyContent:'flex-end'}}>
              <button type="button" onClick={()=>setShowForm(false)}
                style={{background:'white',border:'1px solid #E5E7EB',borderRadius:'8px',padding:'9px 18px',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                Batal
              </button>
              <button type="submit" disabled={submitting}
                style={{background:submitting?'#aaa':'#2E7D32',color:'white',border:'none',borderRadius:'8px',padding:'9px 24px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                {submitting?'Menyimpan...':(editId?'Simpan Perubahan':'Tambah Kontak')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Kontak */}
      <div style={{background:'white',borderRadius:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.06)',border:'1px solid #E5E7EB',overflow:'hidden'}}>
        <div style={{padding:'13px 18px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h3 style={{fontSize:'14px',fontWeight:'700',color:'#000'}}>Daftar Kontak</h3>
          <span style={{fontSize:'12px',color:'#6B7280'}}>{data.length} kontak</span>
        </div>

        {loading ? (
          <div style={{padding:'32px',textAlign:'center',color:'#6B7280',fontSize:'13px'}}>Memuat data...</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Nama PIC','No. Telepon','Keterangan','Status','Aksi'].map(h=>(
                    <th key={h} style={{background:'#F7F8FA',padding:'9px 13px',fontSize:'10px',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'32px',color:'#6B7280'}}>Belum ada data kontak</td></tr>}
                {data.map((item: any) => (
                  <tr key={item.id} style={{borderTop:'1px solid #E5E7EB',opacity:item.status==='Nonaktif'?0.65:1,transition:'background 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 13px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{width:'34px',height:'34px',borderRadius:'50%',background:item.status==='Aktif'?'#F3FAF5':'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={item.status==='Aktif'?'#2E7D32':'#AAB2BC'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </div>
                        <span style={{fontSize:'13px',fontWeight:'700',color:'#222'}}>{item.nama_pic}</span>
                      </div>
                    </td>
                    <td style={{padding:'12px 13px',fontSize:'13px',fontFamily:'monospace',color:'#444'}}>{item.nomor_telepon}</td>
                    <td style={{padding:'12px 13px',fontSize:'13px',color:'#6B7280'}}>{item.keterangan||'-'}</td>
                    <td style={{padding:'12px 13px'}}>
                      <button onClick={()=>handleToggle(item.id)}
                        style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:'700',cursor:'pointer',border:'1.5px solid',transition:'all 0.2s',fontFamily:'inherit',
                          background: item.status==='Aktif'?'#EAFAF1':'#F7F8FA',
                          color: item.status==='Aktif'?'#256628':'#6B7280',
                          borderColor: item.status==='Aktif'?'#2E7D32':'#E5E7EB',
                        }}>
                        <span style={{width:'7px',height:'7px',borderRadius:'50%',background:item.status==='Aktif'?'#2E7D32':'#AAB2BC',flexShrink:0,display:'inline-block'}}/>
                        {item.status}
                      </button>
                    </td>
                    <td style={{padding:'12px 13px'}}>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={()=>handleOpenEdit(item)}
                          style={{padding:'5px 12px',border:'1px solid #E5E7EB',borderRadius:'7px',fontSize:'12px',fontWeight:'600',cursor:'pointer',background:'#F7F8FA',color:'#444',fontFamily:'inherit'}}>
                          Edit
                        </button>
                        <button onClick={()=>handleHapus(item.id, item.nama_pic)}
                          style={{padding:'5px 12px',border:'1px solid #FBCFCB',borderRadius:'7px',fontSize:'12px',fontWeight:'600',cursor:'pointer',background:'#FDEDEC',color:'#922B21',fontFamily:'inherit'}}>
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

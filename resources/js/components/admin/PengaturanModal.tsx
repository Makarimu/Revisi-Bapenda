import React, { useState, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings, HeaderSettings } from '../../api/settings';

interface PengaturanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PengaturanModal({ isOpen, onClose }: PengaturanModalProps) {
  const [formData, setFormData] = useState<HeaderSettings>({
    header_telepon: 'Telp: (021) 875-8605',
    header_jam_layanan: 'Jam Layanan: Senin – Jumat (08.00 – 16.00 WIB)',
    header_link_portal_bogor: 'https://bogorkab.go.id',
    header_link_portal_ekabo: 'https://ekabo.bogorkab.go.id',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdminSettings();
      if (res?.data) {
        setFormData({
          header_telepon: res.data.header_telepon || '',
          header_jam_layanan: res.data.header_jam_layanan || '',
          header_link_portal_bogor: res.data.header_link_portal_bogor || '',
          header_link_portal_ekabo: res.data.header_link_portal_ekabo || '',
        });
      }
    } catch {
      // ignore fetch error on unopened state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateAdminSettings(formData);
      showToast(res?.message || 'Pengaturan berhasil diperbarui!');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Gagal memperbarui pengaturan. Pastikan database MySQL aktif & migrasi telah dijalankan.';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 17, 120, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#FFFFFF',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#C5DBFF',
                color: '#001178',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#001178' }}>
                Pengaturan Header Publik
              </h3>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>
                Atur informasi kontak & jam layanan pada bagian paling atas web publik
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: saving ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Toast Notification */}
          {toast && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: toast.type === 'success' ? '#DEF7EC' : '#FDE8E8',
                border: `1px solid ${toast.type === 'success' ? '#31C48D' : '#F8B4B4'}`,
                color: toast.type === 'success' ? '#03543F' : '#9B1C1C',
                fontWeight: 600,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{toast.msg}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #C5DBFF', borderTopColor: '#0028B3', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '13.5px', color: '#64748B' }}>Memuat data pengaturan...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Telepon Header */}
                <div>
                  <label htmlFor="modal_header_telepon" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Nomor Telepon Header Publik
                  </label>
                  <input
                    id="modal_header_telepon"
                    type="text"
                    name="header_telepon"
                    value={formData.header_telepon}
                    onChange={handleChange}
                    placeholder="Contoh: Telp: (021) 875-8605"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Jam Layanan Header */}
                <div>
                  <label htmlFor="modal_header_jam_layanan" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Jam Layanan Header Publik
                  </label>
                  <input
                    id="modal_header_jam_layanan"
                    type="text"
                    name="header_jam_layanan"
                    value={formData.header_jam_layanan}
                    onChange={handleChange}
                    placeholder="Contoh: Jam Layanan: Senin – Jumat (08.00 – 16.00 WIB)"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Live Preview Bar */}
              <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>
                  Pratinjau Topbar Publik (Live Preview):
                </div>
                <div className="gov-topbar" style={{ borderRadius: '8px', overflow: 'hidden', pointerEvents: 'none' }}>
                  <div className="gov-topbar-inner" style={{ padding: '8px 14px' }}>
                    <div className="gov-topbar-left" style={{ gap: '12px' }}>
                      <div className="gov-topbar-item" style={{ fontSize: '11.5px' }}>
                        <span>{formData.header_telepon || 'Telp: (021) 875-8605'}</span>
                      </div>
                      <div className="gov-topbar-divider" />
                      <div className="gov-topbar-item" style={{ fontSize: '11.5px' }}>
                        <span>{formData.header_jam_layanan || 'Jam Layanan: Senin – Jumat (08.00 – 16.00 WIB)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: 'linear-gradient(135deg, #0028B3 0%, #001178 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,40,179,0.2)',
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Simpan Pengaturan
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

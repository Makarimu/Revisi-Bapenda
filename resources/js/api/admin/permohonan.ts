import axios from '../axios';

export const getAllPermohonan = async (filters = {}) => {
  const response = await axios.get('/admin/permohonan', { params: filters });
  return response.data;
};

export const prosesPermohonan = async (kode, data) => {
  const response = await axios.put(`/admin/permohonan/${kode}/proses`, data);
  return response.data;
};

export const selesaikanPermohonan = async (kode: string) => {
  const response = await axios.post(`/admin/permohonan/${kode}/selesai`);
  return response.data;
};

export const editPermohonanAdmin = async (kode, data) => {
  const response = await axios.put(`/admin/permohonan/${kode}`, data);
  return response.data;
};

export const hapusPermohonan = async (kode) => {
  const response = await axios.delete(`/admin/permohonan/${kode}`);
  return response.data;
};

export const exportPermohonan = async (filters: {
  rentang: 'semua' | 'tanggal';
  start_date?: string;
  end_date?: string;
  status?: string[];
}) => {
  const response = await axios.post('/admin/permohonan/export', filters, {
    responseType: 'blob',
  });
  return response;
};

import axios from '../axios';

export const getAllKontakTelepon = async () => {
  const response = await axios.get('/admin/kontak-telepon');
  return response.data;
};

export const tambahKontakTelepon = async (data) => {
  const response = await axios.post('/admin/kontak-telepon', data);
  return response.data;
};

export const editKontakTelepon = async (id, data) => {
  const response = await axios.put(`/admin/kontak-telepon/${id}`, data);
  return response.data;
};

export const toggleStatusKontakTelepon = async (id) => {
  const response = await axios.patch(`/admin/kontak-telepon/${id}/toggle-status`);
  return response.data;
};

export const hapusKontakTelepon = async (id) => {
  const response = await axios.delete(`/admin/kontak-telepon/${id}`);
  return response.data;
};

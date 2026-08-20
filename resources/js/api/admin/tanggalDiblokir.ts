import axios from '../axios';

export const getAllTanggalDiblokir = async () => {
  const response = await axios.get('/admin/tanggal-diblokir');
  return response.data;
};

export const blokirTanggal = async (data) => {
  const response = await axios.post('/admin/tanggal-diblokir', data);
  return response.data;
};

export const bukaBlokirTanggal = async (tanggal) => {
  const response = await axios.delete(`/admin/tanggal-diblokir/${tanggal}`);
  return response.data;
};

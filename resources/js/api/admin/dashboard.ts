import axios from '../axios';

export const getStatistik = async () => {
  const response = await axios.get('/admin/dashboard/statistik');
  return response.data;
};

export const getPermohonanHariIni = async () => {
  const response = await axios.get('/admin/dashboard/permohonan-hari-ini');
  return response.data;
};

export const getGrafikBulanan = async () => {
  const response = await axios.get('/admin/dashboard/grafik-bulanan');
  return response.data;
};

export const getAktivitasTerbaru = async () => {
  const response = await axios.get('/admin/dashboard/aktivitas-terbaru');
  return response.data;
};

import api from '../services/api';

export interface RiwayatKunjunganItem {
  id: number;
  instansi: string;
  tanggal_kunjungan: string;
  tujuan: string;
  jumlah_peserta: number;
  rating: number;
  review: string;
  created_at_review: string;
}

export interface RiwayatKunjunganStatistik {
  total_selesai: number;
  total_review: number;
  rata_rata_rating: number;
}

export interface RiwayatKunjunganParams {
  search?: string;
  rating?: string | number;
  sort?: string;
  page?: number;
  per_page?: number;
}

export async function getRiwayatKunjungan(params: RiwayatKunjunganParams = {}) {
  const response = await api.get('/riwayat-kunjungan', { params });
  return response.data;
}

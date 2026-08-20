import axios from '../axios';

export const getAllReviews = async (filters: Record<string, any> = {}) => {
  const response = await axios.get('/admin/reviews', { params: filters });
  return response.data;
};

export const prosesReview = async (id: number, aksi: 'approve' | 'reject') => {
  const response = await axios.post(`/admin/reviews/${id}/proses`, { aksi });
  return response.data;
};

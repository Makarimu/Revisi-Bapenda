import api from '../services/api';

export interface SubmitReviewPayload {
  rating: number;
  review: string;
}

export const submitReview = async (kode: string, data: SubmitReviewPayload) => {
  const response = await api.post(`/permohonan/${kode}/review`, data);
  return response.data;
};

export const getApprovedReviews = async () => {
  const response = await api.get('/reviews/approved');
  return response.data;
};

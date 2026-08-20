import axios from '../axios';

export const login = async (username, password) => {
  const response = await axios.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get('/auth/me');
  return response.data;
};

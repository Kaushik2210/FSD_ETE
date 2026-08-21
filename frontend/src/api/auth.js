import api from './axios.js';

export const registerUser = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const loginUser = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const fetchMe = () => api.get('/auth/me').then((r) => r.data);
export const toggleBookmarkApi = (ideaId) =>
  api.patch(`/auth/bookmarks/${ideaId}`).then((r) => r.data);

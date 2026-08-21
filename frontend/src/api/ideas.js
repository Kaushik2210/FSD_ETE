import api from './axios.js';

export const fetchIdeas = (params) => api.get('/ideas', { params }).then((r) => r.data);
export const fetchIdea = (id) => api.get(`/ideas/${id}`).then((r) => r.data);
export const createIdeaApi = (payload) => api.post('/ideas', payload).then((r) => r.data);
export const updateIdeaApi = (id, payload) => api.put(`/ideas/${id}`, payload).then((r) => r.data);
export const deleteIdeaApi = (id) => api.delete(`/ideas/${id}`).then((r) => r.data);
export const voteIdeaApi = (id) => api.patch(`/ideas/${id}/vote`).then((r) => r.data);
export const unvoteIdeaApi = (id) => api.delete(`/ideas/${id}/vote`).then((r) => r.data);
export const updateStatusApi = (id, status) =>
  api.patch(`/ideas/${id}/status`, { status }).then((r) => r.data);
export const fetchStats = () => api.get('/ideas/meta/stats').then((r) => r.data);
export const fetchBookmarked = () => api.get('/ideas/meta/bookmarks').then((r) => r.data);
export const fetchMyIdeas = () => api.get('/ideas/meta/mine').then((r) => r.data);
export const fetchOptions = () => api.get('/ideas/meta/options').then((r) => r.data);

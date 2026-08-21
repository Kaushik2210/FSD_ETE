import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT to every request once the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cih_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 anywhere means the token is gone/expired -- clear it and let the
// current page's own error state show a message rather than force-redirecting,
// so the user does not lose in-progress form input.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cih_token');
      localStorage.removeItem('cih_user');
    }
    return Promise.reject(error);
  }
);

export default api;

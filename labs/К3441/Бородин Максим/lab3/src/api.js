import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recipe-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(error) {
  if (!error.response) return 'Сервер недоступен. Запустите npm run api.';
  if (error.response.status === 401) return 'Нужно войти в профиль.';
  if (error.response.status === 403) return 'Нет доступа к этому действию.';
  if (error.response.status === 404) return 'Запись не найдена.';
  return error.response.data?.message || error.response.data?.error || `Ошибка сервера: ${error.response.status}`;
}

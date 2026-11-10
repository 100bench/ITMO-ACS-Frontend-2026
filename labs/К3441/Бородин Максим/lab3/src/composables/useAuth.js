import { ref } from 'vue';
import { api } from '../api.js';

function storedUser() {
  try { return JSON.parse(localStorage.getItem('recipe-user') || 'null'); }
  catch { return null; }
}

const user = ref(storedUser());

function saveSession(response) {
  localStorage.setItem('recipe-token', response.accessToken);
  localStorage.setItem('recipe-user', JSON.stringify(response.user));
  user.value = response.user;
}

export function useAuth() {
  return {
    user,
    isLoggedIn: () => !!user.value && !!localStorage.getItem('recipe-token'),
    async login(email, password) {
      const { data } = await api.post('/login', { email, password });
      saveSession(data);
    },
    async register(name, email, password) {
      const { data } = await api.post('/register', { name, email, password });
      saveSession(data);
    },
    logout() {
      localStorage.removeItem('recipe-token');
      localStorage.removeItem('recipe-user');
      user.value = null;
    },
  };
}

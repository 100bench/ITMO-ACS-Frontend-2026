const api = {
  user() {
    try { return JSON.parse(localStorage.getItem('recipe-user') || 'null'); }
    catch { return null; }
  },
  token() { return localStorage.getItem('recipe-token'); },
  logout() {
    localStorage.removeItem('recipe-token');
    localStorage.removeItem('recipe-user');
  },
  async request(path, options = {}) {
    const headers = { ...options.headers };
    if (options.body) headers['Content-Type'] = 'application/json';
    if (this.token()) headers.Authorization = `Bearer ${this.token()}`;
    let response;
    try { response = await fetch(path, { ...options, headers }); }
    catch { throw new Error('Сервер недоступен. Запустите npm start и попробуйте снова.'); }
    if (!response.ok) {
      if (response.status === 401) throw new Error('Нужно войти в профиль.');
      if (response.status === 403) throw new Error('Нет доступа к этому действию.');
      if (response.status === 404) throw new Error('Запись не найдена.');
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || `Ошибка сервера: ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  },
  get(path) { return this.request(path); },
  post(path, data) { return this.request(path, { method: 'POST', body: JSON.stringify(data) }); },
  remove(path) { return this.request(path, { method: 'DELETE' }); },
  async authenticate(path, data) {
    const result = await this.post(path, data);
    localStorage.setItem('recipe-token', result.accessToken);
    localStorage.setItem('recipe-user', JSON.stringify(result.user));
    return result.user;
  },
};

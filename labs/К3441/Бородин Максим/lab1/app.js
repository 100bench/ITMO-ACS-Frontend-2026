// Демо-состояние живёт только в этом браузере: сервер в ЛР1 не нужен.
const key = (name) => `recipes-demo-${name}`;
const read = (name, fallback) => {
  try {
    const value = localStorage.getItem(key(name));
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};
const write = (name, value) => localStorage.setItem(key(name), JSON.stringify(value));

const filters = document.querySelector('#filters');
if (filters) {
  const cards = [...document.querySelectorAll('.recipe-card')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const normalize = (text) => text.trim().toLocaleLowerCase('ru');
  const update = () => {
    const query = normalize(document.querySelector('#query').value);
    const type = document.querySelector('#type').value;
    const difficulty = document.querySelector('#difficulty').value;
    const ingredient = normalize(document.querySelector('#ingredient').value);
    let visible = 0;
    cards.forEach((card) => {
      const matches = (!query || `${card.dataset.search} ${card.dataset.ingredients}`.includes(query))
        && (!type || card.dataset.type === type)
        && (!difficulty || card.dataset.difficulty === difficulty)
        && (!ingredient || card.dataset.ingredients.includes(ingredient));
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = `Найдено рецептов: ${visible}`;
    empty.hidden = visible !== 0;
  };
  filters.addEventListener('input', update);
  filters.addEventListener('change', update);
  filters.addEventListener('reset', () => setTimeout(update, 0));
  update();
}

const loginForm = document.querySelector('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#login-email').value.trim();
    write('user', { name: email.split('@')[0], email });
    location.href = 'profile.html';
  });
}

const registerForm = document.querySelector('#register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = document.querySelector('#register-password').value;
    const confirm = document.querySelector('#register-confirm').value;
    const error = document.querySelector('#register-error');
    if (password !== confirm) {
      error.textContent = 'Пароли не совпадают.';
      error.hidden = false;
      document.querySelector('#register-confirm').focus();
      return;
    }
    error.hidden = true;
    write('user', {
      name: document.querySelector('#register-name').value.trim(),
      email: document.querySelector('#register-email').value.trim(),
    });
    location.href = 'profile.html';
  });
}

const profileName = document.querySelector('#profile-name');
if (profileName) {
  const user = read('user', { name: 'Максим', email: 'Демонстрационный профиль' });
  profileName.textContent = user.name;
  document.querySelector('#profile-email').textContent = user.email;
  document.querySelector('#profile-avatar').textContent = user.name.charAt(0).toLocaleUpperCase('ru');
  const saved = read('saved', false);
  document.querySelector('#saved-count').textContent = saved ? '1' : '0';
  document.querySelector('#following-count').textContent = read('following', false) ? '1' : '0';
  document.querySelector('#saved-empty').hidden = saved;
  document.querySelector('#saved-recipe').hidden = !saved;
  document.querySelector('#logout-button').addEventListener('click', () => {
    localStorage.removeItem(key('user'));
    location.href = 'login.html';
  });
}

function toggleButton(id, storageName, activeText, inactiveText) {
  const button = document.querySelector(id);
  if (!button) return;
  const render = () => {
    const active = read(storageName, false);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? activeText : inactiveText;
  };
  button.addEventListener('click', () => {
    write(storageName, !read(storageName, false));
    render();
  });
  render();
}

toggleButton('#save-button', 'saved', 'Сохранено ✓', 'Сохранить');
toggleButton('#follow-button', 'following', 'Вы подписаны ✓', 'Подписаться');
const likeButton = document.querySelector('#like-button');
if (likeButton) {
  const renderLike = () => {
    const liked = read('liked', false);
    likeButton.setAttribute('aria-pressed', String(liked));
    likeButton.textContent = `Нравится · ${liked ? 25 : 24}`;
  };
  likeButton.addEventListener('click', () => {
    write('liked', !read('liked', false));
    renderLike();
  });
  renderLike();
}

const commentForm = document.querySelector('#comment-form');
if (commentForm) {
  const list = document.querySelector('#comments-list');
  const renderComments = () => {
    list.querySelectorAll('.user-comment').forEach((item) => item.remove());
    read('comments', []).forEach((comment) => {
      const item = document.createElement('div');
      item.className = 'comment user-comment';
      const author = document.createElement('strong');
      author.textContent = comment.name;
      const body = document.createElement('p');
      body.textContent = comment.text;
      item.append(author, body);
      list.append(item);
    });
  };
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const field = document.querySelector('#comment-text');
    const text = field.value.trim();
    if (!text) return;
    const user = read('user', { name: 'Гость' });
    const comments = read('comments', []);
    comments.push({ name: user.name, text });
    write('comments', comments);
    field.value = '';
    renderComments();
  });
  renderComments();
}

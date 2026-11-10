const $ = (selector) => document.querySelector(selector);
const node = (tag, className, textValue) => {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (textValue !== undefined) item.textContent = textValue;
  return item;
};
const showError = (element, message) => {
  element.textContent = message;
  element.hidden = false;
};
const normalize = (value) => String(value).trim().toLocaleLowerCase('ru');

// ДЗ3: выбранная тема сохраняется; без выбора учитывается настройка системы.
const themeButton = $('#theme-button');
if (themeButton) {
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  };
  applyTheme(localStorage.getItem('recipe-theme') || (prefersDark ? 'dark' : 'light'));
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('recipe-theme', next);
    applyTheme(next);
  });
}

function recipeCard(recipe) {
  const card = node('article', 'recipe-card');
  const visual = recipe.image ? node('img', 'card-image') : node('div', 'card-image');
  if (recipe.image) {
    visual.src = recipe.image;
    visual.alt = recipe.title;
  } else {
    visual.textContent = recipe.emoji || '🍽️';
    visual.setAttribute('role', 'img');
    visual.setAttribute('aria-label', recipe.title);
  }
  const content = node('div', 'card-content');
  content.append(node('span', 'eyebrow', `${recipe.minutes} минут`), node('h3', '', recipe.title), node('p', '', recipe.description));
  const meta = node('div', 'card-meta');
  meta.append(node('span', 'tag', recipe.type), node('span', 'tag', recipe.difficulty));
  const link = node('a', 'card-link', 'Смотреть рецепт →');
  link.href = `recipe.html?id=${encodeURIComponent(recipe.id)}`;
  link.setAttribute('aria-label', `Смотреть рецепт: ${recipe.title}`);
  content.append(meta, link);
  card.append(visual, content);
  return card;
}

async function initCatalog() {
  const count = $('#result-count');
  const grid = $('#recipe-grid');
  let recipes;
  try { recipes = await api.get('/recipes'); }
  catch (error) {
    count.textContent = '';
    showError($('#catalog-error'), error.message);
    return;
  }
  const render = () => {
    const query = normalize($('#query').value);
    const ingredient = normalize($('#ingredient').value);
    const type = $('#type').value;
    const difficulty = $('#difficulty').value;
    const found = recipes.filter((recipe) => {
      const ingredients = normalize(recipe.ingredients.join(' '));
      return (!query || normalize(recipe.title).includes(query) || ingredients.includes(query))
        && (!ingredient || ingredients.includes(ingredient))
        && (!type || recipe.type === type)
        && (!difficulty || recipe.difficulty === difficulty);
    });
    grid.replaceChildren(...found.map(recipeCard));
    count.textContent = `Найдено рецептов: ${found.length}`;
    $('#empty-state').hidden = found.length !== 0;
  };
  $('#filters').addEventListener('input', render);
  $('#filters').addEventListener('change', render);
  $('#filters').addEventListener('reset', () => setTimeout(render, 0));
  render();
}
if ($('#filters')) initCatalog();

function initAuth(formId, route) {
  const form = $(formId);
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorBox = $('#auth-error');
    errorBox.hidden = true;
    const button = form.querySelector('button[type="submit"]');
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const data = { email, password };
    if (route === '/register') {
      const confirmation = $('#register-confirm');
      if (confirmation.value !== password) {
        showError(errorBox, 'Пароли не совпадают.');
        confirmation.focus();
        return;
      }
      data.name = $('#register-name').value.trim();
    }
    button.disabled = true;
    try {
      await api.authenticate(route, data);
      const returnTo = sessionStorage.getItem('recipe-return-to');
      sessionStorage.removeItem('recipe-return-to');
      location.href = returnTo || 'profile.html';
    } catch (error) {
      showError(errorBox, error.message);
      errorBox.focus();
    } finally { button.disabled = false; }
  });
}
initAuth('#login-form', '/login');
initAuth('#register-form', '/register');

function requireUser() {
  const user = api.user();
  if (!user || !api.token()) {
    sessionStorage.setItem('recipe-return-to', location.href);
    location.href = 'login.html';
    return null;
  }
  return user;
}

function appendList(list, values) {
  list.replaceChildren(...values.map((value) => node('li', '', value)));
}
function setPressed(button, active, activeText, idleText) {
  button.setAttribute('aria-pressed', String(active));
  (button.querySelector('span') || button).textContent = active ? activeText : idleText;
}

async function initRecipe() {
  const id = Number(new URLSearchParams(location.search).get('id') || 1);
  if (!Number.isInteger(id) || id < 1) {
    showError($('#recipe-status'), 'Неверный номер рецепта.');
    return;
  }
  let recipe;
  try { recipe = await api.get(`/recipes/${id}`); }
  catch (error) { showError($('#recipe-status'), error.message); return; }
  $('#recipe-status').hidden = true;
  $('#recipe-content').hidden = false;
  document.title = `${recipe.title} — Вкусно вместе`;
  $('#recipe-type').textContent = recipe.type;
  $('#recipe-title').textContent = recipe.title;
  $('#recipe-meta').textContent = `${recipe.minutes} минут · ${recipe.servings} порц. · ${recipe.difficulty}`;
  $('#recipe-about').textContent = recipe.about;
  $('#recipe-author').textContent = recipe.author;
  appendList($('#recipe-steps'), recipe.steps);
  appendList($('#recipe-ingredients'), recipe.ingredients);
  const image = recipe.image ? node('img', 'recipe-photo') : node('div', 'recipe-photo recipe-placeholder', recipe.emoji || '🍽️');
  if (recipe.image) { image.src = recipe.image; image.alt = recipe.title; }
  else { image.setAttribute('role', 'img'); image.setAttribute('aria-label', recipe.title); }
  $('#recipe-image').append(image);
  if (recipe.video) {
    $('#video-section').hidden = false;
    const frame = node('iframe');
    frame.src = recipe.video;
    frame.title = `Видео приготовления: ${recipe.title}`;
    frame.loading = 'lazy';
    frame.allowFullscreen = true;
    $('#video-wrap').append(frame);
  }

  let favorites = [], likes = [], follows = [];
  const user = api.user();
  const status = $('#action-status');
  async function refreshSocial() {
    try {
      [favorites, likes, follows] = await Promise.all([
        api.get(`/favorites?recipeId=${id}`),
        api.get(`/likes?recipeId=${id}`),
        api.get(`/follows?author=${encodeURIComponent(recipe.author)}`),
      ]);
      setPressed($('#save-button'), !!favorites.find((item) => item.userId === user?.id), 'Сохранено', 'Сохранить');
      setPressed($('#like-button'), !!likes.find((item) => item.userId === user?.id), `Нравится · ${likes.length}`, `Нравится · ${likes.length}`);
      setPressed($('#follow-button'), !!follows.find((item) => item.userId === user?.id), 'Вы подписаны', 'Подписаться');
      status.textContent = '';
    } catch (error) { status.textContent = error.message; }
  }
  async function toggle(button, collection, records, fields) {
    const currentUser = requireUser();
    if (!currentUser) return;
    button.disabled = true;
    try {
      const existing = records.find((item) => item.userId === currentUser.id);
      if (existing) await api.remove(`/${collection}/${existing.id}`);
      else await api.post(`/${collection}`, { userId: currentUser.id, ...fields });
      await refreshSocial();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  }
  $('#save-button').addEventListener('click', () => toggle($('#save-button'), 'favorites', favorites, { recipeId: id }));
  $('#like-button').addEventListener('click', () => toggle($('#like-button'), 'likes', likes, { recipeId: id }));
  $('#follow-button').addEventListener('click', () => toggle($('#follow-button'), 'follows', follows, { author: recipe.author }));
  await refreshSocial();

  const list = $('#comments-list');
  async function refreshComments() {
    try {
      const comments = await api.get(`/comments?recipeId=${id}`);
      list.replaceChildren();
      if (!comments.length) list.append(node('p', 'muted', 'Пока нет комментариев. Станьте первым!'));
      comments.forEach((comment) => {
        const item = node('div', 'comment');
        item.append(node('strong', '', comment.author), node('p', '', comment.text));
        list.append(item);
      });
    } catch (error) { list.textContent = error.message; }
  }
  $('#comment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentUser = requireUser();
    if (!currentUser) return;
    const field = $('#comment-text');
    const text = field.value.trim();
    if (!text) return;
    const button = $('#comment-form button');
    button.disabled = true;
    try {
      await api.post('/comments', { recipeId: id, userId: currentUser.id, author: currentUser.name || currentUser.email, text });
      field.value = '';
      await refreshComments();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
  await refreshComments();
}
if ($('#recipe-content')) initRecipe();

async function initProfile() {
  const user = requireUser();
  if (!user) return;
  const status = $('#profile-status');
  try {
    const [freshUser, favorites, follows, recipes] = await Promise.all([
      api.get(`/users/${user.id}`),
      api.get(`/favorites?userId=${user.id}`),
      api.get(`/follows?userId=${user.id}`),
      api.get('/recipes'),
    ]);
    $('#profile-name').textContent = freshUser.name || freshUser.email;
    $('#profile-email').textContent = freshUser.email;
    $('#profile-avatar').textContent = (freshUser.name || freshUser.email).charAt(0).toLocaleUpperCase('ru');
    $('#saved-count').textContent = String(favorites.length);
    $('#following-count').textContent = String(follows.length);
    $('#saved-empty').hidden = favorites.length !== 0;
    const list = $('#saved-list');
    favorites.forEach((favorite) => {
      const recipe = recipes.find((item) => item.id === favorite.recipeId);
      if (!recipe) return;
      const item = node('li', 'mb-2');
      const link = node('a', '', recipe.title);
      link.href = `recipe.html?id=${recipe.id}`;
      item.append(link);
      list.append(item);
    });
    const published = recipes.filter((recipe) => recipe.userId === user.id);
    const publishedList = $('#published-list');
    const renderPublications = () => {
      $('#published-count').textContent = String(published.length);
      $('#published-empty').hidden = published.length !== 0;
      publishedList.replaceChildren(...published.map((recipe) => {
        const item = node('li', 'mb-2');
        const link = node('a', '', recipe.title);
        link.href = `recipe.html?id=${recipe.id}`;
        item.append(link);
        return item;
      }));
    };
    renderPublications();
    $('#publish-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const button = form.querySelector('button[type="submit"]');
      const lines = (selector) => $(selector).value.split('\n').map((line) => line.trim()).filter(Boolean);
      const ingredients = lines('#publish-ingredients');
      const steps = lines('#publish-steps');
      const message = $('#publish-status');
      if (!ingredients.length || !steps.length) { message.textContent = 'Укажите ингредиенты и шаги приготовления.'; return; }
      const description = $('#publish-description').value.trim();
      const data = {
        title: $('#publish-title').value.trim(),
        type: $('#publish-type').value,
        difficulty: $('#publish-difficulty').value,
        minutes: Number($('#publish-minutes').value),
        servings: 2,
        description,
        about: description,
        ingredients,
        steps,
        author: freshUser.name || freshUser.email,
        userId: user.id,
        emoji: '🍲',
      };
      button.disabled = true;
      try {
        const created = await api.post('/recipes', data);
        published.push(created);
        renderPublications();
        form.reset();
        message.textContent = 'Рецепт опубликован и появился в каталоге.';
      } catch (error) { message.textContent = error.message; }
      finally { button.disabled = false; }
    });
    status.hidden = true;
    $('#profile-content').hidden = false;
  } catch (error) {
    if (error.message.includes('войти')) { api.logout(); location.href = 'login.html'; }
    else showError(status, error.message);
  }
  $('#logout-button').addEventListener('click', () => { api.logout(); location.href = 'login.html'; });
}
if ($('#profile-content')) initProfile();

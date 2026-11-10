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

const publications = () => read('publications', []);

const filters = document.querySelector('#filters');
if (filters) {
  const grid = document.querySelector('#recipe-grid');
  publications().forEach((post) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';
    card.dataset.type = post.type;
    card.dataset.difficulty = post.difficulty;
    card.dataset.ingredients = post.ingredients.join(' ').toLocaleLowerCase('ru');
    card.dataset.search = post.title.toLocaleLowerCase('ru');
    const image = document.createElement('div');
    image.className = 'card-image snack';
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', 'Иллюстрация рецепта');
    image.textContent = '🍲';
    const content = document.createElement('div');
    content.className = 'card-content';
    const caption = document.createElement('span');
    caption.className = 'eyebrow';
    caption.textContent = `От автора ${post.authorName}`;
    const title = document.createElement('h3');
    title.textContent = post.title;
    const description = document.createElement('p');
    description.textContent = post.description;
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    [post.type, post.difficulty].forEach((value) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = value;
      meta.append(tag);
    });
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = `recipe.html?id=${encodeURIComponent(post.id)}`;
    link.textContent = 'Смотреть рецепт →';
    content.append(caption, title, description, meta, link);
    card.append(image, content);
    grid.prepend(card);
  });
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
  const signedIn = read('user', null);
  const user = signedIn || { name: 'Гость', email: 'Войдите, чтобы публиковать рецепты' };
  profileName.textContent = user.name;
  document.querySelector('#profile-email').textContent = user.email;
  document.querySelector('#profile-avatar').textContent = user.name.charAt(0).toLocaleUpperCase('ru');
  const saved = read('saved', false);
  document.querySelector('#saved-count').textContent = saved ? '1' : '0';
  document.querySelector('#following-count').textContent = read('following', false) ? '1' : '0';
  document.querySelector('#saved-empty').hidden = saved;
  document.querySelector('#saved-recipe').hidden = !saved;
  const logout = document.querySelector('#logout-button');
  logout.hidden = !signedIn;
  logout.addEventListener('click', () => {
    localStorage.removeItem(key('user'));
    location.href = 'login.html';
  });

  const form = document.querySelector('#publish-form');
  form.hidden = !signedIn;
  document.querySelector('#publish-locked').hidden = Boolean(signedIn);
  const renderPosts = () => {
    const ownPosts = publications().filter((post) => signedIn && post.authorEmail === signedIn.email);
    const list = document.querySelector('#posts-list');
    list.replaceChildren();
    ownPosts.forEach((post) => {
      const item = document.createElement('li');
      item.className = 'post-row';
      const link = document.createElement('a');
      link.href = `recipe.html?id=${encodeURIComponent(post.id)}`;
      link.textContent = post.title;
      link.className = 'fw-bold';
      item.append(link);
      list.append(item);
    });
    document.querySelector('#post-count').textContent = String(ownPosts.length);
    document.querySelector('#posts-empty').hidden = ownPosts.length > 0;
  };
  renderPosts();
  if (signedIn) form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.querySelector('#post-title').value.trim();
    const type = document.querySelector('#post-type').value;
    const difficulty = document.querySelector('#post-difficulty').value;
    const description = document.querySelector('#post-description').value.trim();
    const ingredients = document.querySelector('#post-ingredients').value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const steps = document.querySelector('#post-steps').value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const error = document.querySelector('#publish-error');
    if (!title || !type || !difficulty || !description || !ingredients.length || !steps.length) {
      error.textContent = 'Заполните все поля, указав хотя бы один ингредиент и шаг.';
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const posts = publications();
    posts.push({ id: String(Date.now()), title, type, difficulty, description, ingredients, steps,
      authorName: signedIn.name, authorEmail: signedIn.email });
    write('publications', posts);
    form.reset();
    document.querySelector('#publish-status').textContent = 'Рецепт опубликован и появился в каталоге.';
    renderPosts();
  });
}

const recipeId = new URLSearchParams(location.search).get('id');
if (recipeId && document.querySelector('#recipe-article')) {
  const post = publications().find((item) => item.id === recipeId);
  if (!post) {
    document.querySelector('#recipe-article').hidden = true;
    document.querySelector('#recipe-not-found').hidden = false;
  } else {
    document.title = `${post.title} — Вкусно вместе`;
    document.querySelector('#recipe-eyebrow').textContent = `Рецепт от ${post.authorName}`;
    document.querySelector('#recipe-title').textContent = post.title;
    document.querySelector('#recipe-meta').textContent = `${post.type} · ${post.difficulty}`;
    document.querySelector('#recipe-description').textContent = post.description;
    document.querySelector('#recipe-author').textContent = post.authorName;
    document.querySelector('#recipe-author-bio').textContent = 'Рецепт участника сообщества.';
    document.querySelector('#recipe-servings').hidden = true;
    document.querySelector('#recipe-photo').hidden = true;
    document.querySelector('#published-hero').hidden = false;
    document.querySelector('#recipe-actions').hidden = true;
    document.querySelector('#video-section').hidden = true;
    document.querySelector('#comments-section').hidden = true;
    document.querySelector('#follow-button').hidden = true;
    const renderList = (selector, values) => {
      const list = document.querySelector(selector);
      list.replaceChildren();
      values.forEach((value) => {
        const item = document.createElement('li');
        item.textContent = value;
        list.append(item);
      });
    };
    renderList('#recipe-ingredients', post.ingredients);
    renderList('#recipe-steps', post.steps);
  }
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

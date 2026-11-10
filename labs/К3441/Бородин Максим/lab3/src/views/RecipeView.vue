<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, apiError } from '../api.js';
import { useAuth } from '../composables/useAuth.js';

const route = useRoute();
const router = useRouter();
const { user, isLoggedIn } = useAuth();
const recipe = ref(null);
const error = ref('');
const status = ref('');
const loading = ref(true);
const busy = ref('');
const favorites = ref([]);
const likes = ref([]);
const follows = ref([]);
const comments = ref([]);
const commentText = ref('');
const saved = computed(() => favorites.value.some((item) => item.userId === user.value?.id));
const liked = computed(() => likes.value.some((item) => item.userId === user.value?.id));
const following = computed(() => follows.value.some((item) => item.userId === user.value?.id));

function requireLogin() {
  if (isLoggedIn()) return true;
  router.push({ name: 'login', query: { redirect: route.fullPath } });
  return false;
}

async function refreshSocial() {
  const id = recipe.value.id;
  const author = encodeURIComponent(recipe.value.author);
  const [savedResponse, likesResponse, followsResponse] = await Promise.all([
    api.get(`/favorites?recipeId=${id}`), api.get(`/likes?recipeId=${id}`), api.get(`/follows?author=${author}`),
  ]);
  favorites.value = savedResponse.data;
  likes.value = likesResponse.data;
  follows.value = followsResponse.data;
}

async function refreshComments() {
  comments.value = (await api.get(`/comments?recipeId=${recipe.value.id}`)).data;
}

async function loadRecipe() {
  loading.value = true;
  error.value = '';
  recipe.value = null;
  const id = Number(route.params.id);
  if (!Number.isInteger(id) || id < 1) { error.value = 'Неверный номер рецепта.'; loading.value = false; return; }
  try {
    recipe.value = (await api.get(`/recipes/${id}`)).data;
    await Promise.all([refreshSocial(), refreshComments()]);
    document.title = `${recipe.value.title} — Вкусно вместе`;
  } catch (cause) { error.value = apiError(cause); }
  finally { loading.value = false; }
}
watch(() => route.params.id, loadRecipe, { immediate: true });

async function toggle(collection, records, fields) {
  if (!requireLogin()) return;
  busy.value = collection;
  status.value = '';
  try {
    const existing = records.find((item) => item.userId === user.value.id);
    if (existing) await api.delete(`/${collection}/${existing.id}`);
    else await api.post(`/${collection}`, { userId: user.value.id, ...fields });
    await refreshSocial();
  } catch (cause) { status.value = apiError(cause); }
  finally { busy.value = ''; }
}

function toggleFavorite() { toggle('favorites', favorites.value, { recipeId: recipe.value.id }); }
function toggleLike() { toggle('likes', likes.value, { recipeId: recipe.value.id }); }
function toggleFollow() { toggle('follows', follows.value, { author: recipe.value.author }); }

async function addComment() {
  if (!requireLogin()) return;
  const text = commentText.value.trim();
  if (!text) return;
  busy.value = 'comments';
  status.value = '';
  try {
    await api.post('/comments', { recipeId: recipe.value.id, userId: user.value.id, author: user.value.name || user.value.email, text });
    commentText.value = '';
    await refreshComments();
  } catch (cause) { status.value = apiError(cause); }
  finally { busy.value = ''; }
}
</script>

<template>
  <div class="container">
    <p v-if="loading" class="page-heading" role="status">Загружаем рецепт...</p>
    <p v-else-if="error" class="error-state mt-4" role="alert">{{ error }}</p>
    <template v-else-if="recipe">
      <header class="recipe-hero">
        <RouterLink to="/">← Все рецепты</RouterLink>
        <p class="eyebrow mt-4">{{ recipe.type }}</p>
        <h1>{{ recipe.title }}</h1>
        <p class="muted">{{ recipe.minutes }} минут · {{ recipe.servings }} порц. · {{ recipe.difficulty }}</p>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary" type="button" :disabled="!!busy" :aria-pressed="saved" @click="toggleFavorite"><svg class="icon" aria-hidden="true"><use href="/assets/sprite.svg#bookmark" /></svg>{{ saved ? 'Сохранено' : 'Сохранить' }}</button>
          <button class="btn btn-outline-primary" type="button" :disabled="!!busy" :aria-pressed="liked" @click="toggleLike"><svg class="icon" aria-hidden="true"><use href="/assets/sprite.svg#heart" /></svg>Нравится · {{ likes.length }}</button>
        </div>
        <p class="mt-2" role="status" aria-live="polite">{{ status }}</p>
      </header>
      <img v-if="recipe.image" class="recipe-photo" :src="'/' + recipe.image" :alt="recipe.title">
      <div v-else class="recipe-photo recipe-placeholder" role="img" :aria-label="recipe.title">{{ recipe.emoji || '🍽️' }}</div>
      <div class="recipe-layout">
        <div>
          <section aria-labelledby="about-title"><h2 id="about-title">О рецепте</h2><p>{{ recipe.about }}</p></section>
          <section class="mt-4" aria-labelledby="steps-title"><h2 id="steps-title">Приготовление</h2><ol class="steps"><li v-for="step in recipe.steps" :key="step">{{ step }}</li></ol></section>
          <section v-if="recipe.video" class="mt-4" aria-labelledby="video-title"><h2 id="video-title">Видео</h2><div class="video-wrap"><iframe :src="recipe.video" :title="`Видео приготовления: ${recipe.title}`" loading="lazy" allowfullscreen /></div></section>
          <section class="mt-5" aria-labelledby="comments-title"><h2 id="comments-title">Комментарии</h2>
            <div aria-live="polite"><p v-if="!comments.length" class="muted">Пока нет комментариев. Станьте первым!</p><div v-for="comment in comments" :key="comment.id" class="comment"><strong>{{ comment.author }}</strong><p>{{ comment.text }}</p></div></div>
            <form class="mt-4" @submit.prevent="addComment"><label class="form-label" for="comment-text">Ваш комментарий</label><textarea id="comment-text" v-model="commentText" class="form-control mb-2" rows="3" required /><button class="btn btn-primary" type="submit" :disabled="!!busy">Отправить</button></form>
          </section>
        </div>
        <aside>
          <section class="panel" aria-labelledby="ingredients-title"><h2 id="ingredients-title" class="h4">Ингредиенты</h2><ul class="ingredients"><li v-for="item in recipe.ingredients" :key="item">{{ item }}</li></ul></section>
          <section class="panel mt-3" aria-labelledby="author-title"><h2 id="author-title" class="h4">Автор</h2><p>{{ recipe.author }}</p><button class="btn btn-outline-primary" type="button" :disabled="!!busy" :aria-pressed="following" @click="toggleFollow">{{ following ? 'Вы подписаны' : 'Подписаться' }}</button></section>
        </aside>
      </div>
    </template>
  </div>
</template>

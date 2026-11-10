<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, apiError } from '../api.js';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const auth = useAuth();
const profile = ref(null);
const saved = ref([]);
const following = ref([]);
const error = ref('');

onMounted(async () => {
  try {
    const id = auth.user.value.id;
    const [person, favorites, follows, recipes] = await Promise.all([
      api.get(`/users/${id}`), api.get(`/favorites?userId=${id}`),
      api.get(`/follows?userId=${id}`), api.get('/recipes'),
    ]);
    profile.value = person.data;
    saved.value = favorites.data.map((item) => recipes.data.find((recipe) => recipe.id === item.recipeId)).filter(Boolean);
    following.value = follows.data;
  } catch (cause) {
    if (cause.response?.status === 401) { auth.logout(); await router.replace('/login'); }
    else error.value = apiError(cause);
  }
});

function logout() { auth.logout(); router.replace('/login'); }
</script>

<template>
  <div class="container">
    <header class="page-heading"><span class="eyebrow">Личный кабинет</span><h1>Мой профиль</h1></header>
    <p v-if="error" class="error-state" role="alert">{{ error }}</p>
    <p v-else-if="!profile" role="status">Загружаем профиль...</p>
    <div v-else class="profile-layout">
      <aside class="panel">
        <div class="avatar mb-3" aria-hidden="true">{{ (profile.name || profile.email).charAt(0).toLocaleUpperCase('ru') }}</div>
        <h2 class="h4">{{ profile.name || profile.email }}</h2><p class="muted">{{ profile.email }}</p>
        <button class="btn btn-outline-primary" type="button" @click="logout">Выйти</button>
      </aside>
      <div>
        <div class="stat-grid" aria-label="Статистика профиля">
          <div class="stat-card"><strong>{{ saved.length }}</strong><span>Сохранённых рецептов</span></div>
          <div class="stat-card"><strong>{{ following.length }}</strong><span>Подписок</span></div>
          <div class="stat-card"><strong>0</strong><span>Публикаций</span></div>
        </div>
        <section class="content-card" aria-labelledby="saved-title">
          <h2 id="saved-title">Сохранённые рецепты</h2>
          <p v-if="!saved.length" class="muted">Пока пусто. Найдите первый рецепт в каталоге.</p>
          <ul v-else><li v-for="recipe in saved" :key="recipe.id" class="mb-2"><RouterLink :to="{ name: 'recipe', params: { id: recipe.id } }">{{ recipe.title }}</RouterLink></li></ul>
        </section>
        <section class="content-card" aria-labelledby="following-title">
          <h2 id="following-title">Подписки</h2>
          <p v-if="!following.length" class="muted">Вы пока ни на кого не подписаны.</p>
          <ul v-else><li v-for="item in following" :key="item.id">{{ item.author }}</li></ul>
        </section>
      </div>
    </div>
  </div>
</template>

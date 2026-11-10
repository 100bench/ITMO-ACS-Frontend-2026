<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, apiError } from '../api.js';
import { useAuth } from '../composables/useAuth.js';
import { makeRecipe } from '../recipeDraft.js';

const router = useRouter();
const auth = useAuth();
const profile = ref(null);
const saved = ref([]);
const following = ref([]);
const publications = ref([]);
const error = ref('');
const formError = ref('');
const publishing = ref(false);
const form = reactive({ title: '', type: 'основное', difficulty: 'легко', description: '', ingredients: '', steps: '', minutes: 20, servings: 2 });

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
    publications.value = recipes.data.filter((recipe) => recipe.userId === id);
  } catch (cause) {
    if (cause.response?.status === 401) { auth.logout(); await router.replace('/login'); }
    else error.value = apiError(cause);
  }
});

function logout() { auth.logout(); router.replace('/login'); }

async function publishRecipe() {
  formError.value = '';
  publishing.value = true;
  try {
    const recipe = makeRecipe(form, profile.value);
    const { data } = await api.post('/recipes', recipe);
    publications.value.unshift(data);
    Object.assign(form, { title: '', type: 'основное', difficulty: 'легко', description: '', ingredients: '', steps: '', minutes: 20, servings: 2 });
  } catch (cause) { formError.value = cause.response ? apiError(cause) : cause.message; }
  finally { publishing.value = false; }
}
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
          <div class="stat-card"><strong>{{ publications.length }}</strong><span>Публикаций</span></div>
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
        <section class="content-card" aria-labelledby="publications-title">
          <h2 id="publications-title">Мои публикации</h2>
          <p v-if="!publications.length" class="muted">Вы пока не публиковали рецепты.</p>
          <ul v-else><li v-for="recipe in publications" :key="recipe.id" class="mb-2"><RouterLink :to="{ name: 'recipe', params: { id: recipe.id } }">{{ recipe.title }}</RouterLink></li></ul>
        </section>
        <section class="content-card" aria-labelledby="publish-title">
          <h2 id="publish-title">Опубликовать рецепт</h2>
          <p v-if="formError" class="error-state" role="alert">{{ formError }}</p>
          <form @submit.prevent="publishRecipe">
            <label class="form-label" for="publish-title-input">Название</label>
            <input id="publish-title-input" v-model="form.title" class="form-control mb-3" required>
            <div class="row g-3 mb-3">
              <div class="col-sm-6"><label class="form-label" for="publish-type">Тип блюда</label><select id="publish-type" v-model="form.type" class="form-select"><option value="завтрак">Завтрак</option><option value="основное">Основное</option><option value="салат">Салат</option><option value="десерт">Десерт</option></select></div>
              <div class="col-sm-6"><label class="form-label" for="publish-difficulty">Сложность</label><select id="publish-difficulty" v-model="form.difficulty" class="form-select"><option value="легко">Легко</option><option value="средне">Средне</option></select></div>
              <div class="col-sm-6"><label class="form-label" for="publish-minutes">Время, минут</label><input id="publish-minutes" v-model.number="form.minutes" class="form-control" type="number" min="1" required></div>
              <div class="col-sm-6"><label class="form-label" for="publish-servings">Количество порций</label><input id="publish-servings" v-model.number="form.servings" class="form-control" type="number" min="1" required></div>
            </div>
            <label class="form-label" for="publish-description">Описание</label>
            <textarea id="publish-description" v-model="form.description" class="form-control mb-3" rows="2" required />
            <label class="form-label" for="publish-ingredients">Ингредиенты — по одному в строке</label>
            <textarea id="publish-ingredients" v-model="form.ingredients" class="form-control mb-3" rows="4" required />
            <label class="form-label" for="publish-steps">Шаги приготовления — по одному в строке</label>
            <textarea id="publish-steps" v-model="form.steps" class="form-control mb-3" rows="4" required />
            <button class="btn btn-primary" type="submit" :disabled="publishing">{{ publishing ? 'Публикуем...' : 'Опубликовать' }}</button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

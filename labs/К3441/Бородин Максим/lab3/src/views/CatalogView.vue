<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { api, apiError } from '../api.js';
import { filterRecipes } from '../filterRecipes.js';
import RecipeCard from '../components/RecipeCard.vue';

const recipes = ref([]);
const loading = ref(true);
const error = ref('');
const filters = reactive({ query: '', type: '', difficulty: '', ingredient: '' });
const visibleRecipes = computed(() => filterRecipes(recipes.value, filters));

onMounted(async () => {
  try { recipes.value = (await api.get('/recipes')).data; }
  catch (cause) { error.value = apiError(cause); }
  finally { loading.value = false; }
});

function resetFilters() {
  Object.assign(filters, { query: '', type: '', difficulty: '', ingredient: '' });
}
</script>

<template>
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span class="eyebrow">Готовим вместе</span>
        <h1>Рецепты, к которым хочется возвращаться</h1>
        <p>Ищите идеи для завтрака, обеда и ужина, сохраняйте любимое и делитесь впечатлениями.</p>
        <a class="btn btn-primary btn-lg" href="#recipes">Найти рецепт</a>
      </div>
      <div class="hero-art"><img src="/assets/pasta.png" alt="Паста с томатами и базиликом"></div>
    </div>
  </section>
  <section id="recipes" class="section container" aria-labelledby="recipes-title">
    <div class="section-heading"><div><span class="eyebrow">Каталог</span><h2 id="recipes-title">Все рецепты</h2><p>Простые блюда на каждый день.</p></div></div>
    <div class="search-layout">
      <form class="panel" role="search" @submit.prevent>
        <h3>Фильтры</h3>
        <label class="form-label" for="query">Название или ингредиент</label>
        <input id="query" v-model="filters.query" class="form-control mb-3" type="search" placeholder="Например, йогурт">
        <label class="form-label" for="type">Тип блюда</label>
        <select id="type" v-model="filters.type" class="form-select mb-3">
          <option value="">Любой</option><option value="завтрак">Завтрак</option><option value="основное">Основное</option><option value="салат">Салат</option><option value="десерт">Десерт</option>
        </select>
        <label class="form-label" for="difficulty">Сложность</label>
        <select id="difficulty" v-model="filters.difficulty" class="form-select mb-3">
          <option value="">Любая</option><option value="легко">Легко</option><option value="средне">Средне</option>
        </select>
        <label class="form-label" for="ingredient">Ингредиент</label>
        <input id="ingredient" v-model="filters.ingredient" class="form-control mb-3" type="search" placeholder="Например, томаты">
        <button class="btn btn-outline-primary w-100" type="button" @click="resetFilters">Сбросить</button>
      </form>
      <div>
        <p v-if="loading" class="result-info" role="status">Загружаем рецепты...</p>
        <p v-else-if="error" class="error-state" role="alert">{{ error }}</p>
        <template v-else>
          <p class="result-info" role="status" aria-live="polite">Найдено рецептов: {{ visibleRecipes.length }}</p>
          <div v-if="visibleRecipes.length" class="recipe-grid"><RecipeCard v-for="recipe in visibleRecipes" :key="recipe.id" :recipe="recipe" /></div>
          <p v-else class="empty-state">По этим условиям рецепты не найдены. Попробуйте изменить фильтры.</p>
        </template>
      </div>
    </div>
  </section>
</template>

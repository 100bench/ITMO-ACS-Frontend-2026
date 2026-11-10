<script setup>
import { useAuth } from '../composables/useAuth.js';
import { useTheme } from '../composables/useTheme.js';

const { user } = useAuth();
const { theme, toggleTheme } = useTheme();
</script>

<template>
  <header class="site-header">
    <div class="container nav-wrap">
      <RouterLink class="brand" to="/"><span class="brand-mark" aria-hidden="true">✳</span>Вкусно вместе</RouterLink>
      <nav class="site-nav" aria-label="Основная навигация">
        <div class="nav-links">
          <RouterLink class="nav-link" to="/">Рецепты</RouterLink>
          <RouterLink class="nav-link" to="/recipes/1">Рецепт дня</RouterLink>
          <RouterLink class="nav-link" to="/profile">Мой профиль</RouterLink>
        </div>
        <div class="nav-actions">
          <button class="btn btn-outline-primary btn-sm" type="button" :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'" :aria-pressed="theme === 'dark'" @click="toggleTheme">
            <svg class="icon" aria-hidden="true"><use href="/assets/sprite.svg#moon" /></svg>Тема
          </button>
          <span v-if="user" class="small">{{ user.name || user.email }}</span>
          <template v-else>
            <RouterLink class="nav-link" to="/login">Войти</RouterLink>
            <RouterLink class="btn btn-primary btn-sm" to="/register">Регистрация</RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

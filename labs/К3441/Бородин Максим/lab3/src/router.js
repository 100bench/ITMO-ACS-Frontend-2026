import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from './composables/useAuth.js';
import CatalogView from './views/CatalogView.vue';
import RecipeView from './views/RecipeView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import ProfileView from './views/ProfileView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'catalog', component: CatalogView },
    { path: '/recipes/:id', name: 'recipe', component: RecipeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuth().isLoggedIn()) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
});

router.afterEach((to) => {
  const titles = { catalog: 'Рецепты', recipe: 'Рецепт', login: 'Вход', register: 'Регистрация', profile: 'Мой профиль' };
  document.title = `${titles[to.name] || 'Рецепты'} — Вкусно вместе`;
});

export default router;

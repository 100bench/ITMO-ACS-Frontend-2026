<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiError } from '../api.js';
import { useAuth } from '../composables/useAuth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const email = ref('');
const password = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  error.value = '';
  busy.value = true;
  try {
    await auth.login(email.value.trim(), password.value);
    const redirect = route.query.redirect;
    await router.replace(typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/profile');
  } catch (cause) { error.value = apiError(cause); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="auth-shell container">
    <section class="auth-card" aria-labelledby="login-title">
      <span class="eyebrow">С возвращением</span><h1 id="login-title">Вход</h1>
      <p>Войдите, чтобы сохранять рецепты и общаться с авторами.</p>
      <p v-if="error" class="error-state" role="alert">{{ error }}</p>
      <form @submit.prevent="submit">
        <label class="form-label" for="login-email">Электронная почта</label>
        <input id="login-email" v-model="email" class="form-control mb-3" type="email" autocomplete="email" required>
        <label class="form-label" for="login-password">Пароль</label>
        <input id="login-password" v-model="password" class="form-control mb-3" type="password" autocomplete="current-password" required>
        <button class="btn btn-primary w-100" type="submit" :disabled="busy">{{ busy ? 'Входим...' : 'Войти' }}</button>
      </form>
      <p class="mt-4 mb-0">Нет аккаунта? <RouterLink :to="{ name: 'register', query: route.query }">Зарегистрируйтесь</RouterLink></p>
    </section>
  </div>
</template>

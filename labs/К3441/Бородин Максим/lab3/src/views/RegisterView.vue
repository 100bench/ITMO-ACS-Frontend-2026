<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiError } from '../api.js';
import { useAuth } from '../composables/useAuth.js';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const name = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');
const error = ref('');
const busy = ref(false);

async function submit() {
  error.value = '';
  if (password.value !== confirm.value) { error.value = 'Пароли не совпадают.'; return; }
  busy.value = true;
  try {
    await auth.register(name.value.trim(), email.value.trim(), password.value);
    const redirect = route.query.redirect;
    await router.replace(typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/profile');
  } catch (cause) { error.value = apiError(cause); }
  finally { busy.value = false; }
}
</script>

<template>
  <div class="auth-shell container">
    <section class="auth-card" aria-labelledby="register-title">
      <span class="eyebrow">Присоединяйтесь</span><h1 id="register-title">Регистрация</h1>
      <p>Создайте профиль и сохраняйте любимые рецепты.</p>
      <p v-if="error" class="error-state" role="alert">{{ error }}</p>
      <form @submit.prevent="submit">
        <label class="form-label" for="register-name">Имя</label>
        <input id="register-name" v-model="name" class="form-control mb-3" type="text" autocomplete="name" required>
        <label class="form-label" for="register-email">Электронная почта</label>
        <input id="register-email" v-model="email" class="form-control mb-3" type="email" autocomplete="email" required>
        <label class="form-label" for="register-password">Пароль</label>
        <input id="register-password" v-model="password" class="form-control mb-3" type="password" autocomplete="new-password" minlength="6" required>
        <label class="form-label" for="register-confirm">Повторите пароль</label>
        <input id="register-confirm" v-model="confirm" class="form-control mb-3" type="password" autocomplete="new-password" minlength="6" required>
        <button class="btn btn-primary w-100" type="submit" :disabled="busy">{{ busy ? 'Создаём профиль...' : 'Зарегистрироваться' }}</button>
      </form>
      <p class="mt-4 mb-0">Уже есть аккаунт? <RouterLink :to="{ name: 'login', query: route.query }">Войти</RouterLink></p>
    </section>
  </div>
</template>

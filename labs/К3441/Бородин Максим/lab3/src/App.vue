<script setup>
import SiteHeader from './components/SiteHeader.vue';
</script>

<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>
  <SiteHeader />
  <main id="main"><RouterView /></main>
  <footer class="site-footer">
    <div class="container"><span>Вкусно вместе</span><span>Бородин Максим, К3441 · 2026</span></div>
  </footer>
</template>

<script setup>
defineProps({ recipe: { type: Object, required: true } });
</script>

<template>
  <article class="recipe-card">
    <img v-if="recipe.image" class="card-image" :src="'/' + recipe.image" :alt="recipe.title">
    <div v-else class="card-image" role="img" :aria-label="recipe.title">{{ recipe.emoji || '🍽️' }}</div>
    <div class="card-content">
      <span class="eyebrow">{{ recipe.minutes }} минут</span>
      <h3>{{ recipe.title }}</h3>
      <p>{{ recipe.description }}</p>
      <div class="card-meta"><span class="tag">{{ recipe.type }}</span><span class="tag">{{ recipe.difficulty }}</span></div>
      <RouterLink class="card-link" :to="{ name: 'recipe', params: { id: recipe.id } }" :aria-label="`Смотреть рецепт: ${recipe.title}`">Смотреть рецепт →</RouterLink>
    </div>
  </article>
</template>

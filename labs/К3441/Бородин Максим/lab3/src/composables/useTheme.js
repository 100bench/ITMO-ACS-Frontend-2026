import { ref, watch } from 'vue';

const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const theme = ref(localStorage.getItem('recipe-theme') || preferred);

watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
  localStorage.setItem('recipe-theme', value);
}, { immediate: true });

export function useTheme() {
  return {
    theme,
    toggleTheme() { theme.value = theme.value === 'dark' ? 'light' : 'dark'; },
  };
}

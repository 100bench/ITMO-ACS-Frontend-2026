const lines = (value) => String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);

export function makeRecipe(form, user) {
  const title = String(form.title || '').trim();
  const description = String(form.description || '').trim();
  const ingredients = lines(form.ingredients);
  const steps = lines(form.steps);
  const minutes = Number(form.minutes);
  const servings = Number(form.servings);
  if (!title || !description || !ingredients.length || !steps.length || !Number.isInteger(minutes) || minutes < 1 || !Number.isInteger(servings) || servings < 1 || !user?.id) {
    throw new Error('Заполните все поля рецепта.');
  }
  return {
    title,
    type: form.type,
    difficulty: form.difficulty,
    description,
    about: description,
    ingredients,
    steps,
    minutes,
    servings,
    emoji: '🍽️',
    author: user.name || user.email,
    userId: user.id,
  };
}

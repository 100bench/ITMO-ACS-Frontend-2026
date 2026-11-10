const normalize = (value) => String(value || '').trim().toLocaleLowerCase('ru');

export function filterRecipes(recipes, filters = {}) {
  const query = normalize(filters.query);
  const ingredient = normalize(filters.ingredient);
  return recipes.filter((recipe) => {
    const ingredients = normalize(recipe.ingredients.join(' '));
    return (!query || normalize(recipe.title).includes(query) || ingredients.includes(query))
      && (!ingredient || ingredients.includes(ingredient))
      && (!filters.type || recipe.type === filters.type)
      && (!filters.difficulty || recipe.difficulty === filters.difficulty);
  });
}

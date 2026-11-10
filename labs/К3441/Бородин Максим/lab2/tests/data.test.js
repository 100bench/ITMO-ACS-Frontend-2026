const { test } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db.json');
const routes = require('../routes.json');

test('каждая карточка имеет отдельную полную страницу рецепта', () => {
  assert.equal(db.recipes.length, 6);
  assert.equal(new Set(db.recipes.map((recipe) => recipe.id)).size, db.recipes.length);
  for (const recipe of db.recipes) {
    assert.ok(Number.isInteger(recipe.id) && recipe.id > 0);
    assert.ok(recipe.title && recipe.description && recipe.about && recipe.author);
    assert.ok(recipe.ingredients.length > 0 && recipe.steps.length > 0);
    assert.ok(recipe.minutes > 0 && recipe.servings > 0);
  }
});

test('данные доступны на чтение, действия требуют входа', () => {
  assert.equal(routes.recipes, 444);
  for (const name of ['favorites', 'likes', 'follows', 'comments']) assert.equal(routes[name], 644);
  assert.equal(routes.users, 600);
});

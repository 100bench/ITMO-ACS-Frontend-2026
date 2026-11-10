import { test } from 'node:test';
import assert from 'node:assert/strict';
import routes from '../routes.json' with { type: 'json' };
import { makeRecipe } from '../src/recipeDraft.js';

test('публикация содержит автора и непустые ингредиенты/шаги', () => {
  const recipe = makeRecipe({
    title: '  Домашний суп  ', type: 'основное', difficulty: 'легко',
    description: '  Быстрый суп  ', ingredients: 'Морковь\n\nЛук',
    steps: 'Нарежьте овощи\n\nСварите суп', minutes: 30, servings: 2,
  }, { id: 7, name: 'Максим', email: 'max@example.test' });
  assert.equal(recipe.title, 'Домашний суп');
  assert.equal(recipe.userId, 7);
  assert.equal(recipe.author, 'Максим');
  assert.deepEqual(recipe.ingredients, ['Морковь', 'Лук']);
  assert.deepEqual(recipe.steps, ['Нарежьте овощи', 'Сварите суп']);
  assert.equal(recipe.about, 'Быстрый суп');
});

test('пустые поля нельзя отправить, запись рецептов требует входа', () => {
  assert.throws(() => makeRecipe({ title: ' ', description: ' ' }, { id: 7, email: 'a@b.test' }));
  assert.equal(routes.recipes, 644);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import db from '../db.json' with { type: 'json' };
import { filterRecipes } from '../src/filterRecipes.js';

test('поиск учитывает название и ингредиенты без учёта регистра', () => {
  assert.deepEqual(filterRecipes(db.recipes, { query: 'ЙОГУРТ' }).map((item) => item.id), [6]);
  assert.deepEqual(filterRecipes(db.recipes, { ingredient: 'чеснок' }).map((item) => item.id), [1]);
});

test('тип и сложность применяются вместе', () => {
  assert.deepEqual(filterRecipes(db.recipes, { type: 'завтрак', difficulty: 'легко' }).map((item) => item.id), [4, 6]);
  assert.deepEqual(filterRecipes(db.recipes, { type: 'салат', difficulty: 'средне' }), []);
});

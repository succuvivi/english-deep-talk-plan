import test from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../js/state.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key)
  };
}

test('defaults are empty favorites, Thai shown, normal speed', () => {
  const state = createState(memoryStorage());
  assert.deepEqual(state.getFavorites(), []);
  assert.equal(state.getShowThai(), true);
  assert.equal(state.getSpeechRate(), 'normal');
});

test('favorite toggle persists and returns new state', () => {
  const state = createState(memoryStorage());
  assert.equal(state.toggleFavorite('restaurant-spicy'), true);
  assert.equal(state.isFavorite('restaurant-spicy'), true);
  assert.equal(state.toggleFavorite('restaurant-spicy'), false);
  assert.equal(state.isFavorite('restaurant-spicy'), false);
});

test('corrupt storage safely falls back to defaults', () => {
  const state = createState(memoryStorage({
    'thai-life:favorites': '{bad json',
    'thai-life:show-thai': 'maybe',
    'thai-life:speech-rate': 'fast'
  }));
  assert.deepEqual(state.getFavorites(), []);
  assert.equal(state.getShowThai(), true);
  assert.equal(state.getSpeechRate(), 'normal');
});

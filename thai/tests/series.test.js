import test from 'node:test';
import assert from 'node:assert/strict';
import { groupEntriesForDisplay, clampSeriesIndex, getSwipeDirection } from '../js/series.js';

const standalone = { id: 'solo', zh: '结账' };
const spicy = { id: 'spicy', zh: '辣', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 2 };
const sweet = { id: 'sweet', zh: '甜', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 1 };
const sour = { id: 'sour', zh: '酸', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 3 };

test('groups same-series entries and keeps the first visible position', () => {
  const result = groupEntriesForDisplay([spicy, standalone, sweet, sour]);
  assert.equal(result.length, 2);
  assert.equal(result[0].kind, 'series');
  assert.equal(result[0].id, 'taste');
  assert.deepEqual(result[0].entries.map(entry => entry.zh), ['甜', '辣', '酸']);
  assert.equal(result[1].entry.id, 'solo');
});

test('a single surviving series member becomes a standalone entry', () => {
  const result = groupEntriesForDisplay([spicy, standalone]);
  assert.deepEqual(result.map(item => item.kind), ['entry', 'entry']);
  assert.equal(result[0].entry.id, 'spicy');
});

test('different series never merge', () => {
  const otherA = { id: 'left', seriesId: 'direction', seriesLabel: '方向', seriesOrder: 1 };
  const otherB = { id: 'right', seriesId: 'direction', seriesLabel: '方向', seriesOrder: 2 };
  const result = groupEntriesForDisplay([sweet, spicy, otherA, otherB]);
  assert.deepEqual(result.map(item => item.id), ['taste', 'direction']);
});

test('clampSeriesIndex stays inside current series length', () => {
  assert.equal(clampSeriesIndex(-1, 5), 0);
  assert.equal(clampSeriesIndex(2, 5), 2);
  assert.equal(clampSeriesIndex(9, 5), 4);
  assert.equal(clampSeriesIndex(2, 0), 0);
});

test('swipe direction requires a 50px predominantly horizontal gesture', () => {
  assert.equal(getSwipeDirection(-70, 10), 'next');
  assert.equal(getSwipeDirection(70, 10), 'prev');
  assert.equal(getSwipeDirection(-40, 5), null);
  assert.equal(getSwipeDirection(-70, 90), null);
  assert.equal(getSwipeDirection(5, 1), null);
});

test('series view state exposes active, neighbors, progress, and edge flags', async () => {
  const { getSeriesViewState } = await import('../js/series.js');
  const group = { id: 'taste', entries: [sweet, spicy, sour] };
  assert.deepEqual(getSeriesViewState(group, 1), {
    index: 1,
    active: spicy,
    previous: sweet,
    next: sour,
    current: 2,
    total: 3,
    atStart: false,
    atEnd: false
  });
  assert.equal(getSeriesViewState(group, -9).atStart, true);
  assert.equal(getSeriesViewState(group, 99).atEnd, true);
});

test('swipe gesture tracker ignores other pointers and returns the series direction', async () => {
  const { beginSwipeGesture, finishSwipeGesture } = await import('../js/series.js');
  const start = beginSwipeGesture('taste', 7, 180, 300);
  assert.deepEqual(start, { id: 'taste', pointerId: 7, x: 180, y: 300 });
  assert.equal(finishSwipeGesture(start, 8, 100, 300), null);
  assert.deepEqual(finishSwipeGesture(start, 7, 100, 308), { id: 'taste', direction: 'next' });
  assert.equal(finishSwipeGesture(start, 7, 175, 370), null);
});

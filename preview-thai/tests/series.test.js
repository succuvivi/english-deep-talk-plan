import test from 'node:test';
import assert from 'node:assert/strict';
import { groupEntriesForDisplay, clampSeriesIndex, getSwipeDirection, getSeriesTrackIndex, getSeriesTrackProgress } from '../js/series.js';

const standalone = { id: 'solo', zh: '结账' };
const spicy = { id: 'spicy', zh: '辣', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 2 };
const sweet = { id: 'sweet', zh: '甜', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 1 };
const sour = { id: 'sour', zh: '酸', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 3 };

test('groups same-series entries and keeps the first visible position', () => {
  const result = groupEntriesForDisplay([spicy, standalone, sweet, sour]);
  assert.equal(result.length, 2);
  assert.equal(result[0].kind, 'series');
  assert.deepEqual(result[0].entries.map(entry => entry.zh), ['甜', '辣', '酸']);
});

test('a single surviving series member becomes a standalone entry', () => {
  const result = groupEntriesForDisplay([spicy, standalone]);
  assert.deepEqual(result.map(item => item.kind), ['entry', 'entry']);
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
});

test('swipe direction requires a 50px predominantly horizontal gesture', () => {
  assert.equal(getSwipeDirection(-70, 10), 'next');
  assert.equal(getSwipeDirection(70, 10), 'prev');
  assert.equal(getSwipeDirection(-40, 5), null);
});

test('series track index follows actual horizontal position', () => {
  assert.equal(getSeriesTrackIndex(0, 320, 4), 0);
  assert.equal(getSeriesTrackIndex(319, 320, 4), 1);
  assert.equal(getSeriesTrackIndex(641, 320, 4), 2);
  assert.equal(getSeriesTrackIndex(9999, 320, 4), 3);
  assert.equal(getSeriesTrackIndex(-30, 320, 4), 0);
});

test('series track progress exposes human readable current and total', () => {
  assert.deepEqual(getSeriesTrackProgress(640, 320, 4), { index: 2, current: 3, total: 4 });
  assert.deepEqual(getSeriesTrackProgress(0, 0, 0), { index: 0, current: 0, total: 0 });
});

test('native series markup renders every full card and no arrow navigation', async () => {
  const { renderSeriesTrack } = await import('../js/series.js');
  const group = { id: 'protein', label: '肉类食材', entries: [
    { id: 'meat', zh: '肉' },
    { id: 'chicken', zh: '鸡' },
    { id: 'pork', zh: '猪' },
    { id: 'fish', zh: '鱼' }
  ] };
  const html = renderSeriesTrack(group, entry => `<article data-entry-id="${entry.id}">${entry.zh}</article>`, value => value);
  assert.match(html, /class="series-track"/);
  assert.match(html, /data-series-track="protein"/);
  assert.equal((html.match(/class="series-slide"/g) || []).length, 4);
  assert.match(html, />肉</);
  assert.match(html, />鸡</);
  assert.match(html, />猪</);
  assert.match(html, />鱼</);
  assert.match(html, />1 \/ 4</);
  assert.doesNotMatch(html, /data-series-nav/);
  assert.doesNotMatch(html, /series-nav/);
});

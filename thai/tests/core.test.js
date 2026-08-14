import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, parseLearnQuery, filterEntries, escapeHtml } from '../js/core.js';

test('normalizeText trims, lowercases, and collapses spaces', () => {
  assert.equal(normalizeText('  Grab   TAXI  '), 'grab taxi');
});

test('parseLearnQuery reads scene, q, and favorites flag', () => {
  assert.deepEqual(
    parseLearnQuery('?scene=restaurant&q=%E8%BE%A3&favorites=1'),
    { scene: 'restaurant', q: '辣', favoritesOnly: true }
  );
});

test('parseLearnQuery returns safe defaults', () => {
  assert.deepEqual(parseLearnQuery(''), { scene: null, q: '', favoritesOnly: false });
});

const sampleEntries = [
  { id: 'a', scene: ['restaurant'], zh: '辣', roman: 'phet', th: 'เผ็ด', keywords: ['口味'], collocations: [{ zh: '不辣' }], examples: [{ zh: '不要辣' }] },
  { id: 'b', scene: ['repairs'], zh: '空调', roman: 'air', th: 'แอร์', keywords: ['维修'], collocations: [{ zh: '空调坏了' }], examples: [{ zh: '请来修空调' }] }
];

test('filterEntries filters by scene', () => {
  assert.deepEqual(filterEntries(sampleEntries, { scene: 'restaurant', q: '', favoritesOnly: false, favoriteIds: [] }).map(x => x.id), ['a']);
});

test('filterEntries finds Chinese text in meaning, keywords, collocations, and examples', () => {
  assert.deepEqual(filterEntries(sampleEntries, { scene: null, q: '维修', favoritesOnly: false, favoriteIds: [] }).map(x => x.id), ['b']);
  assert.deepEqual(filterEntries(sampleEntries, { scene: null, q: '不要辣', favoritesOnly: false, favoriteIds: [] }).map(x => x.id), ['a']);
});

test('filterEntries supports favorites-only mode', () => {
  assert.deepEqual(filterEntries(sampleEntries, { scene: null, q: '', favoritesOnly: true, favoriteIds: ['b'] }).map(x => x.id), ['b']);
});


test('escapeHtml protects rendered data fields', () => {
  assert.equal(escapeHtml('<b>\"辣\" & test</b>'), '&lt;b&gt;&quot;辣&quot; &amp; test&lt;/b&gt;');
});

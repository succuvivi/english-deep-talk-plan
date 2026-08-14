import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES } from '../data/scenes.js';
import { ENTRIES } from '../data/index.js';
import { SERIES_DEFINITIONS } from '../data/series.js';

const sceneIds = new Set(SCENES.map(s => s.id));

test('scene registry contains exactly 18 unique scenes', () => {
  assert.equal(SCENES.length, 18);
  assert.equal(sceneIds.size, 18);
});

test('seed vocabulary has unique IDs and valid playable data', () => {
  const ids = new Set();
  for (const entry of ENTRIES) {
    assert.ok(entry.id && !ids.has(entry.id));
    ids.add(entry.id);
    assert.ok(entry.scene.length >= 1 && entry.scene.every(id => sceneIds.has(id)));
    assert.ok(entry.zh && entry.th && entry.roman && entry.zhPron);
    assert.doesNotMatch(entry.roman, /[\u0E00-\u0E7F]/, `${entry.id} romanization contains Thai script`);
    assert.ok(Array.isArray(entry.collocations) && entry.collocations.length >= 2);
    assert.ok(Array.isArray(entry.examples) && entry.examples.length >= 2);
    for (const item of [...entry.collocations, ...entry.examples]) {
      assert.ok(item.th && item.roman && item.zh);
      assert.doesNotMatch(item.roman, /[\u0E00-\u0E7F]/, `${entry.id} phrase romanization contains Thai script`);
    }
  }
});

const REQUIRED_COUNTS = new Map([
  ['restaurant', 20], ['coffee', 20], ['convenience', 20], ['market', 20],
  ['taxi', 20], ['motorbike', 20], ['directions', 20], ['petrol', 20],
  ['delivery', 20], ['condo', 20], ['repairs', 20], ['laundry', 20],
  ['massage', 20], ['hospital', 20], ['bank', 20], ['mobile', 20],
  ['greetings', 20], ['friends', 20]
]);

test('every v1 scene has at least 20 vocabulary entries', () => {
  for (const [scene, min] of REQUIRED_COUNTS) {
    const count = ENTRIES.filter(entry => entry.scene.includes(scene)).length;
    assert.ok(count >= min, `${scene} has ${count}, expected >= ${min}`);
  }
});

test('series definitions resolve to unique entries and contain at least two members', () => {
  const assigned = new Set();

  for (const definition of SERIES_DEFINITIONS) {
    assert.ok(definition.id && definition.scene && definition.label);
    assert.ok(definition.members.length >= 2, `${definition.id} needs >= 2 members`);
    assert.equal(new Set(definition.members).size, definition.members.length, `${definition.id} has duplicate member labels`);

    for (const zh of definition.members) {
      const matches = ENTRIES.filter(entry => entry.scene.includes(definition.scene) && entry.zh === zh);
      assert.equal(matches.length, 1, `${definition.id}:${zh} must resolve exactly once`);
      const key = `${definition.scene}:${matches[0].id}`;
      assert.ok(!assigned.has(key), `${matches[0].id} appears in more than one series in the same scene`);
      assigned.add(key);
    }
  }
});

test('enriched entries expose consistent ordered series metadata', () => {
  const grouped = new Map();
  for (const entry of ENTRIES.filter(entry => entry.seriesId)) {
    if (!grouped.has(entry.seriesId)) grouped.set(entry.seriesId, []);
    grouped.get(entry.seriesId).push(entry);
  }

  for (const definition of SERIES_DEFINITIONS) {
    const members = grouped.get(definition.id) || [];
    assert.equal(members.length, definition.members.length, `${definition.id} member count mismatch`);
    assert.deepEqual(
      members.sort((a, b) => a.seriesOrder - b.seriesOrder).map(entry => entry.zh),
      definition.members
    );
    assert.ok(members.every(entry => entry.seriesLabel === definition.label));
    assert.equal(new Set(members.map(entry => entry.seriesOrder)).size, members.length);
  }
});

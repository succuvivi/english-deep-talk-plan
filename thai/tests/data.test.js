import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES } from '../data/scenes.js';
import { ENTRIES } from '../data/index.js';

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

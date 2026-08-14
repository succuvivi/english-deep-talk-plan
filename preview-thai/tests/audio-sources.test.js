import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ENTRIES } from '../data/index.js';
import { AUDIO_BY_ENTRY_ID } from '../data/audio-map.js';
import { isAllowedAudioLicense } from '../../tools/import_thai_audio.mjs';

const manifest = JSON.parse(readFileSync(new URL('../audio/sources.json', import.meta.url), 'utf8'));
const entriesById = new Map(ENTRIES.map(entry => [entry.id, entry]));

test('human audio manifest matches vocabulary, local files, licenses, and audio map', () => {
  const ids = new Set();
  const pathThai = new Map();
  for (const row of manifest) {
    assert.ok(!ids.has(row.entryId), `duplicate manifest entry ${row.entryId}`);
    ids.add(row.entryId);
    const entry = entriesById.get(row.entryId);
    assert.ok(entry, `unknown entryId ${row.entryId}`);
    assert.equal(row.thai, entry.th, `${row.entryId} Thai mismatch`);
    assert.equal(AUDIO_BY_ENTRY_ID[row.entryId], row.localPath, `${row.entryId} audio map mismatch`);
    assert.ok(isAllowedAudioLicense(row.license), `${row.entryId} disallowed license ${row.license}`);
    assert.ok(row.source && row.sourceUrl, `${row.entryId} missing source provenance`);
    if (/^CC BY/i.test(row.license)) assert.ok(row.creator, `${row.entryId} missing required creator attribution`);
    const filePath = fileURLToPath(new URL(`../${row.localPath.replace(/^\.\//, '')}`, import.meta.url));
    assert.ok(existsSync(filePath), `${row.entryId} missing ${row.localPath}`);
    assert.ok(statSync(filePath).size > 0, `${row.entryId} audio file is empty`);
    if (!pathThai.has(row.localPath)) pathThai.set(row.localPath, new Set());
    pathThai.get(row.localPath).add(row.thai);
  }
  for (const [localPath, thaiSet] of pathThai) {
    assert.equal(thaiSet.size, 1, `${localPath} reused for different Thai targets`);
  }
  for (const [entryId, localPath] of Object.entries(AUDIO_BY_ENTRY_ID)) {
    assert.ok(ids.has(entryId), `${entryId} mapped to ${localPath} without manifest row`);
  }
});

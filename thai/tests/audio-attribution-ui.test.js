import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const learn = readFileSync(new URL('../learn.html', import.meta.url), 'utf8');

test('Thai pages link to local human audio attribution', () => {
  assert.match(index, /href="audio-sources\.html"/);
  assert.match(learn, /href="audio-sources\.html"/);
});

test('audio source page exists and loads the provenance manifest renderer', () => {
  const page = readFileSync(new URL('../audio-sources.html', import.meta.url), 'utf8');
  assert.match(page, /id="audio-coverage"/);
  assert.match(page, /id="audio-sources-list"/);
  assert.match(page, /src="js\/audio-sources\.js"/);
});

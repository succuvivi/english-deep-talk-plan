import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAudioMetadata } from '../data/audio-map.js';

test('applyAudioMetadata adds local recording URLs without mutating source entries', () => {
  const source = [
    { id: 'coffee-01', th: 'กาแฟ', audio: null },
    { id: 'coffee-02', th: 'ชา', audio: null }
  ];
  const map = { 'coffee-01': './audio/words/coffee-01.ogg' };
  const result = applyAudioMetadata(source, map);
  assert.equal(result[0].audio, './audio/words/coffee-01.ogg');
  assert.equal(result[1].audio, null);
  assert.equal(source[0].audio, null);
  assert.notEqual(result[0], source[0]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractLinguaLibreTarget,
  extractDirectThaiFilename,
  parseWiktionaryAudioMap,
  isAllowedAudioLicense,
  chooseBestCandidate,
  buildAudioAssignments
} from '../../tools/import_thai_audio.mjs';

test('extractLinguaLibreTarget returns exact Thai transcription suffix', () => {
  assert.equal(extractLinguaLibreTarget('File:LL-Q9217 (tha)-Patsagorn Y.-กาแฟ.wav'), 'กาแฟ');
  assert.equal(extractLinguaLibreTarget('File:LL-Q9217 (tha)-咽頭べさ-น้ำตาล.wav'), 'น้ำตาล');
  assert.equal(extractLinguaLibreTarget('File:Something unrelated.ogg'), null);
});

test('license allow-list accepts only redistribution-safe licenses', () => {
  for (const license of ['CC0', 'CC0 1.0', 'Public domain', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0']) {
    assert.equal(isAllowedAudioLicense(license), true, license);
  }
  for (const license of ['CC BY-NC 4.0', 'CC BY-ND 4.0', 'All rights reserved', '', null]) {
    assert.equal(isAllowedAudioLicense(license), false, String(license));
  }
});

test('candidate selection prefers exact allowed CC0 then attribution licenses', () => {
  const candidates = [
    { target: 'กาแฟ', license: 'CC BY-SA 4.0', title: 'b', url: 'https://x/b.wav' },
    { target: 'กาแฟ', license: 'CC0 1.0', title: 'z', url: 'https://x/z.wav' },
    { target: 'กาแฟ', license: 'CC BY-NC 4.0', title: 'a', url: 'https://x/a.wav' }
  ];
  assert.equal(chooseBestCandidate(candidates)?.title, 'z');
});

test('one Thai recording is assigned to every entry with the same Thai target', () => {
  const entries = [
    { id: 'restaurant-water', th: 'น้ำ' },
    { id: 'petrol-water', th: 'น้ำ' },
    { id: 'coffee-coffee', th: 'กาแฟ' }
  ];
  const selected = new Map([
    ['น้ำ', { localPath: './audio/words/thai-water.ogg' }]
  ]);
  assert.deepEqual(buildAudioAssignments(entries, selected), {
    'restaurant-water': './audio/words/thai-water.ogg',
    'petrol-water': './audio/words/thai-water.ogg'
  });
});

test('parseWiktionaryAudioMap keeps exact Thai keys and Commons filenames', () => {
  const source = `return {\n  ["ไก่"] = "Th-gai.ogg",\n  ["ชา"] = "Th-cha.ogg",\n  ["ปฺระ-เทด-ไท"] = "Th-Thailand.ogg",\n}`;
  const map = parseWiktionaryAudioMap(source);
  assert.equal(map.get('ไก่'), 'File:Th-gai.ogg');
  assert.equal(map.get('ชา'), 'File:Th-cha.ogg');
  assert.equal(map.get('ปฺระ-เทด-ไท'), 'File:Th-Thailand.ogg');
});

test('extractDirectThaiFilename accepts exact Thai-named files in Commons pronunciation category', () => {
  assert.equal(extractDirectThaiFilename('File:Th-น้ำ.ogg'), 'น้ำ');
  assert.equal(extractDirectThaiFilename('File:Th-ข้าว.oga'), 'ข้าว');
  assert.equal(extractDirectThaiFilename('File:Th-cha.ogg'), null);
});

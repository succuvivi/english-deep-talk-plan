import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractLinguaLibreTarget,
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

test('parseWiktionaryAudioMap keeps exact Thai keys and Commons filenames', async () => {
  const { parseWiktionaryAudioMap } = await import('../../tools/import_thai_audio.mjs');
  const source = `return {\n  ["ไก่"] = "Th-gai.ogg",\n  ["ชา"] = "Th-cha.ogg",\n  ["ปฺระ-เทด-ไท"] = "Th-Thailand.ogg",\n}`;
  const map = parseWiktionaryAudioMap(source);
  assert.equal(map.get('ไก่'), 'File:Th-gai.ogg');
  assert.equal(map.get('ชา'), 'File:Th-cha.ogg');
  assert.equal(map.get('ปฺระ-เทด-ไท'), 'File:Th-Thailand.ogg');
});

test('extractDirectThaiFilename accepts exact Thai-named files in Commons pronunciation category', async () => {
  const { extractDirectThaiFilename } = await import('../../tools/import_thai_audio.mjs');
  assert.equal(extractDirectThaiFilename('File:Th-น้ำ.ogg'), 'น้ำ');
  assert.equal(extractDirectThaiFilename('File:Th-ข้าว.oga'), 'ข้าว');
  assert.equal(extractDirectThaiFilename('File:Th-cha.ogg'), null);
});

test('audio file detection accepts Commons Ogg application MIME and standard audio MIME', async () => {
  const { isSupportedAudioFile } = await import('../../tools/import_thai_audio.mjs');
  assert.equal(isSupportedAudioFile('File:Th-cha.ogg', 'application/ogg'), true);
  assert.equal(isSupportedAudioFile('File:voice.wav', 'audio/wav'), true);
  assert.equal(isSupportedAudioFile('File:photo.jpg', 'image/jpeg'), false);
});

test('canonicalizeMediaUrl removes Wikimedia tracking parameters without changing file path', async () => {
  const { canonicalizeMediaUrl } = await import('../../tools/import_thai_audio.mjs');
  const value = canonicalizeMediaUrl('https://upload.wikimedia.org/wikipedia/commons/9/94/Th-x.oga?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original');
  assert.equal(value, 'https://upload.wikimedia.org/wikipedia/commons/9/94/Th-x.oga');
});

test('fetchWithRateLimitRetry retries 429 responses then returns success', async () => {
  const { fetchWithRateLimitRetry } = await import('../../tools/import_thai_audio.mjs');
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls < 3) return { ok: false, status: 429, headers: new Map() };
    return { ok: true, status: 200, headers: new Map() };
  };
  const waits = [];
  const response = await fetchWithRateLimitRetry('https://example.test/a.ogg', {
    fetchImpl,
    sleepFn: async ms => waits.push(ms),
    retryDelays: [10, 20, 30]
  });
  assert.equal(response.status, 200);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [10, 20]);
});

test('findExactThaiTargets matches complete Thai targets in Commons descriptions, not substrings', async () => {
  const { findExactThaiTargets } = await import('../../tools/import_thai_audio.mjs');
  const wanted = new Set(['ชา', 'มี', 'ไม่มี', 'กาแฟ']);
  assert.deepEqual(findExactThaiTargets('Pronunciation of word "ชา (chaa)" in Thai. Male voice.', wanted), ['ชา']);
  assert.deepEqual(findExactThaiTargets('English: Thai pronunciation of ไม่มี', wanted), ['ไม่มี']);
  assert.deepEqual(findExactThaiTargets('No Thai target here', wanted), []);
});

test('descriptionTargetRefs derives exact Thai targets from Commons metadata', async () => {
  const { descriptionTargetRefs } = await import('../../tools/import_thai_audio.mjs');
  const page = {
    title: 'File:Th-cha.ogg',
    imageinfo: [{
      extmetadata: {
        ImageDescription: { value: 'Pronunciation of word "ชา (chaa)" in Thai. Male voice.' },
        ObjectName: { value: 'Thai pronunciation' }
      }
    }]
  };
  assert.deepEqual(descriptionTargetRefs(page, new Set(['ชา', 'กาแฟ'])), [
    { title: 'File:Th-cha.ogg', target: 'ชา', source: 'Wikimedia Commons / exact Thai description' }
  ]);
});

test('linguaLibreArchiveBasename maps Commons file titles to dataset filenames', async () => {
  const { linguaLibreArchiveBasename } = await import('../../tools/import_thai_audio.mjs');
  assert.equal(
    linguaLibreArchiveBasename('File:LL-Q9217 (tha)-Patsagorn Y.-กาแฟ.wav'),
    'LL-Q9217 (tha)-Patsagorn Y.-กาแฟ.wav'
  );
  assert.equal(linguaLibreArchiveBasename('File:Th-cha.ogg'), null);
});

test('fetchWithRateLimitRetry caps excessive Retry-After values', async () => {
  const { fetchWithRateLimitRetry } = await import('../../tools/import_thai_audio.mjs');
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) {
      return { ok: false, status: 429, headers: { get: key => key === 'retry-after' ? '9999' : null } };
    }
    return { ok: true, status: 200, headers: { get: () => null } };
  };
  const waits = [];
  const response = await fetchWithRateLimitRetry('https://example.test/a.ogg', {
    fetchImpl,
    sleepFn: async ms => waits.push(ms),
    retryDelays: [1000],
    maxRetryAfterMs: 15000
  });
  assert.equal(response.status, 200);
  assert.deepEqual(waits, [15000]);
});

test('interDownloadDelayMs delays every remote download after the first', async () => {
  const { interDownloadDelayMs } = await import('../../tools/import_thai_audio.mjs');
  assert.equal(interDownloadDelayMs(0, 1200), 0);
  assert.equal(interDownloadDelayMs(1, 1200), 1200);
  assert.equal(interDownloadDelayMs(4, 1500), 1500);
  assert.equal(interDownloadDelayMs(2, -1), 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryGeneratorUrl, candidateRefsFromCategoryPage } from '../../tools/import_thai_audio_generator.mjs';

test('category generator URL fetches file metadata in the same paginated request', () => {
  const url = new URL(buildCategoryGeneratorUrl('Category:Thai pronunciation', 'next-token'));
  assert.equal(url.hostname, 'commons.wikimedia.org');
  assert.equal(url.searchParams.get('generator'), 'categorymembers');
  assert.equal(url.searchParams.get('gcmtitle'), 'Category:Thai pronunciation');
  assert.equal(url.searchParams.get('gcmnamespace'), '6');
  assert.equal(url.searchParams.get('prop'), 'imageinfo');
  assert.match(url.searchParams.get('iiprop'), /extmetadata/);
  assert.equal(url.searchParams.get('gcmcontinue'), 'next-token');
});

test('category page candidate refs combine exact filename and exact Thai description without duplicates', () => {
  const page = {
    title: 'File:Th-cha.ogg',
    imageinfo: [{ extmetadata: { ImageDescription: { value: 'Pronunciation of word ชา in Thai.' } } }]
  };
  assert.deepEqual(candidateRefsFromCategoryPage(page, new Set(['ชา', 'กาแฟ']), { linguaLibre: false }), [
    { title: 'File:Th-cha.ogg', target: 'ชา', source: 'Wikimedia Commons / exact Thai description' }
  ]);
});

test('audio curl args cap retries and per-file runtime so one recording cannot stall the import', async () => {
  const { buildAudioCurlArgs } = await import('../../tools/import_thai_audio_generator.mjs');
  const args = buildAudioCurlArgs('https://upload.wikimedia.org/test.ogg', '/tmp/test.ogg');
  const retryIndex = args.indexOf('--retry');
  const maxTimeIndex = args.indexOf('--max-time');
  assert.equal(args[retryIndex + 1], '1');
  assert.equal(args[maxTimeIndex + 1], '25');
  assert.ok(args.includes('https://upload.wikimedia.org/test.ogg'));
  assert.equal(args.at(-1), '/tmp/test.ogg');
});

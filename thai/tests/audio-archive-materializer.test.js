import test from 'node:test';
import assert from 'node:assert/strict';
import { archiveBasenameForCandidate, buildManifestRowsForThai } from '../../tools/materialize_thai_audio_archive.mjs';

test('archive basename resolves only Lingua Libre Thai file titles', () => {
  assert.equal(
    archiveBasenameForCandidate({ title: 'File:LL-Q9217 (tha)-Patsagorn Y.-กาแฟ.wav', source: 'Wikimedia Commons / Lingua Libre' }),
    'LL-Q9217 (tha)-Patsagorn Y.-กาแฟ.wav'
  );
  assert.equal(archiveBasenameForCandidate({ title: 'File:Th-cha.ogg', source: 'Thai Wiktionary pronunciation index / Wikimedia Commons' }), null);
});

test('manifest rows reuse one exact recording for all entries sharing Thai text', () => {
  const candidate = {
    localPath: './audio/words/coffee-01.wav',
    source: 'Wikimedia Commons / Lingua Libre',
    descriptionUrl: 'https://commons.wikimedia.org/wiki/File:X.wav',
    creator: 'Thai speaker',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/'
  };
  const rows = buildManifestRowsForThai('กาแฟ', [{ id: 'coffee-01' }, { id: 'other-01' }], candidate, 1234);
  assert.deepEqual(rows.map(row => row.entryId), ['coffee-01', 'other-01']);
  assert.ok(rows.every(row => row.thai === 'กาแฟ' && row.bytes === 1234));
});

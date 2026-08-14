import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runImport, chooseBestCandidate, buildAudioAssignments } from './import_thai_audio.mjs';

export function archiveBasenameForCandidate(candidate) {
  if (!String(candidate?.source || '').includes('Lingua Libre')) return null;
  const title = String(candidate?.title || '');
  if (!/^File:LL-Q\d+ \(tha\)-/u.test(title)) return null;
  return title.replace(/^File:/, '');
}

export function buildManifestRowsForThai(thai, entries, candidate, bytes) {
  return (entries || []).map(entry => ({
    entryId: entry.id,
    thai,
    localPath: candidate.localPath,
    source: candidate.source,
    sourceUrl: candidate.descriptionUrl,
    creator: candidate.creator,
    license: candidate.license,
    licenseUrl: candidate.licenseUrl,
    sourceFileTitle: candidate.title,
    bytes
  }));
}

async function buildBasenameIndex(root) {
  const output = new Map();
  async function walk(dir) {
    let items;
    try { items = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) await walk(full);
      else if (item.isFile()) output.set(item.name.normalize('NFC'), full);
    }
  }
  await walk(root);
  return output;
}

function audioMapModule(assignments) {
  const ordered = Object.fromEntries(Object.entries(assignments).sort(([a], [b]) => a.localeCompare(b)));
  return `export const AUDIO_BY_ENTRY_ID = ${JSON.stringify(ordered, null, 2)};\n\nexport function applyAudioMetadata(entries, audioMap = AUDIO_BY_ENTRY_ID) {\n  return entries.map(entry => {\n    const audio = audioMap[entry.id];\n    return audio ? { ...entry, audio } : { ...entry };\n  });\n}\n`;
}

export async function materializeFromLinguaLibreArchive({ repoRoot = process.cwd(), datasetDir } = {}) {
  if (!datasetDir) throw new Error('LINGUA_LIBRE_DATASET_DIR is required');
  const dry = await runImport({ repoRoot, download: false });
  const entries = dry.entries;
  const byThai = new Map();
  for (const entry of entries) {
    if (!byThai.has(entry.th)) byThai.set(entry.th, []);
    byThai.get(entry.th).push(entry);
  }

  const archiveIndex = await buildBasenameIndex(datasetDir);
  const candidateGroups = new Map();
  for (const candidate of dry.candidates) {
    const basename = archiveBasenameForCandidate(candidate);
    if (!basename || !archiveIndex.has(basename.normalize('NFC'))) continue;
    if (!candidateGroups.has(candidate.target)) candidateGroups.set(candidate.target, []);
    candidateGroups.get(candidate.target).push(candidate);
  }

  const selectedByThai = new Map();
  for (const [thai, options] of candidateGroups) {
    const selected = chooseBestCandidate(options);
    if (!selected) continue;
    const canonicalEntry = [...byThai.get(thai)].sort((a, b) => a.id.localeCompare(b.id))[0];
    const basename = archiveBasenameForCandidate(selected);
    const extension = path.extname(basename).toLowerCase() || '.wav';
    selectedByThai.set(thai, {
      ...selected,
      archivePath: archiveIndex.get(basename.normalize('NFC')),
      localPath: `./audio/words/${canonicalEntry.id}${extension}`
    });
  }

  const outputDir = path.join(repoRoot, 'thai/audio/words');
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const manifest = [];
  for (const [thai, candidate] of [...selectedByThai.entries()].sort(([a], [b]) => a.localeCompare(b, 'th'))) {
    const destination = path.join(repoRoot, 'thai', candidate.localPath.replace(/^\.\//, ''));
    await fs.copyFile(candidate.archivePath, destination);
    const bytes = (await fs.stat(destination)).size;
    manifest.push(...buildManifestRowsForThai(thai, byThai.get(thai), candidate, bytes));
  }
  manifest.sort((a, b) => a.entryId.localeCompare(b.entryId));

  const assignments = buildAudioAssignments(entries, selectedByThai);
  await fs.writeFile(path.join(repoRoot, 'thai/audio/sources.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(path.join(repoRoot, 'thai/data/audio-map.js'), audioMapModule(assignments));

  const human = Object.keys(assignments).length;
  console.log(`Lingua Libre archive files indexed: ${archiveIndex.size}`);
  console.log(`Human word audio: ${human} / ${entries.length}`);
  console.log(`Unique human recordings: ${selectedByThai.size}`);
  console.log(`Device-TTS word fallback: ${entries.length - human} / ${entries.length}`);
  return { entries, selectedByThai, manifest, assignments };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  materializeFromLinguaLibreArchive({
    repoRoot: process.cwd(),
    datasetDir: process.env.LINGUA_LIBRE_DATASET_DIR
  }).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

import {
  extractLinguaLibreTarget,
  extractDirectThaiFilename,
  descriptionTargetRefs
} from './import_thai_audio.mjs';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

export function buildCategoryGeneratorUrl(category, continuation = null) {
  const url = new URL(COMMONS_API);
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('generator', 'categorymembers');
  url.searchParams.set('gcmtitle', category);
  url.searchParams.set('gcmnamespace', '6');
  url.searchParams.set('gcmlimit', '50');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|size|mime|extmetadata');
  if (continuation) url.searchParams.set('gcmcontinue', continuation);
  return url.toString();
}

export function candidateRefsFromCategoryPage(page, wantedThai, { linguaLibre = false } = {}) {
  const refs = [];
  const filenameTarget = linguaLibre
    ? extractLinguaLibreTarget(page?.title)
    : extractDirectThaiFilename(page?.title);
  if (filenameTarget && wantedThai.has(filenameTarget)) {
    refs.push({
      title: page.title,
      target: filenameTarget,
      source: linguaLibre
        ? 'Wikimedia Commons / Lingua Libre'
        : 'Wikimedia Commons / direct Thai filename'
    });
  }
  refs.push(...descriptionTargetRefs(page, wantedThai));
  const unique = new Map();
  for (const ref of refs) unique.set(`${ref.target}\u0000${ref.source}`, ref);
  return [...unique.values()];
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL, fileURLToPath } from 'node:url';
import {
  parseWiktionaryAudioMap,
  isSupportedAudioFile,
  isAllowedAudioLicense,
  chooseBestCandidate,
  buildAudioAssignments,
  canonicalizeMediaUrl
} from './import_thai_audio.mjs';
import { createPacedFetch } from './run_thai_audio_import.mjs';

const execFileAsync = promisify(execFile);
const WIKTIONARY_API = 'https://th.wiktionary.org/w/api.php';
const WIKTIONARY_AUDIO_MODULE = 'มอดูล:th-pron/files';
const LINGUA_LIBRE_CATEGORY = 'Category:Lingua Libre pronunciation-tha';
const THAI_PRONUNCIATION_CATEGORY = 'Category:Thai pronunciation';

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extValue(meta, key) {
  return meta?.[key]?.value ?? '';
}

function normalizeCandidate(page, ref) {
  const info = page?.imageinfo?.[0];
  if (!info || !ref?.target || !isSupportedAudioFile(page?.title, info.mime)) return null;
  const meta = info.extmetadata || {};
  const license = stripHtml(extValue(meta, 'LicenseShortName'));
  if (!isAllowedAudioLicense(license)) return null;
  return {
    target: ref.target,
    title: page.title,
    url: info.url,
    descriptionUrl: info.descriptionurl,
    mime: info.mime,
    size: Number(info.size || 0),
    creator: stripHtml(extValue(meta, 'Artist') || extValue(meta, 'Credit')),
    license,
    licenseUrl: stripHtml(extValue(meta, 'LicenseUrl')),
    source: ref.source
  };
}

function safeExtension(url, mime) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (/^\.(wav|wave|ogg|oga|mp3|webm|flac)$/i.test(ext)) return ext === '.wave' ? '.wav' : ext;
  } catch {}
  if (mime === 'audio/ogg' || mime === 'application/ogg') return '.ogg';
  if (mime === 'audio/mpeg') return '.mp3';
  if (mime === 'audio/webm') return '.webm';
  if (mime === 'audio/flac') return '.flac';
  return '.wav';
}

function audioMapModule(assignments) {
  const ordered = Object.fromEntries(Object.entries(assignments).sort(([a], [b]) => a.localeCompare(b)));
  return `export const AUDIO_BY_ENTRY_ID = ${JSON.stringify(ordered, null, 2)};\n\nexport function applyAudioMetadata(entries, audioMap = AUDIO_BY_ENTRY_ID) {\n  return entries.map(entry => {\n    const audio = audioMap[entry.id];\n    return audio ? { ...entry, audio } : { ...entry };\n  });\n}\n`;
}

async function fetchJson(fetchImpl, url) {
  const response = await fetchImpl(url, {
    headers: {
      'User-Agent': 'ThaiLifeSpeakAudioImporter/1.0 (GitHub: succuvivi/english-deep-talk-plan)',
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

async function fetchCategoryCandidates(fetchImpl, category, wantedThai, { linguaLibre = false } = {}) {
  const output = [];
  let continuation = null;
  do {
    const data = await fetchJson(fetchImpl, buildCategoryGeneratorUrl(category, continuation));
    for (const page of data?.query?.pages || []) {
      for (const ref of candidateRefsFromCategoryPage(page, wantedThai, { linguaLibre })) {
        const candidate = normalizeCandidate(page, ref);
        if (candidate) output.push(candidate);
      }
    }
    continuation = data?.continue?.gcmcontinue || null;
  } while (continuation);
  return output;
}

async function fetchWiktionaryCandidates(fetchImpl, wantedThai) {
  const parseUrl = new URL(WIKTIONARY_API);
  parseUrl.searchParams.set('action', 'parse');
  parseUrl.searchParams.set('format', 'json');
  parseUrl.searchParams.set('formatversion', '2');
  parseUrl.searchParams.set('page', WIKTIONARY_AUDIO_MODULE);
  parseUrl.searchParams.set('prop', 'wikitext');
  const parsed = await fetchJson(fetchImpl, parseUrl.toString());
  const map = parseWiktionaryAudioMap(parsed?.parse?.wikitext || '');
  const refs = [];
  for (const thai of wantedThai) {
    const title = map.get(thai);
    if (title) refs.push({ title, target: thai, source: 'Thai Wiktionary pronunciation index / Wikimedia Commons' });
  }
  if (!refs.length) return [];

  const refsByTitle = new Map();
  for (const ref of refs) {
    const key = ref.title.replaceAll('_', ' ').normalize('NFC');
    if (!refsByTitle.has(key)) refsByTitle.set(key, []);
    refsByTitle.get(key).push(ref);
  }

  const output = [];
  const titles = [...refsByTitle.keys()];
  for (let i = 0; i < titles.length; i += 20) {
    const url = new URL(COMMONS_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatversion', '2');
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set('iiprop', 'url|size|mime|extmetadata');
    url.searchParams.set('titles', titles.slice(i, i + 20).join('|'));
    const data = await fetchJson(fetchImpl, url.toString());
    for (const page of data?.query?.pages || []) {
      const key = String(page.title || '').replaceAll('_', ' ').normalize('NFC');
      for (const ref of refsByTitle.get(key) || []) {
        const candidate = normalizeCandidate(page, ref);
        if (candidate) output.push(candidate);
      }
    }
  }
  return output;
}

export function buildAudioCurlArgs(url, destination) {
  return [
    '-fL',
    '--connect-timeout', '10',
    '--max-time', '25',
    '--retry', '1',
    '--retry-all-errors',
    '--retry-delay', '2',
    '-A', 'ThaiLifeSpeakAudioImporter/1.0 (GitHub: succuvivi/english-deep-talk-plan)',
    canonicalizeMediaUrl(url),
    '-o', destination
  ];
}

async function downloadWithCurl(url, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await execFileAsync('curl', buildAudioCurlArgs(url, destination), { maxBuffer: 1024 * 1024 });
  const size = (await fs.stat(destination)).size;
  if (size <= 0) throw new Error(`Empty audio file: ${url}`);
  return size;
}

export async function runGeneratorImport({ repoRoot = process.cwd(), gapMs = 1200 } = {}) {
  const { ENTRIES } = await import(pathToFileURL(path.join(repoRoot, 'thai/data/index.js')).href);
  const entries = ENTRIES.map(({ id, th }) => ({ id, th }));
  const byThai = new Map();
  for (const entry of entries) {
    if (!byThai.has(entry.th)) byThai.set(entry.th, []);
    byThai.get(entry.th).push(entry);
  }
  const wantedThai = new Set(byThai.keys());
  const fetchImpl = createPacedFetch(globalThis.fetch, { gapMs });

  const candidates = [
    ...await fetchCategoryCandidates(fetchImpl, LINGUA_LIBRE_CATEGORY, wantedThai, { linguaLibre: true }),
    ...await fetchCategoryCandidates(fetchImpl, THAI_PRONUNCIATION_CATEGORY, wantedThai),
    ...await fetchWiktionaryCandidates(fetchImpl, wantedThai)
  ];

  const grouped = new Map();
  for (const candidate of candidates) {
    if (!grouped.has(candidate.target)) grouped.set(candidate.target, []);
    grouped.get(candidate.target).push(candidate);
  }

  const selectedByThai = new Map();
  for (const [thai, options] of grouped) {
    const selected = chooseBestCandidate(options);
    if (!selected) continue;
    const canonical = [...byThai.get(thai)].sort((a, b) => a.id.localeCompare(b.id))[0];
    selectedByThai.set(thai, {
      ...selected,
      localPath: `./audio/words/${canonical.id}${safeExtension(selected.url, selected.mime)}`
    });
  }

  console.log(`Vocabulary entries: ${entries.length}`);
  console.log(`Unique Thai targets: ${wantedThai.size}`);
  console.log(`Allowed exact candidates: ${candidates.length}`);
  console.log(`Matched unique Thai targets: ${selectedByThai.size}`);

  const outputDir = path.join(repoRoot, 'thai/audio/words');
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const successfulByThai = new Map();
  const manifest = [];
  let attempted = 0;
  let skipped = 0;
  for (const [thai, candidate] of [...selectedByThai.entries()].sort(([a], [b]) => a.localeCompare(b, 'th'))) {
    if (attempted > 0) await new Promise(resolve => setTimeout(resolve, 750));
    attempted += 1;
    const destination = path.join(repoRoot, 'thai', candidate.localPath.replace(/^\.\//, ''));
    try {
      const bytes = await downloadWithCurl(candidate.url, destination);
      successfulByThai.set(thai, candidate);
      for (const entry of byThai.get(thai)) {
        manifest.push({
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
        });
      }
    } catch (error) {
      skipped += 1;
      console.warn(`Skipping ${thai} (${candidate.title}): ${error.message}`);
      await fs.rm(destination, { force: true });
    }
  }

  manifest.sort((a, b) => a.entryId.localeCompare(b.entryId));
  const assignments = buildAudioAssignments(entries, successfulByThai);
  await fs.writeFile(path.join(repoRoot, 'thai/audio/sources.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(path.join(repoRoot, 'thai/data/audio-map.js'), audioMapModule(assignments));

  const human = Object.keys(assignments).length;
  console.log(`Human word audio: ${human} / ${entries.length}`);
  console.log(`Unique human recordings: ${successfulByThai.size} / ${wantedThai.size}`);
  console.log(`Skipped downloads: ${skipped}`);
  console.log(`Device-TTS word fallback: ${entries.length - human} / ${entries.length}`);
  return { entries, candidates, selectedByThai: successfulByThai, manifest, assignments };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  runGeneratorImport({
    repoRoot: process.cwd(),
    gapMs: Number(process.env.COMMONS_REQUEST_GAP_MS || 1200)
  }).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

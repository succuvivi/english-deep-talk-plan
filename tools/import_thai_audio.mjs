import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const WIKTIONARY_API = 'https://th.wiktionary.org/w/api.php';
const LINGUA_LIBRE_CATEGORY = 'Category:Lingua Libre pronunciation-tha';
const THAI_PRONUNCIATION_CATEGORY = 'Category:Thai pronunciation';
const WIKTIONARY_AUDIO_MODULE = 'มอดูล:th-pron/files';
const AUDIO_DIR = 'thai/audio/words';
const MANIFEST_PATH = 'thai/audio/sources.json';
const AUDIO_MAP_PATH = 'thai/data/audio-map.js';

export function extractLinguaLibreTarget(title) {
  const value = String(title || '');
  if (!/^File:LL-Q\d+ \(tha\)-/u.test(value)) return null;
  const base = value.replace(/^File:/, '').replace(/\.[^.]+$/, '');
  const dash = base.lastIndexOf('-');
  if (dash < 0 || dash === base.length - 1) return null;
  const target = base.slice(dash + 1).trim();
  return /[\u0E00-\u0E7F]/u.test(target) ? target : null;
}

export function linguaLibreArchiveBasename(title) {
  const value = String(title || '');
  if (!/^File:LL-Q\d+ \(tha\)-/u.test(value)) return null;
  return value.replace(/^File:/, '');
}

export function extractDirectThaiFilename(title) {
  const value = String(title || '');
  const match = value.match(/^File:(?:Th|th)-(.+)\.(?:ogg|oga|opus|mp3|wav|webm|flac)$/iu);
  if (!match) return null;
  const target = match[1].trim();
  return /[\u0E00-\u0E7F]/u.test(target) && !/[A-Za-z]/.test(target) ? target : null;
}

export function parseWiktionaryAudioMap(source) {
  const output = new Map();
  const pattern = /\["([^"]+)"\]\s*=\s*"([^"]+\.(?:ogg|oga|opus|mp3|wav|webm|flac))"/giu;
  for (const match of String(source || '').matchAll(pattern)) {
    output.set(match[1], match[2].startsWith('File:') ? match[2] : `File:${match[2]}`);
  }
  return output;
}

export function findExactThaiTargets(text, wantedThai) {
  const source = String(text || '').normalize('NFC');
  const targets = [...(wantedThai || [])].map(value => String(value).normalize('NFC')).sort((a, b) => b.length - a.length);
  const found = [];
  const isThai = char => Boolean(char && /[\u0E00-\u0E7F]/u.test(char));
  for (const target of targets) {
    let start = 0;
    while (start <= source.length - target.length) {
      const index = source.indexOf(target, start);
      if (index < 0) break;
      const before = index > 0 ? source[index - 1] : '';
      const afterIndex = index + target.length;
      const after = afterIndex < source.length ? source[afterIndex] : '';
      if (!isThai(before) && !isThai(after)) {
        found.push(target);
        break;
      }
      start = index + 1;
    }
  }
  return [...new Set(found)];
}

export function descriptionTargetRefs(page, wantedThai) {
  const info = page?.imageinfo?.[0];
  const meta = info?.extmetadata || {};
  const description = [
    stripHtml(extValue(meta, 'ImageDescription')),
    stripHtml(extValue(meta, 'ObjectName'))
  ].filter(Boolean).join(' ');
  return findExactThaiTargets(description, wantedThai).map(target => ({
    title: page.title,
    target,
    source: 'Wikimedia Commons / exact Thai description'
  }));
}

export function isSupportedAudioFile(title, mime) {
  const value = String(title || '').toLowerCase();
  const type = String(mime || '').toLowerCase();
  if (type.startsWith('audio/')) return true;
  if (type === 'application/ogg' || type === 'application/opus') return true;
  return /\.(?:ogg|oga|opus|mp3|wav|wave|webm|flac)$/i.test(value);
}

export function isAllowedAudioLicense(license) {
  const value = String(license || '').trim();
  if (!value) return false;
  if (/^CC0(?:\s|$)/i.test(value)) return true;
  if (/^(Public domain|PD)(?:\s|$)/i.test(value)) return true;
  if (/^CC BY-SA(?:\s|$)/i.test(value)) return true;
  if (/^CC BY(?:\s|$)/i.test(value)) return true;
  return false;
}

function licenseRank(license) {
  const value = String(license || '');
  if (/^CC0(?:\s|$)/i.test(value)) return 0;
  if (/^(Public domain|PD)(?:\s|$)/i.test(value)) return 1;
  if (/^CC BY(?:\s|$)/i.test(value)) return 2;
  if (/^CC BY-SA(?:\s|$)/i.test(value)) return 3;
  return 99;
}

function sourceRank(source) {
  if (String(source).includes('Lingua Libre')) return 0;
  if (String(source).includes('exact Thai description')) return 1;
  if (String(source).includes('direct Thai filename')) return 2;
  if (String(source).includes('Wiktionary')) return 3;
  return 9;
}

export function chooseBestCandidate(candidates) {
  return [...(candidates || [])]
    .filter(candidate => candidate?.target && candidate?.url && isAllowedAudioLicense(candidate.license))
    .sort((a, b) => {
      return licenseRank(a.license) - licenseRank(b.license)
        || sourceRank(a.source) - sourceRank(b.source)
        || Number(a.size || Number.MAX_SAFE_INTEGER) - Number(b.size || Number.MAX_SAFE_INTEGER)
        || String(a.title).localeCompare(String(b.title));
    })[0] || null;
}

export function buildAudioAssignments(entries, selectedByThai) {
  const output = {};
  for (const entry of entries || []) {
    const candidate = selectedByThai.get(entry.th);
    if (candidate?.localPath) output[entry.id] = candidate.localPath;
  }
  return output;
}

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

function normalizeTitle(title) {
  return String(title || '').replaceAll('_', ' ').normalize('NFC');
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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ThaiLifeSpeakAudioImporter/1.0 (GitHub: succuvivi/english-deep-talk-plan)' }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchCategoryTitles(category) {
  const titles = [];
  let cmcontinue = null;
  do {
    const url = new URL(COMMONS_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatversion', '2');
    url.searchParams.set('list', 'categorymembers');
    url.searchParams.set('cmtitle', category);
    url.searchParams.set('cmnamespace', '6');
    url.searchParams.set('cmlimit', '500');
    if (cmcontinue) url.searchParams.set('cmcontinue', cmcontinue);
    const data = await fetchJson(url);
    titles.push(...(data?.query?.categorymembers || []).map(item => item.title));
    cmcontinue = data?.continue?.cmcontinue || null;
  } while (cmcontinue);
  return titles;
}

async function fetchWiktionaryAudioMap() {
  const url = new URL(WIKTIONARY_API);
  url.searchParams.set('action', 'parse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('page', WIKTIONARY_AUDIO_MODULE);
  url.searchParams.set('prop', 'wikitext');
  const data = await fetchJson(url);
  return parseWiktionaryAudioMap(data?.parse?.wikitext || '');
}

function buildCandidateRefs({ linguaLibreTitles, pronunciationTitles, wiktionaryMap, wantedThai }) {
  const refs = [];
  for (const title of linguaLibreTitles) {
    const target = extractLinguaLibreTarget(title);
    if (target && wantedThai.has(target)) refs.push({ title, target, source: 'Wikimedia Commons / Lingua Libre' });
  }
  for (const title of pronunciationTitles) {
    const target = extractDirectThaiFilename(title);
    if (target && wantedThai.has(target)) refs.push({ title, target, source: 'Wikimedia Commons / direct Thai filename' });
  }
  for (const thai of wantedThai) {
    const title = wiktionaryMap.get(thai);
    if (title) refs.push({ title, target: thai, source: 'Thai Wiktionary pronunciation index / Wikimedia Commons' });
  }

  const unique = new Map();
  for (const ref of refs) unique.set(`${ref.target}\u0000${normalizeTitle(ref.title)}`, ref);
  return [...unique.values()];
}

async function fetchCandidateMetadata(refs, { discoveryTitles = [], wantedThai = new Set() } = {}) {
  const candidates = [];
  const byTitle = new Map();
  for (const ref of refs) {
    const key = normalizeTitle(ref.title);
    if (!byTitle.has(key)) byTitle.set(key, []);
    byTitle.get(key).push(ref);
  }
  const titles = [...new Set([...byTitle.keys(), ...discoveryTitles.map(normalizeTitle)])];
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const url = new URL(COMMONS_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('formatversion', '2');
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set('iiprop', 'url|size|mime|extmetadata');
    url.searchParams.set('titles', batch.join('|'));
    const data = await fetchJson(url);
    for (const page of data?.query?.pages || []) {
      const refsForPage = [
        ...(byTitle.get(normalizeTitle(page.title)) || []),
        ...descriptionTargetRefs(page, wantedThai)
      ];
      const seen = new Set();
      for (const ref of refsForPage) {
        const key = `${ref.target}\u0000${ref.source}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const candidate = normalizeCandidate(page, ref);
        if (candidate) candidates.push(candidate);
      }
    }
  }
  return candidates;
}

async function buildDatasetFileIndex(root) {
  const index = new Map();
  if (!root) return index;
  async function walk(dir) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) index.set(entry.name.normalize('NFC'), full);
    }
  }
  await walk(root);
  return index;
}

function safeExtension(url, mime) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (/^\.(wav|wave|ogg|oga|mp3|webm|flac)$/i.test(ext)) return ext === '.wave' ? '.wav' : ext;
  } catch {}
  if (mime === 'audio/ogg') return '.ogg';
  if (mime === 'audio/mpeg') return '.mp3';
  if (mime === 'audio/webm') return '.webm';
  if (mime === 'audio/flac') return '.flac';
  return '.wav';
}

function chooseCanonicalEntry(entriesForThai) {
  return [...entriesForThai].sort((a, b) => a.id.localeCompare(b.id))[0];
}

export function canonicalizeMediaUrl(value) {
  const url = new URL(value);
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_')) url.searchParams.delete(key);
  }
  return url.toString();
}

export function interDownloadDelayMs(processedRemoteDownloads, configuredDelayMs = 1200) {
  const delay = Number(configuredDelayMs);
  if (!Number.isFinite(delay) || delay <= 0 || processedRemoteDownloads <= 0) return 0;
  return delay;
}

export async function fetchWithRateLimitRetry(url, {
  fetchImpl = fetch,
  sleepFn = ms => new Promise(resolve => setTimeout(resolve, ms)),
  retryDelays = [2000, 5000, 10000, 20000],
  maxRetryAfterMs = 15000,
  headers = {}
} = {}) {
  const target = canonicalizeMediaUrl(url);
  let response;
  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    response = await fetchImpl(target, { headers });
    if (response.status !== 429) return response;
    if (attempt === retryDelays.length) return response;
    const retryAfterSeconds = Number(response.headers?.get?.('retry-after'));
    const requestedRetryMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : retryDelays[attempt];
    const cappedRetryMs = Number.isFinite(maxRetryAfterMs) && maxRetryAfterMs > 0
      ? Math.min(requestedRetryMs, maxRetryAfterMs)
      : requestedRetryMs;
    const waitMs = Math.max(retryDelays[attempt], cappedRetryMs);
    await sleepFn(waitMs);
  }
  return response;
}

async function downloadFile(url, destination) {
  const response = await fetchWithRateLimitRetry(url, {
    headers: {
      'User-Agent': 'ThaiLifeSpeakAudioImporter/1.0 (GitHub: succuvivi/english-deep-talk-plan)',
      'Accept': 'audio/*,*/*;q=0.8',
      'Referer': 'https://commons.wikimedia.org/'
    }
  });
  if (!response.ok) throw new Error(`Audio HTTP ${response.status}: ${canonicalizeMediaUrl(url)}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length) throw new Error(`Empty audio file: ${url}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, bytes);
  return bytes.length;
}

function audioMapModule(assignments) {
  const ordered = Object.fromEntries(Object.entries(assignments).sort(([a], [b]) => a.localeCompare(b)));
  return `export const AUDIO_BY_ENTRY_ID = ${JSON.stringify(ordered, null, 2)};\n\nexport function applyAudioMetadata(entries, audioMap = AUDIO_BY_ENTRY_ID) {\n  return entries.map(entry => {\n    const audio = audioMap[entry.id];\n    return audio ? { ...entry, audio } : { ...entry };\n  });\n}\n`;
}

export async function runImport({ repoRoot = process.cwd(), download = false } = {}) {
  const { ENTRIES } = await import(pathToFileURL(path.join(repoRoot, 'thai/data/index.js')).href);
  const entries = ENTRIES.map(({ id, th }) => ({ id, th }));
  const byThai = new Map();
  for (const entry of entries) {
    if (!byThai.has(entry.th)) byThai.set(entry.th, []);
    byThai.get(entry.th).push(entry);
  }

  const wantedThai = new Set(byThai.keys());
  const [linguaLibreTitles, pronunciationTitles, wiktionaryMap] = await Promise.all([
    fetchCategoryTitles(LINGUA_LIBRE_CATEGORY),
    fetchCategoryTitles(THAI_PRONUNCIATION_CATEGORY),
    fetchWiktionaryAudioMap()
  ]);
  const refs = buildCandidateRefs({ linguaLibreTitles, pronunciationTitles, wiktionaryMap, wantedThai });
  const candidates = await fetchCandidateMetadata(refs, {
    discoveryTitles: [...linguaLibreTitles, ...pronunciationTitles],
    wantedThai
  });

  const groupedCandidates = new Map();
  for (const candidate of candidates) {
    if (!groupedCandidates.has(candidate.target)) groupedCandidates.set(candidate.target, []);
    groupedCandidates.get(candidate.target).push(candidate);
  }

  const selectedByThai = new Map();
  for (const [thai, options] of groupedCandidates) {
    const candidate = chooseBestCandidate(options);
    if (!candidate) continue;
    const canonical = chooseCanonicalEntry(byThai.get(thai));
    const ext = safeExtension(candidate.url, candidate.mime);
    const relativePath = `./audio/words/${canonical.id}${ext}`;
    selectedByThai.set(thai, { ...candidate, canonicalEntryId: canonical.id, localPath: relativePath });
  }

  console.log(`Vocabulary entries: ${entries.length}`);
  console.log(`Unique Thai targets: ${wantedThai.size}`);
  console.log(`Candidate refs: ${refs.length}`);
  console.log(`Allowed candidate files: ${candidates.length}`);
  console.log(`Matched unique Thai targets: ${selectedByThai.size}`);

  if (!download) return { entries, selectedByThai, candidates, refs };

  await fs.rm(path.join(repoRoot, AUDIO_DIR), { recursive: true, force: true });
  await fs.mkdir(path.join(repoRoot, AUDIO_DIR), { recursive: true });

  const manifest = [];
  const successfulByThai = new Map();
  const datasetIndex = await buildDatasetFileIndex(process.env.LINGUA_LIBRE_DATASET_DIR || '');
  let archiveHits = 0;
  let remoteHits = 0;
  let remoteDownloadAttempts = 0;
  let skippedDownloads = 0;
  for (const [thai, candidate] of [...selectedByThai.entries()].sort(([a], [b]) => a.localeCompare(b, 'th'))) {
    const destination = path.join(repoRoot, 'thai', candidate.localPath.replace(/^\.\//, ''));
    try {
      const archiveName = linguaLibreArchiveBasename(candidate.title);
      const archiveSource = archiveName ? datasetIndex.get(archiveName.normalize('NFC')) : null;
      let bytes;
      if (archiveSource) {
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.copyFile(archiveSource, destination);
        bytes = (await fs.stat(destination)).size;
        archiveHits += 1;
      } else {
        const delayMs = interDownloadDelayMs(
          remoteDownloadAttempts,
          Number(process.env.WIKIMEDIA_DOWNLOAD_DELAY_MS || 1200)
        );
        if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
        remoteDownloadAttempts += 1;
        bytes = await downloadFile(candidate.url, destination);
        remoteHits += 1;
      }
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
      skippedDownloads += 1;
      console.warn(`Skipping ${thai} (${candidate.title}): ${error.message}`);
    }
  }

  manifest.sort((a, b) => a.entryId.localeCompare(b.entryId));
  const assignments = buildAudioAssignments(entries, successfulByThai);
  await fs.writeFile(path.join(repoRoot, MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(path.join(repoRoot, AUDIO_MAP_PATH), audioMapModule(assignments));

  const human = Object.keys(assignments).length;
  console.log(`Human word audio: ${human} / ${entries.length}`);
  console.log(`Unique human recordings: ${successfulByThai.size} / ${wantedThai.size}`);
  console.log(`Archive downloads: ${archiveHits}; direct media downloads: ${remoteHits}; skipped: ${skippedDownloads}`);
  console.log(`Device-TTS word fallback: ${entries.length - human} / ${entries.length}`);
  return { entries, selectedByThai: successfulByThai, manifest, assignments, candidates, refs };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const download = process.argv.includes('--download');
  runImport({ repoRoot: process.cwd(), download }).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

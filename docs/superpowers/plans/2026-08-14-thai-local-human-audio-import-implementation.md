# Thai Local Human Audio Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import exact Thai native-speaker word recordings with redistribution-safe licenses into the static GitHub Pages site, with attribution and device-TTS fallback for unmatched words.

**Architecture:** Discover candidates from Wikimedia Commons/Lingua Libre using exact Thai text, accept only explicit CC0/Public Domain/CC BY/CC BY-SA metadata, download media into `thai/audio/words/`, and maintain a machine-validated `thai/audio/sources.json`. Attach audio by stable entry ID through a small generated mapping layer so the 18 scene data files do not need hundreds of hand edits.

**Tech Stack:** Wikimedia Commons MediaWiki API, Node ES modules/tests, static audio files served by GitHub Pages, existing `Audio` + browser Thai TTS fallback.

## Global Constraints

- No API key or pronunciation API is required at runtime.
- Main target is the 360 vocabulary entries; phrases/examples may remain device TTS unless an exact open recording exists.
- Exact Thai spelling is the lookup key.
- Never use romanization or Chinese approximation as speech input.
- Accept only CC0, Public Domain, CC BY, or CC BY-SA audio with explicit source metadata.
- Do not import Forvo, Google Translate audio, commercial TTS output, or ambiguous-license dictionary audio.
- Every bundled audio file must have provenance in `thai/audio/sources.json`.
- Human audio is always preferred; device Thai TTS remains the fallback.

---

### Task 1: Add a generated human-audio mapping layer

**Files:**
- Create: `thai/data/audio-map.js`
- Modify: `thai/data/index.js`
- Modify: `thai/tests/data.test.js`

**Interfaces:**
- `AUDIO_BY_ENTRY_ID: Record<string, string>` maps stable entry IDs to local URLs.
- `applyAudioMetadata(entries, audioMap = AUDIO_BY_ENTRY_ID)` returns copied entries with `audio` set only when a mapping exists.

- [ ] **Step 1: Write failing tests**

Test one mapped entry, one unmapped entry, and immutability.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd thai && node --test tests/data.test.js
```

- [ ] **Step 3: Add minimal map/apply helper**

Start with an empty generated map and an exported helper; integration test should then pass with a small fixture map.

- [ ] **Step 4: Apply audio metadata after series metadata in `data/index.js`**

Pipeline becomes raw entries -> series metadata -> audio metadata.

- [ ] **Step 5: Run full tests**

```bash
cd thai && npm test
```

---

### Task 2: Add license/provenance manifest validation

**Files:**
- Create: `thai/audio/sources.json`
- Create: `thai/tests/audio-sources.test.js`

**Interfaces:**
- Manifest rows: `{entryId, thai, localPath, source, sourceUrl, creator, license, licenseUrl}`.

- [ ] **Step 1: Write failing manifest tests**

Assert every row:
- resolves to exactly one `ENTRIES` item;
- `thai === entry.th`;
- uses an accepted license prefix/value;
- has non-empty source/sourceUrl;
- has creator when license requires attribution;
- has unique `entryId` and `localPath`.

- [ ] **Step 2: Add empty valid manifest**

`[]` is valid before imports; fixture-based tests verify invalid rows fail.

- [ ] **Step 3: Add filesystem existence test for populated manifest rows**

Resolve `localPath` relative to `thai/` and assert it exists.

---

### Task 3: Discover and import exact Commons/Lingua Libre recordings

**Files:**
- Create: `tools/import_thai_audio.mjs`
- Modify: `thai/audio/sources.json`
- Modify: `thai/data/audio-map.js`
- Create: binary files under `thai/audio/words/`

**Interfaces:**
- Input: current `ENTRIES` or a generated `{id, th}` list.
- Candidate discovery: Wikimedia Commons API search by exact Thai spelling, followed by `imageinfo`/`extmetadata` lookup.
- Accepted candidates must have an audio MIME type and allowed license.

- [ ] **Step 1: Implement exact-text candidate ranking**

Ranking rules:
1. title/description explicitly contains the exact Thai target;
2. category/source indicates Thai pronunciation or Lingua Libre;
3. audio MIME type;
4. accepted open license;
5. isolated pronunciation preferred over sentence/phrase audio.

- [ ] **Step 2: Dry-run candidate report before download**

Output `matched`, `ambiguous`, `missing` counts and candidate source URLs. Ambiguous candidates are not auto-imported.

- [ ] **Step 3: Download only accepted candidates**

Use stable filenames `<entry-id>.<ext>` and record source metadata immediately after each successful download.

- [ ] **Step 4: Generate `audio-map.js` from manifest**

Every manifest entry becomes:

```js
'entry-id': './audio/words/entry-id.ogg'
```

- [ ] **Step 5: Run manifest and full data tests**

```bash
cd thai && npm test
```

- [ ] **Step 6: Produce coverage report**

Report exact counts:

```text
Human word audio: X / 360
Device-TTS word fallback: 360-X / 360
Ambiguous candidates skipped: Y
```

No artificial minimum coverage target.

---

### Task 4: Make playback/source UI distinguish human recordings from fallback TTS

**Files:**
- Modify: `thai/js/audio.js`
- Modify: `thai/js/learn.js`
- Modify: `thai/tests/audio.test.js`
- Modify: `thai/styles.css`

**Interfaces:**
- `audioEngine.play(item, speed)` returns `{mode: 'audio'|'tts'}`.
- Local audio sets `playbackRate = 1` normal / `0.8` slow.

- [ ] **Step 1: Add failing playback-rate tests for local audio**

Assert slow local audio uses `0.8` and normal uses `1.0`.

- [ ] **Step 2: Implement playback rate on `Audio` before `play()`**

Do not alter the file URL for slow mode.

- [ ] **Step 3: Update card copy**

Main entries with `entry.audio` render `🔊 听真人泰语` plus quiet `真人录音`; entries without local audio render `🔊 听泰语` plus `设备语音`.

Phrase/example audio source labels follow their own `item.audio` availability.

- [ ] **Step 4: Preserve fallback behavior**

If local audio fails to play, call native-script Thai TTS and show `真人录音播放失败，正在使用设备泰语语音`.

- [ ] **Step 5: Run audio and DOM regression tests**

```bash
cd thai && npm test
```

---

### Task 5: Add human-audio attribution page

**Files:**
- Create: `thai/audio-sources.html`
- Create: `thai/js/audio-sources.js`
- Modify: `thai/index.html`
- Modify: `thai/learn.html`
- Modify: `thai/styles.css`

**Interfaces:**
- `audio-sources.js` fetches `./audio/sources.json` and renders source/creator/license rows.

- [ ] **Step 1: Add `音频来源` link to both Thai pages**

- [ ] **Step 2: Render manifest safely with escaped text and external source/license links**

- [ ] **Step 3: Show coverage summary on the attribution page**

Example: `真人单词录音 143 / 360`.

- [ ] **Step 4: Static asset smoke-test all links and JSON**

---

### Task 6: Final verification before publishing

**Files:** all changed Thai site/audio files.

- [ ] **Step 1: Run complete tests**

```bash
cd thai && npm test
find js data tests -name '*.js' -print0 | xargs -0 -n1 node --check
```

- [ ] **Step 2: Validate every manifest file path and binary file size > 0**

- [ ] **Step 3: Validate no forbidden credential/API references**

Search public Thai assets for `API_KEY`, `aiforthai`, provider bearer tokens, and proxy endpoint placeholders; expected none.

- [ ] **Step 4: Browser QA**

Verify representative human-audio cards play local files at normal/slow speed, missing cards fall back to Thai TTS, and source labels are accurate.

- [ ] **Step 5: Do not merge to `main` until QA is green**

Keep changes on `feat/thai-native-swipe-official-audio` until the user has a preview or explicitly authorizes publishing.

---

## Self-review

- Covers local human audio, provenance, license allow-list, runtime independence from APIs, TTS fallback, slow playback, attribution, and coverage reporting.
- No unlicensed bulk scraping path exists.
- Audio mapping is isolated from scene content to prevent hundreds of fragile hand edits.
- Runtime remains fully static on GitHub Pages.

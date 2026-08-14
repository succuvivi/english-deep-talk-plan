# Thai Native Swipe + Local Human Pronunciation Design

Date: 2026-08-14
Status: approved conversational design, pending written-spec review

## Goal

Improve the Thai daily-life learning site in two ways:

1. Replace button-driven series navigation with a true touch-first horizontal card track: the full word card is already visible before any gesture, and the learner drags the card itself left/right to reveal neighboring words.
2. Replace browser TTS as the normal word-pronunciation source with locally hosted Thai native-speaker recordings downloaded only from sources whose licenses explicitly allow redistribution.

The change must preserve the existing 18 scenes, 360 entries, semantic-family taxonomy, search, favorites, Thai show/hide, collocations, examples, and mobile-first layout.

---

## Part A — Native direct card swiping

### User experience

The learner should not need to tap `‹` or `›` to move between related words.

A semantic family appears as a horizontal track containing all of its complete word cards. On initial render, the first/current card is 100% visible. The learner can immediately read the entire card before touching it.

Example:

```text
肉类食材                         2 / 4

┌──────────────────────────────┐
│ 鸡                           │
│ ไก่                          │
│ kài                          │
│ 中文近似音 ...               │
│ 🔊 听真人泰语                │
│ 常用搭配 ▾                   │
│ 例句 ▾                       │
└──────────────────────────────┘

      ← directly drag this card →
```

While dragging, the neighboring full card physically follows the gesture, similar to a mobile photo carousel. The active card changes because the scroll position snaps to the nearest card, not because JavaScript removes one card and replaces it after the gesture.

### Interaction requirements

- Remove the visible previous/next arrow buttons from semantic-series UI.
- Keep a small non-interactive progress label such as `2 / 4`.
- The full card is visible before swiping.
- The user drags directly on the card surface.
- Swiping works from normal non-control card areas.
- Buttons, `<summary>`, links, and other controls remain tappable without accidentally initiating navigation.
- Vertical page scrolling remains natural.
- Horizontal snapping uses native browser scrolling, not a third-party carousel library.
- Do not auto-advance.
- Do not loop from the last card to the first.
- Do not show multiple full cards side-by-side on a normal phone viewport.
- No visible navigation arrows are retained as a fallback.

### Rendering architecture

The grouping pipeline remains unchanged:

1. Filter entries by scene/search/favorites.
2. Group the filtered entries by `seriesId`.
3. A series with at least 2 visible members renders as one horizontal track.
4. A series with only 1 visible member renders as a normal standalone card.

Instead of rendering only the active member, `seriesHtml(group)` renders every visible member in the group:

```text
series-shell
  series-heading
    series-label
    series-progress
  series-track (horizontal overflow + scroll snap)
    series-slide -> full entryHtml(entry)
    series-slide -> full entryHtml(entry)
    series-slide -> full entryHtml(entry)
```

Every slide reuses the existing `entryHtml()` vocabulary renderer so all content and controls remain identical between standalone and grouped vocabulary.

### Scroll behavior

Recommended CSS mechanics:

- `display: flex`
- `overflow-x: auto`
- `scroll-snap-type: x mandatory`
- one slide = `flex: 0 0 100%`
- slide = `scroll-snap-align: start`
- hide decorative scrollbar where supported, while keeping native scrolling
- `overscroll-behavior-x: contain`
- do not use `touch-action: pan-y` on the full track because native horizontal scrolling itself must remain available

JavaScript observes the settled track position and updates progress (`current / total`). Prefer `scrollend` when available and a small debounced `scroll` fallback otherwise.

### Expanded content behavior

- Collocations/examples can be expanded before or after swiping.
- Swiping away does not destroy the card DOM.
- Expanded state remains open if the learner swipes away and back during the same render.
- Favorites and audio controls remain clickable inside every slide.

### Audio during swipe

When meaningful horizontal navigation begins, stop currently playing audio so the learner never hears a previous card after moving away from it.

Do not stop audio on tiny accidental horizontal movement.

### Progress calculation

Progress is derived from actual scroll position rather than separate active-index state:

```text
index = round(scrollLeft / slideWidth)
progress = `${index + 1} / ${slideCount}`
```

Clamp to `[0, slideCount - 1]` and tolerate small fractional layout differences.

---

## Part B — Locally hosted human Thai pronunciation

### Core decision

There is **no API key, no NECTEC proxy, and no server-side speech service** in this design.

For the 360 main vocabulary entries, the preferred audio is a downloaded Thai native-speaker pronunciation file stored inside the repository and served directly by GitHub Pages.

The primary source pool is:

- Wikimedia Commons Thai pronunciation files
- Lingua Libre Thai pronunciation recordings hosted on Wikimedia Commons
- additional sources only when the exact file page clearly permits redistribution under an accepted open license

The implementation must not bulk-download or rehost audio from sources that prohibit systematic extraction or redistribution.

### Accepted licenses

To keep the public GitHub repository legally simple, import only files whose source page clearly identifies one of these licenses:

- CC0
- Public Domain
- CC BY
- CC BY-SA

Do not import files marked non-commercial, no-derivatives, unknown, custom-restricted, or otherwise ambiguous.

For CC BY / CC BY-SA files, retain required attribution and license information in the repository manifest and user-facing attribution page.

### Scope of human recordings

Phase 1 targets the **360 main vocabulary words**.

For each entry:

1. Search by the exact Thai spelling (`entry.th`).
2. Prefer an exact isolated-word pronunciation recorded by a Thai speaker.
3. Prefer clean recordings with little background noise and no extra commentary.
4. If several valid recordings exist, prefer the clearest neutral/standard pronunciation.
5. Download the selected file into the repository.
6. Attach the local file path to that vocabulary entry.

Do not synthesize a word from romanization and do not use English phonetic text as the audio source.

### Phrases and examples

Human recordings are required first for the 360 main vocabulary words only.

For collocations and example sentences:

- if an exact openly licensed human recording is found, it may be imported and used;
- otherwise continue to use device Thai TTS as a fallback;
- the UI must identify this fallback as `设备泰语语音` rather than implying it is a human recording.

This keeps the project practical: the highest-value single-word pronunciation becomes native-speaker audio without requiring thousands of sentence recordings.

### Source priority

Playback order:

1. Verified local human recording (`item.audio`) bundled in the repository.
2. Device Thai TTS fallback using native Thai script only.

No web API or remote pronunciation service is called at playback time.

### File layout

Recommended repository layout:

```text
thai/
  audio/
    words/
      restaurant-spicy.ogg
      restaurant-chicken.ogg
      coffee-coffee.ogg
      ...
    phrases/
      ... optional exact phrase recordings ...
    sources.json
```

Use stable entry IDs for local filenames instead of Thai filenames to avoid URL/path portability problems.

If the source audio format is not reliably playable across the target browsers, create a browser-compatible derivative while preserving the original source URL, creator, and license in the manifest. Do not discard the attribution metadata after conversion.

### Audio source manifest

Every downloaded recording must have a manifest record similar to:

```json
{
  "entryId": "restaurant-chicken",
  "thai": "ไก่",
  "localPath": "audio/words/restaurant-chicken.ogg",
  "source": "Wikimedia Commons",
  "sourceUrl": "...",
  "creator": "...",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "..."
}
```

Requirements:

- `entryId` resolves to exactly one vocabulary entry.
- `thai` must exactly match that entry's Thai text.
- every local audio file must have one manifest row.
- every manifest row must point to an existing local audio file.
- license metadata must not be blank.
- no unverified source is added manually without a corresponding source page.

### User-facing attribution

Add a small `音频来源` link on the Thai site. It opens a simple attribution page listing recording source, creator, and license for imported human recordings.

Do not clutter every vocabulary card with full license text.

Recommended card-level source indicator:

```text
🔊 听真人泰语
真人录音
```

Fallback phrase/example indicator when applicable:

```text
🔊 听泰语
设备语音
```

### Normal and slow playback

Human recordings use the same local file for both modes:

- normal: `playbackRate = 1.0`
- slow: approximately `0.80`

Do not create artificial separate slow recordings.

For device-TTS fallback, keep native Thai `item.th` as the only text sent to `SpeechSynthesisUtterance`.

### Download / ingestion workflow

The implementation should provide a repeatable import workflow rather than scattered manual downloads.

For each candidate recording:

1. Search the exact Thai spelling on Wikimedia Commons / Lingua Libre.
2. Open the individual file page.
3. Verify exact spoken target and accepted license.
4. Record source URL, creator, and license.
5. Download the actual media file.
6. Normalize filename to the vocabulary entry ID.
7. Convert format only when required for browser compatibility.
8. Update `sources.json`.
9. Update the vocabulary entry `audio` field.
10. Run audio-integrity tests.

A script may automate downloading and manifest validation, but license acceptance must be based on explicit source metadata, not guessed from the domain alone.

### Missing recording behavior

A main vocabulary word with no valid human recording remains usable:

- its audio button falls back to device Thai TTS;
- it is not labeled `真人录音`;
- it is recorded in a coverage report so future imports can replace the fallback.

The site must never pretend that 360/360 human coverage exists unless the manifest proves it.

### Coverage reporting

Generate a simple summary during tests/build:

```text
Human word audio: 214 / 360
Device-TTS word fallback: 146 / 360
```

The exact count is discovered during implementation; there is no pre-set minimum that permits fake or lower-quality matches.

### Prohibited audio sources / behavior

Do not:

- bulk-scrape Forvo or other pronunciation databases whose terms prohibit systematic reuse;
- download Google Translate / commercial TTS output and rehost it as if it were an open recording;
- copy dictionary audio without an explicit redistribution license;
- use romanization or Chinese approximation to generate pronunciation;
- hide creator/license attribution where the source license requires it;
- label device TTS as human audio.

---

## Data model

The current vocabulary shape already supports an optional `audio` URL.

Human pronunciation uses that field directly:

```js
{
  id: 'restaurant-chicken',
  zh: '鸡',
  th: 'ไก่',
  audio: './audio/words/restaurant-chicken.ogg'
}
```

No audio file means the audio engine uses the existing Thai TTS fallback.

A separate `sources.json` holds licensing/provenance metadata and is not mixed into every vocabulary object.

---

## Accessibility

- Audio controls remain real `<button>` elements.
- Series progress exposes readable text such as `第 2 个，共 4 个`.
- Each horizontal track has an accessible label such as `肉类食材，同系列词，可左右滑动`.
- Vertical scrolling must not be hijacked.
- Respect `prefers-reduced-motion` and do not add decorative movement.
- A learner who never swipes can still read and use the complete first card.

---

## Testing strategy

### Native swipe tests

Verify:

- no previous/next series buttons exist;
- every series track renders all currently visible member cards in correct order;
- each slide is full-width;
- the initial card is completely visible;
- horizontal scrolling updates progress correctly;
- search with one surviving member renders a standalone card;
- favorites with multiple family members render a reduced swipe track;
- favorite/audio/details controls inside slides remain clickable;
- expanded `<details>` state survives swiping away/back;
- meaningful movement stops active audio;
- phone and desktop layouts have no body-level horizontal overflow.

### Audio manifest tests

Verify:

- every manifest `entryId` resolves exactly once;
- manifest `thai` exactly equals the vocabulary entry's `th`;
- every manifest local path exists;
- every imported local audio file has manifest metadata;
- every imported license is in the accepted allow-list;
- attribution/creator fields are populated where required;
- no duplicate local path is accidentally assigned to different Thai words unless explicitly justified as the same exact recording target.

### Audio playback tests

Verify:

- local human audio is used before TTS;
- the local file URL corresponds to the active card's entry ID;
- slow mode changes `Audio.playbackRate` rather than pronunciation text;
- failed/missing local audio falls back to native-script Thai TTS;
- fallback TTS receives `item.th`, never `roman` or `zhPron`;
- UI source label changes correctly between human recording and device voice.

### Content integrity regression

Re-run all existing 18-scene / 360-entry / 115-series tests plus:

- no malformed Unicode;
- no Thai/Chinese/romanization field misalignment;
- no duplicate series membership;
- all audio buttons resolve to the correct Thai target.

---

## Acceptance criteria

The redesign is complete when:

1. Series navigation has no visible previous/next arrow buttons.
2. The active word card is already fully visible before any swipe.
3. The learner directly drags the full word-card track left/right.
4. Neighboring complete cards follow the gesture and snap natively.
5. Progress updates from actual scroll position.
6. Existing controls remain usable inside the horizontal track.
7. The project contains locally hosted Thai native-speaker recordings for every main word for which a valid open-license exact recording was found.
8. Every imported recording has source, creator, and license provenance in `sources.json`.
9. No API key or pronunciation API is required at runtime.
10. Human recordings play before any device TTS fallback.
11. Romanization and Chinese approximation are never used as speech input.
12. Missing human recordings are clearly treated as device-voice fallback rather than mislabeled as human.
13. Normal/slow modes work for local audio.
14. Existing 18 scenes, 360 entries, taxonomy, search, favorites, Thai visibility, collocations, and examples still pass regression QA.
15. GitHub Pages can serve all bundled audio files without external runtime dependencies.

---

## Explicitly out of scope

- NECTEC / AI for Thai API integration
- API keys or serverless pronunciation proxies
- recording a new private human Thai corpus
- scraping restricted pronunciation databases
- guaranteeing 360/360 human recording coverage by using weak or incorrect matches
- infinite-loop carousels
- autoplay pronunciation on swipe
- sending romanization to any speech engine

---

## Decisions confirmed with user

- Visible series arrow buttons should be removed.
- The full word card must be readable before the learner swipes.
- Horizontal interaction happens directly on the word-card area.
- Downloaded human Thai pronunciation is preferred over browser TTS.
- Government-official audio is not required.
- Exact standard/native pronunciation is sufficient.
- No API key should be required.
- Openly licensed recordings may be downloaded and bundled into the GitHub Pages site.
- Device Thai TTS may remain only as fallback when no suitable human recording is available.

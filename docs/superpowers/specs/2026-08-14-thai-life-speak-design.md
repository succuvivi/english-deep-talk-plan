# Thai Daily-Life Speaking Site — Design Spec

Date: 2026-08-14
Status: approved design, pending implementation plan

## Goal

Build a mobile-first Thai learning webpage for a Chinese-speaking learner living in Thailand whose priority is basic daily spoken communication, not learning to read Thai script.

The product is a scene-based vocabulary reference and practice tool. The core learning unit is a useful word, supported by common collocations and real-life example sentences. Every word, collocation, and example sentence must be independently playable with Thai audio.

## Product principles

1. Spoken usefulness over academic completeness.
2. Scene-first navigation, vocabulary-first learning.
3. Thai script is available but visually secondary and can be hidden.
4. Romanization and Chinese meaning are primary reading aids.
5. Chinese approximate pronunciation is a secondary aid for getting started quickly.
6. Female polite speech is the default in example sentences and phrase patterns.
7. No account, server, database, streaks, points, or curriculum progression in v1.
8. Keep the site lightweight enough for GitHub Pages and convenient phone use.

## Information architecture

The home page is a scene directory with Chinese search.

Planned v1 scenes (about 18):

### Food and drink
- Restaurant / street food
- Coffee / tea shops
- Convenience store / supermarket
- Market / fruit stalls

### Transport
- Taxi / Bolt / Grab
- Motorbike / parking
- Asking directions / finding places
- Petrol station

### Home and daily life
- Delivery / takeaway
- Condo / property management / renting
- Repairs / plumbing / electricity / air-conditioning
- Laundry
- Massage / beauty

### Services and errands
- Hospital / pharmacy
- Bank / payments
- Mobile phone / internet / phone calls

### People and social life
- Daily greetings and small talk
- Friends / casual social conversation

V1 target: 15–20 scenes, typically 20–40 core entries per scene.

## Vocabulary entry model

Each vocabulary entry contains:

- `id`: stable identifier
- `scene`: one or more scene tags
- `zh`: concise Chinese meaning
- `th`: Thai spelling
- `roman`: learner-friendly romanization
- `zhPron`: Chinese approximate pronunciation aid
- `type`: word / verb / adjective / expression / other lightweight usage tag
- `audio`: optional future pre-recorded audio path; null by default
- `collocations`: 2–5 useful combinations
- `examples`: 2–4 realistic sentences

Each collocation and example contains at minimum:

- Thai text
- romanization
- Chinese meaning
- optional Chinese approximate pronunciation where useful
- optional pre-recorded audio path for future replacement

Content should prioritize high-frequency expressions that a resident in Thailand can immediately use rather than exhaustive dictionary coverage.

## Example interaction

Entry:

- Chinese: 辣
- Thai: เผ็ด
- Romanization: phèt
- Chinese pronunciation aid: 配特

Actions:

- Play word
- Expand common collocations
- Expand example sentences
- Favorite

Example collocations:

- เผ็ดมาก — phèt mâak — 很辣 — playable
- ไม่เผ็ด — mâi phèt — 不辣 — playable
- เผ็ดนิดหน่อย — phèt nít nòi — 一点点辣 — playable

Example sentences use female polite endings by default, e.g.:

- ไม่เอาเผ็ดค่ะ — mâi ao phèt kha — 不要辣。 — playable
- อันนี้เผ็ดไหมคะ — an-níi phèt mái kha — 这个辣吗？ — playable

## Interface design

### Home

- Header: 泰语生活词库
- Chinese search box
- Scene cards with simple emoji/icons and Chinese labels
- Favorites entry point
- Global Thai-script show/hide control
- Global normal/slow speech preference

### Scene page

- Scene title and short context note
- Search/filter within the scene
- Scrollable vocabulary cards
- Cards prioritize Chinese meaning and romanization visually
- Thai script is smaller/secondary
- Collocations and examples are collapsed by default to keep scanning fast

### Vocabulary card

Visible by default:

1. Chinese meaning
2. Thai script
3. Romanization
4. Chinese pronunciation aid
5. Play button
6. Favorite button
7. Expand collocations
8. Expand examples

Expanded collocations/examples each have their own play control.

## Audio design

V1 uses browser speech synthesis (`speechSynthesis`) with Thai language preference (`th-TH`).

Requirements:

- Independent playback for word, collocation, and sentence.
- Normal and slow modes.
- Prefer a Thai voice when multiple voices exist.
- Stop currently playing speech before starting a new item to avoid overlap.
- If the device/browser exposes no usable Thai voice, show a clear user-facing message rather than silently failing.
- Keep an optional `audio` URL on every playable item so selected recordings can replace TTS later without redesigning content or UI.
- When `audio` exists, pre-recorded audio takes priority; otherwise fall back to TTS.

## Local persistence

Use `localStorage` only.

Persist:

- favorite entry IDs
- Thai-script visibility
- speech speed preference

No login or cloud sync in v1.

## Search

V1 search is optimized for Chinese queries.

Search fields:

- Chinese meaning
- Chinese translations of collocations/examples where useful
- scene labels / keywords

Thai and romanization search may also work opportunistically, but Chinese search is the acceptance requirement.

## Technical architecture

Static site, no framework required.

Proposed files:

- `thai/index.html` — home / scenes / search shell
- `thai/learn.html` — scene vocabulary view
- `thai/styles.css` — mobile-first styles
- `thai/data.js` — content dataset
- `thai/app.js` — navigation, filtering, favorites, UI state, TTS/audio playback
- `thai/README.md` — usage/content maintenance notes

Deployment target: existing GitHub Pages repository, under `/thai/`, so the current English site can remain untouched. A separate repository can be used later if desired without changing the application architecture.

## Error handling

- Missing TTS voice: visible concise warning.
- Speech synthesis error: stop/reset button state and allow retry.
- Missing optional audio file: fall back to TTS.
- Corrupt/missing localStorage values: ignore and restore defaults.
- Empty search: show all scene content.
- No search results: show a clear Chinese empty state and a way to clear search.

## Accessibility and mobile behavior

- Design primarily for phone screens.
- Touch targets at least comfortably tappable.
- Do not rely only on color for state.
- Buttons have readable text/accessible labels.
- Main information remains usable with Thai script hidden.
- Avoid hover-only interactions.

## Testing strategy

### Data/content checks

- Every entry has Chinese, Thai, romanization, and scene.
- Every playable collocation/example has Thai text.
- Every entry has at least 2 collocations and 2 examples unless explicitly justified.
- Female polite wording is used consistently where politeness is appropriate.

### Functional checks

- Scene navigation works.
- Chinese search returns expected words.
- Favorites survive refresh.
- Thai-script visibility survives refresh.
- Normal/slow speech setting survives refresh.
- Word, collocation, and sentence playback each work independently.
- Existing playback is cancelled when a new playback starts.
- No-Thai-voice fallback message works.

### Responsive checks

Test at representative widths around:

- 360 px phone
- 390–430 px phone
- tablet
- desktop

## V1 acceptance criteria

The first usable release is complete when:

1. About 18 daily-life scenes are available.
2. Each scene contains roughly 20–40 high-value vocabulary entries, subject to natural scene size.
3. Entries include common collocations and realistic examples.
4. Word, collocation, and example audio can each be played independently.
5. Normal and slow speech modes work.
6. Chinese search works across the vocabulary set.
7. Favorites work and persist locally.
8. Thai script can be shown/hidden and the setting persists.
9. The interface is comfortable on mobile.
10. The site can be served as static files on GitHub Pages.
11. Existing English pages are not modified or broken by the Thai site.

## Explicitly out of scope for v1

- Thai alphabet lessons
- reading/writing curriculum
- spaced repetition algorithm
- quizzes or exams
- daily lessons / streaks / points
- accounts / authentication
- backend database
- cloud sync
- voice recording / pronunciation scoring
- automatic translation or AI chat

## Future-compatible extensions

The architecture should make these possible without being required now:

- curated human/pre-generated audio for selected items
- more scenes
- male/female speech switch
- personal notes
- lightweight review mode
- installable PWA/offline cache

## Design decisions confirmed with user

- Navigation: scene-based (not daily lesson based)
- Learning unit: vocabulary-first
- Support: collocations + examples
- Audio: all three levels playable
- Display: Thai + romanization + Chinese pronunciation aid
- Default politeness/gender: female speech
- Scope: broad first release, approximately 15–20 scenes
- Audio implementation: browser Thai TTS first, with pre-recorded audio replacement path reserved

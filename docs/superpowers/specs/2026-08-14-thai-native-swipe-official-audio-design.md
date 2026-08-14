# Thai Native Swipe + Official Thai Audio Design

Date: 2026-08-14
Status: approved conversational design, pending written-spec review

## Goal

Improve the Thai daily-life learning site in two ways:

1. Replace button-driven series navigation with a true touch-first horizontal card track: the full word card is already visible before any gesture, and the learner drags the card itself left/right to reveal neighboring words.
2. Make NECTEC / AI for Thai official Thai Text-to-Speech the primary pronunciation source, with browser TTS retained only as a clearly labeled fallback.

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
│ 🔊 官方泰语发音              │
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
- The next card may have a very subtle edge/peek only if it does not reduce the active card's readable width; default is no peek.
- Keyboard users can tab through controls inside cards. No arrow-button replacement is required in v1; native horizontal scrolling remains available, and optional keyboard Left/Right support may be added only when the series container itself is focused.

### Rendering architecture

The grouping pipeline remains unchanged:

1. Filter entries by scene/search/favorites.
2. Group the filtered entries by `seriesId`.
3. A series with at least 2 visible members renders as one horizontal track.
4. A series with only 1 visible member renders as a normal standalone card.

Instead of rendering only the active member, `seriesHtml(group)` renders **every visible member** in the group:

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
- hide decorative scrollbar where supported, but keep the track natively scrollable
- `overscroll-behavior-x: contain`
- do not use `touch-action: pan-y` on the full track because native horizontal scrolling itself must remain available

JavaScript observes the track's settled position and updates progress (`current / total`). Prefer `scrollend` when available and a small debounced `scroll` fallback for browsers without `scrollend`.

### Expanded content behavior

A card remains fully interactive while it is the active slide.

- Collocations/examples can be expanded before or after swiping.
- Swiping away does not destroy the card DOM.
- Expanded state may remain open when the learner swipes back during the same page session.
- This is intentionally different from the previous implementation, which rebuilt the card and collapsed details on every move.

### Audio during swipe

When a series starts moving away from the current slide, stop any currently playing audio so the learner never hears audio from an off-screen card.

The implementation should avoid cancelling audio on tiny accidental horizontal movement. Stop audio only when a meaningful series scroll/navigation begins.

### Progress calculation

The progress text is derived from the track's actual scroll position, not a separate active-index state that can drift out of sync.

At a settled position:

```text
index = round(scrollLeft / slideWidth)
progress = `${index + 1} / ${slideCount}`
```

Clamp to `[0, slideCount - 1]` and account for small fractional browser layout differences.

---

## Part B — Official Thai pronunciation

### Primary provider

Primary pronunciation source: **NECTEC / AI for Thai official Thai Text-to-Speech**.

Research basis verified on 2026-08-14:

- NECTEC identifies VAJA as its Thai speech-synthesis / Thai TTS technology and states it has been researched and developed continuously since 1997.
- AI for Thai currently lists Text to Speech in its Conversation services and identifies `Vaja9` on the Text-to-Speech service page.
- AI for Thai currently lists Text to Speech as a Premium Conversation service.
- The AI for Thai developer trial flow requires registration and an API Key; the public site currently states a test allowance of about 10 calls/day.

Because GitHub Pages is a public static site, **the AI for Thai API key must never be embedded in repository JavaScript, HTML, query parameters, or client-side localStorage**.

### Audio request architecture

Use a small server-side/serverless audio proxy:

```text
GitHub Pages
   |
   | POST { text: "เผ็ด" }
   v
Official-audio proxy
   |
   | authenticated provider request
   | (API key stored as server secret)
   v
NECTEC / AI for Thai TTS
   |
   v
Thai audio bytes
```

The browser sends only native Thai text. Romanization and Chinese approximation are never sent to the speech provider.

### Provider adapter boundary

The website should not hard-code provider-specific request fields throughout the UI. Keep the client interface simple:

```js
officialAudioEngine.play({ th: 'เผ็ด' }, { speed: 'normal' })
```

The proxy/provider adapter owns:

- API endpoint
- API key/header format
- voice/model selection
- provider request body
- returned audio format conversion if needed
- quota/rate-limit handling
- caching

This lets Vaja9/provider details evolve without touching every vocabulary card.

### Cache strategy

Official TTS calls should be cached because the site contains many repeated Thai strings across entries, collocations, and examples.

Cache key:

```text
sha256(normalized Thai text + provider voice/model version)
```

Do **not** include playback speed in the provider cache key. Generate/copy one normal official pronunciation and use client audio `playbackRate` for the slow mode, so slow playback does not consume a second provider request.

Recommended cache behavior:

1. Client asks proxy for Thai text.
2. Proxy checks cache by normalized Thai text.
3. Cache hit: return stored official audio immediately.
4. Cache miss: request NECTEC/AI for Thai, store result, return it.
5. Subsequent plays reuse the official cached audio.

The proxy may use its platform cache/KV/object storage, but the exact hosting vendor is an implementation choice. No vendor-specific client dependency is allowed.

### Normalization

Before hashing/sending text:

- trim leading/trailing whitespace
- collapse accidental repeated spaces
- preserve Thai spelling, punctuation, and polite particles
- do not transliterate
- do not strip tone-bearing Thai characters
- do not rewrite content into English phonetics

### Playback modes

Normal mode:
- use official audio at `playbackRate = 1.0`

Slow mode:
- use the same official audio file at a conservative rate around `0.80`
- do not request a separately synthesized slow file unless the official provider later exposes a documented native speed parameter and testing proves it sounds better

### Fallback hierarchy

Playback order:

1. Pre-existing item-specific recorded audio URL, if present and explicitly marked as verified Thai audio.
2. Official NECTEC / AI for Thai audio through the proxy.
3. Browser Thai TTS fallback only if the official service is unavailable.

The UI must make the source visible when fallback occurs:

- official: no warning needed; optional small label `NECTEC 泰语发音`
- browser fallback: show a brief toast such as `官方发音暂时不可用，正在使用设备泰语语音`.

Never label browser TTS as official audio.

### Error handling

Client-visible behavior:

- proxy/network error -> try browser Thai TTS fallback
- provider quota/rate limit -> try cached result first; otherwise fallback and show the source notice
- malformed/no Thai text -> do not send provider request; report playback failure
- unsupported audio response -> fallback
- repeated taps -> cancel/pause previous playback before starting the new request/playback

Proxy behavior:

- reject missing/empty text
- cap text length to a safe maximum suitable for current word/short-example use
- allow CORS only from the production GitHub Pages origin and development origins used for testing
- never echo API credentials in errors
- apply rate limiting to prevent public abuse
- cache successful provider responses

### Secret handling

The official provider credential is stored only in server-side secret storage.

Never commit:

- AI for Thai API key
- provider bearer tokens
- `.env` containing secrets
- generated debug responses that include credentials

The public GitHub repository may include `.env.example` with variable names but no values.

### Production dependency / release gate

Official pronunciation cannot be considered production-complete until all of these are true:

1. A valid AI for Thai/NECTEC credential with sufficient Text-to-Speech entitlement is configured server-side.
2. The proxy health check passes.
3. A live request for representative Thai words and sentences returns playable audio.
4. GitHub Pages calls the proxy without exposing the provider key.
5. Browser fallback is verified but is not the normal path.

The public site must not be merged with copy claiming `官方发音` if the proxy/provider credential is not actually operational.

---

## UI copy changes

Current primary button:

```text
🔊 听单词
```

Recommended official-audio version:

```text
🔊 听泰语
```

Optional quiet metadata below or beside the control:

```text
NECTEC 泰语发音
```

Do not put `英文音译` or romanization inside the audio control. Romanization remains visual study support only.

---

## Accessibility

- Audio controls stay real `<button>` elements.
- Series progress uses readable text, e.g. `第 2 个，共 4 个` for assistive technology.
- The track receives an accessible label such as `肉类食材，同系列词，可左右滑动`.
- Avoid hijacking vertical touch scrolling.
- Respect `prefers-reduced-motion`: native snapping remains functional, but do not add decorative transition animations.
- A user who never performs a horizontal gesture can still read the first complete card and use all controls.

---

## Testing strategy

### Native swipe tests

Automated DOM/browser QA must verify:

- arrow navigation buttons no longer exist in series UI
- every series track renders all currently visible member cards in correct order
- each slide is full-width
- initial card is completely visible
- programmatic horizontal scroll updates progress correctly
- search with one surviving member remains standalone
- favorites with two members create a 2-slide track
- favorite/audio/details controls inside slides remain clickable
- expanded `<details>` state survives swiping away/back during the same render
- meaningful series movement stops current audio
- mobile layout has no body-level horizontal overflow

### Official-audio client tests

Use a fake proxy to verify:

- native Thai `item.th` is sent, never `roman` or `zhPron`
- cached/returned audio is played before browser TTS
- slow mode changes playback rate instead of changing request text
- repeated playback cancels previous audio
- official failure triggers browser Thai TTS and source notice
- invalid text does not call the proxy

### Proxy tests

Verify:

- API key comes from server secret/env only
- CORS rejects unrelated origins
- repeated identical Thai text returns cached audio after first provider call
- provider 429/quota errors are normalized safely
- credentials never appear in response bodies/log fixtures
- request text normalization preserves Thai characters correctly

### Content integrity regression

Re-run all existing 18-scene / 360-entry / 115-series tests plus:

- no malformed Unicode
- no Thai/Chinese/romanization field misalignment
- no duplicate series membership
- all audio buttons resolve back to the correct Thai string

---

## Acceptance criteria

The redesign is complete when:

1. Series navigation has no visible previous/next arrow buttons.
2. The active word card is already fully visible before any swipe.
3. The learner directly drags the full word-card track left/right.
4. Neighboring full cards visibly follow the gesture and snap natively.
5. Progress updates from actual scroll position.
6. Existing card controls remain usable inside the horizontal track.
7. Primary pronunciation uses native Thai text through NECTEC / AI for Thai official TTS.
8. No romanization or Chinese approximation is ever used as TTS input.
9. The provider API key is absent from all public GitHub Pages assets.
10. Official audio responses are cached to reduce provider calls.
11. Slow mode reuses official audio with local playback-rate adjustment.
12. Browser TTS is only a clearly identified fallback.
13. Existing 18 scenes, 360 entries, taxonomy, search, favorites, Thai visibility, collocations, and examples still pass regression QA.
14. Production is not labeled as official pronunciation until the server-side provider credential and live proxy are verified.

---

## Explicitly out of scope

- Recording a new human Thai voice corpus
- Scraping copyrighted pronunciation audio from dictionaries or third-party sites
- Exposing AI for Thai credentials in GitHub Pages
- Infinite-loop carousels
- autoplaying series cards
- autoplaying pronunciation on swipe
- sending romanization to any speech engine
- replacing the existing Chinese/romanization study aids

---

## Decisions confirmed with user

- Visible series arrow buttons should be removed.
- The full word card must be readable before the learner swipes.
- Horizontal interaction should happen directly on the word-card area.
- Official Thai pronunciation is preferred over browser-dependent pronunciation.
- NECTEC / AI for Thai official Thai TTS is acceptable as the primary source.
- English romanization/phonetic text must not be used to generate the Thai audio.

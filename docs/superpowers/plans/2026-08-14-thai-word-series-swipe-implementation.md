# Thai Word-Series Swipe Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add semantic vocabulary series to the Thai life-learning site so related words display one full card at a time and can be changed with a horizontal swipe or previous/next buttons.

**Architecture:** Keep the 360 existing vocabulary entries as the source of truth and add a separate declarative series configuration layer that enriches matching entries with `seriesId`, `seriesLabel`, and `seriesOrder`. After the existing scene/search/favorites filter runs, a pure grouping helper converts visible entries into standalone display items or ordered series. `learn.js` renders the active member through the existing vocabulary-card template, so word playback, collocations, examples, favorites, Thai visibility, and speech speed continue to use one implementation.

**Tech Stack:** Vanilla JavaScript ES modules, Pointer Events, CSS `touch-action: pan-y`, existing Web Speech API audio engine, Node built-in `node:test`.

## Global Constraints

- Swipe changes the **entire vocabulary card**, including word, Thai spelling, romanization, Chinese pronunciation aid, playback, collocations, and examples.
- Swipe is available only for explicitly related semantic word series; unrelated words remain normal single cards.
- Touch swipe and explicit previous/next buttons must both work.
- Progress text such as `2 / 5` is required.
- The first and last series items do not wrap around.
- Horizontal swipe threshold is 50 CSS pixels.
- Predominantly vertical movement must remain normal page scrolling.
- Short taps must not switch cards.
- Changing a series member must call `audioEngine.stop()` first.
- Expanded collocations/examples reset to collapsed when the active series member changes.
- Favorites remain entry-specific.
- Search/favorites grouping is based only on entries that survive the existing filter.
- If only one series member survives filtering, render it as a normal single card.
- No carousel library, auto-advance, looping carousel, or persisted active-series position.
- Existing search, favorites, TTS, slow playback, Thai show/hide, and 18-scene behavior must remain intact.

---

## File Map

- Create `thai/data/series.js` — declarative semantic series definitions plus metadata enrichment.
- Modify `thai/data/index.js` — export enriched `ENTRIES` instead of raw aggregated entries.
- Create `thai/js/series.js` — pure grouping, index clamping, and swipe-direction helpers.
- Modify `thai/js/learn.js` — render series shells, track active indexes, handle arrows/swipes, stop audio on navigation.
- Modify `thai/styles.css` — series toolbar, full-width swipe surface, buttons, progress styling, mobile touch behavior.
- Create `thai/tests/series.test.js` — grouping and swipe-direction behavior.
- Modify `thai/tests/data.test.js` — series configuration/data validation.

---

### Task 1: Declarative semantic series metadata

**Files:**
- Create: `thai/data/series.js`
- Modify: `thai/data/index.js`
- Modify: `thai/tests/data.test.js`

**Interfaces:**
- Produces: `SERIES_DEFINITIONS: Array<{id:string,scene:string,label:string,members:string[]}>`
- Produces: `applySeriesMetadata(entries, definitions?): VocabularyEntry[]`
- Enriched vocabulary entries may contain `seriesId: string`, `seriesLabel: string`, `seriesOrder: number`.

- [ ] **Step 1: Write failing data tests for semantic series**

Append to `thai/tests/data.test.js`:

```js
import { SERIES_DEFINITIONS } from '../data/series.js';

test('series definitions resolve to unique entries and contain at least two members', () => {
  const assigned = new Set();

  for (const definition of SERIES_DEFINITIONS) {
    assert.ok(definition.id && definition.scene && definition.label);
    assert.ok(definition.members.length >= 2, `${definition.id} needs >= 2 members`);
    assert.equal(new Set(definition.members).size, definition.members.length, `${definition.id} has duplicate member labels`);

    for (const zh of definition.members) {
      const matches = ENTRIES.filter(entry => entry.scene.includes(definition.scene) && entry.zh === zh);
      assert.equal(matches.length, 1, `${definition.id}:${zh} must resolve exactly once`);
      const key = `${definition.scene}:${matches[0].id}`;
      assert.ok(!assigned.has(key), `${matches[0].id} appears in more than one series in the same scene`);
      assigned.add(key);
    }
  }
});

test('enriched entries expose consistent ordered series metadata', () => {
  const grouped = new Map();
  for (const entry of ENTRIES.filter(entry => entry.seriesId)) {
    if (!grouped.has(entry.seriesId)) grouped.set(entry.seriesId, []);
    grouped.get(entry.seriesId).push(entry);
  }

  for (const definition of SERIES_DEFINITIONS) {
    const members = grouped.get(definition.id) || [];
    assert.equal(members.length, definition.members.length, `${definition.id} member count mismatch`);
    assert.deepEqual(
      members.sort((a, b) => a.seriesOrder - b.seriesOrder).map(entry => entry.zh),
      definition.members
    );
    assert.ok(members.every(entry => entry.seriesLabel === definition.label));
    assert.equal(new Set(members.map(entry => entry.seriesOrder)).size, members.length);
  }
});
```

- [ ] **Step 2: Run the tests and verify they fail for the missing series module**

Run:

```bash
cd thai && npm test
```

Expected: FAIL because `../data/series.js` does not exist.

- [ ] **Step 3: Create the explicit v1 series definitions**

Create `thai/data/series.js` with these definitions:

```js
export const SERIES_DEFINITIONS = [
  { id: 'restaurant-taste', scene: 'restaurant', label: '口味', members: ['甜', '辣', '酸', '咸', '淡'] },
  { id: 'restaurant-adjust', scene: 'restaurant', label: '增减', members: ['不要', '加', '少一点', '多一点'] },
  { id: 'coffee-temperature', scene: 'coffee', label: '冷热 / 冰量', members: ['热', '冷', '冰', '少冰', '不加冰'] },
  { id: 'convenience-demonstrative', scene: 'convenience', label: '这个 / 那个', members: ['这个', '那个'] },
  { id: 'convenience-count', scene: 'convenience', label: '数量', members: ['一个', '两个'] },
  { id: 'market-demonstrative', scene: 'market', label: '这个 / 那个', members: ['这个', '那个'] },
  { id: 'market-weight', scene: 'market', label: '重量', members: ['一公斤', '半公斤'] },
  { id: 'taxi-route', scene: 'taxi', label: '路线', members: ['左转', '右转', '直走', '掉头'] },
  { id: 'directions-demonstrative', scene: 'directions', label: '这里 / 那里', members: ['这里', '那里'] },
  { id: 'directions-direction', scene: 'directions', label: '方向', members: ['左边', '右边', '前面', '后面', '楼上', '楼下'] },
  { id: 'directions-distance', scene: 'directions', label: '距离', members: ['远', '近'] },
  { id: 'greetings-permission', scene: 'greetings', label: '可以 / 不可以', members: ['可以', '不可以'] },
  { id: 'greetings-existence', scene: 'greetings', label: '有 / 没有', members: ['有', '没有'] },
  { id: 'friends-date', scene: 'friends', label: '时间', members: ['今天', '明天', '昨天'] }
];

export function applySeriesMetadata(entries, definitions = SERIES_DEFINITIONS) {
  const lookup = new Map();

  definitions.forEach(definition => {
    definition.members.forEach((zh, index) => {
      lookup.set(`${definition.scene}\u0000${zh}`, {
        seriesId: definition.id,
        seriesLabel: definition.label,
        seriesOrder: index + 1
      });
    });
  });

  return entries.map(entry => {
    const scene = entry.scene?.[0];
    const metadata = lookup.get(`${scene}\u0000${entry.zh}`);
    return metadata ? { ...entry, ...metadata } : entry;
  });
}
```

- [ ] **Step 4: Enrich the aggregate dataset**

In `thai/data/index.js`, keep every current import/spread unchanged but rename the raw aggregate and export the enriched result:

```js
import { applySeriesMetadata } from './series.js';

const BASE_ENTRIES = [
  // keep all existing scene spreads here in their current order
];

export const ENTRIES = applySeriesMetadata(BASE_ENTRIES);
```

Do not mutate scene modules or change existing IDs, Thai text, romanization, collocations, or examples.

- [ ] **Step 5: Run all tests**

```bash
cd thai && npm test
```

Expected: all pre-existing tests plus the two new series-data tests pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add thai/data/series.js thai/data/index.js thai/tests/data.test.js
git commit -m "feat: tag related Thai vocabulary series"
```

---

### Task 2: Pure display grouping and swipe interpretation

**Files:**
- Create: `thai/js/series.js`
- Create: `thai/tests/series.test.js`

**Interfaces:**
- Produces: `groupEntriesForDisplay(entries): DisplayItem[]`
- `DisplayItem` is either `{ kind:'entry', entry }` or `{ kind:'series', id, label, entries }`.
- Produces: `clampSeriesIndex(index:number, length:number): number`
- Produces: `getSwipeDirection(deltaX:number, deltaY:number, threshold?:number): 'prev'|'next'|null`

- [ ] **Step 1: Write failing grouping tests**

Create `thai/tests/series.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { groupEntriesForDisplay, clampSeriesIndex, getSwipeDirection } from '../js/series.js';

const standalone = { id: 'solo', zh: '结账' };
const spicy = { id: 'spicy', zh: '辣', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 2 };
const sweet = { id: 'sweet', zh: '甜', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 1 };
const sour = { id: 'sour', zh: '酸', seriesId: 'taste', seriesLabel: '口味', seriesOrder: 3 };

test('groups same-series entries and keeps the first visible position', () => {
  const result = groupEntriesForDisplay([spicy, standalone, sweet, sour]);
  assert.equal(result.length, 2);
  assert.equal(result[0].kind, 'series');
  assert.equal(result[0].id, 'taste');
  assert.deepEqual(result[0].entries.map(entry => entry.zh), ['甜', '辣', '酸']);
  assert.equal(result[1].entry.id, 'solo');
});

test('a single surviving series member becomes a standalone entry', () => {
  const result = groupEntriesForDisplay([spicy, standalone]);
  assert.deepEqual(result.map(item => item.kind), ['entry', 'entry']);
  assert.equal(result[0].entry.id, 'spicy');
});

test('different series never merge', () => {
  const otherA = { id: 'left', seriesId: 'direction', seriesLabel: '方向', seriesOrder: 1 };
  const otherB = { id: 'right', seriesId: 'direction', seriesLabel: '方向', seriesOrder: 2 };
  const result = groupEntriesForDisplay([sweet, spicy, otherA, otherB]);
  assert.deepEqual(result.map(item => item.id), ['taste', 'direction']);
});

test('clampSeriesIndex stays inside current series length', () => {
  assert.equal(clampSeriesIndex(-1, 5), 0);
  assert.equal(clampSeriesIndex(2, 5), 2);
  assert.equal(clampSeriesIndex(9, 5), 4);
  assert.equal(clampSeriesIndex(2, 0), 0);
});

test('swipe direction requires a 50px predominantly horizontal gesture', () => {
  assert.equal(getSwipeDirection(-70, 10), 'next');
  assert.equal(getSwipeDirection(70, 10), 'prev');
  assert.equal(getSwipeDirection(-40, 5), null);
  assert.equal(getSwipeDirection(-70, 90), null);
  assert.equal(getSwipeDirection(5, 1), null);
});
```

- [ ] **Step 2: Run tests and verify the intended failure**

```bash
cd thai && npm test
```

Expected: FAIL because `../js/series.js` does not exist.

- [ ] **Step 3: Implement the pure helpers**

Create `thai/js/series.js`:

```js
export function groupEntriesForDisplay(entries) {
  const output = [];
  const seenSeries = new Set();

  entries.forEach(entry => {
    if (!entry.seriesId) {
      output.push({ kind: 'entry', entry });
      return;
    }

    if (seenSeries.has(entry.seriesId)) return;
    seenSeries.add(entry.seriesId);

    const members = entries
      .filter(candidate => candidate.seriesId === entry.seriesId)
      .map((candidate, originalIndex) => ({ candidate, originalIndex }))
      .sort((a, b) => {
        const orderA = Number.isFinite(a.candidate.seriesOrder) ? a.candidate.seriesOrder : Number.MAX_SAFE_INTEGER;
        const orderB = Number.isFinite(b.candidate.seriesOrder) ? b.candidate.seriesOrder : Number.MAX_SAFE_INTEGER;
        return orderA - orderB || a.originalIndex - b.originalIndex;
      })
      .map(item => item.candidate);

    if (members.length < 2) {
      output.push({ kind: 'entry', entry: members[0] || entry });
      return;
    }

    output.push({
      kind: 'series',
      id: entry.seriesId,
      label: entry.seriesLabel || '同系列',
      entries: members
    });
  });

  return output;
}

export function clampSeriesIndex(index, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return Math.min(Math.max(Number.isFinite(index) ? index : 0, 0), length - 1);
}

export function getSwipeDirection(deltaX, deltaY, threshold = 50) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX < threshold || absX <= absY) return null;
  return deltaX < 0 ? 'next' : 'prev';
}
```

- [ ] **Step 4: Run all tests**

```bash
cd thai && npm test
```

Expected: all tests pass, including grouping order, filtered singleton behavior, index clamping, and swipe threshold.

- [ ] **Step 5: Commit Task 2**

```bash
git add thai/js/series.js thai/tests/series.test.js
git commit -m "feat: add Thai series grouping and swipe helpers"
```

---

### Task 3: Render full-card series with arrows and progress

**Files:**
- Modify: `thai/js/learn.js`
- Modify: `thai/styles.css`

**Interfaces:**
- Consumes: `groupEntriesForDisplay`, `clampSeriesIndex`, existing `entryHtml`, `filteredEntries`, `audioEngine`, `learnerState`.
- Maintains: `seriesIndexes: Map<string, number>` for current in-memory active members.
- Maintains: `displayItems: DisplayItem[]` for current filtered view.

- [ ] **Step 1: Import series helpers and add in-memory state**

At the top of `thai/js/learn.js` add:

```js
import { groupEntriesForDisplay, clampSeriesIndex, getSwipeDirection } from './series.js';

const seriesIndexes = new Map();
let displayItems = [];
let swipeStart = null;
```

- [ ] **Step 2: Add a reusable full-card series renderer**

Keep `entryHtml(entry)` as the only vocabulary-card renderer. Add:

```js
function activeSeriesIndex(group) {
  return clampSeriesIndex(seriesIndexes.get(group.id) ?? 0, group.entries.length);
}

function seriesHtml(group) {
  const index = activeSeriesIndex(group);
  seriesIndexes.set(group.id, index);
  const active = group.entries[index];
  const previous = group.entries[index - 1] || null;
  const next = group.entries[index + 1] || null;

  return `
    <section class="series-shell" data-series-id="${escapeHtml(group.id)}">
      <div class="series-toolbar">
        <strong class="series-label">${escapeHtml(group.label)}</strong>
        <div class="series-controls" aria-label="同系列词切换">
          <button type="button" class="series-nav" data-series-nav="prev"
            ${previous ? '' : 'disabled'}
            aria-label="${previous ? `上一个：${escapeHtml(previous.zh)}` : '已经是第一个'}">‹</button>
          <span class="series-progress" aria-label="第 ${index + 1} 个，共 ${group.entries.length} 个">${index + 1} / ${group.entries.length}</span>
          <button type="button" class="series-nav" data-series-nav="next"
            ${next ? '' : 'disabled'}
            aria-label="${next ? `下一个：${escapeHtml(next.zh)}` : '已经是最后一个'}">›</button>
        </div>
      </div>
      <div class="series-swipe-surface" data-series-swipe="${escapeHtml(group.id)}">
        ${entryHtml(active)}
      </div>
    </section>
  `;
}

function displayItemHtml(item) {
  return item.kind === 'series' ? seriesHtml(item) : entryHtml(item.entry);
}
```

- [ ] **Step 3: Group only after the existing filter**

Change `render()` so the filter remains the first operation:

```js
function render() {
  setTitle();
  searchInput.value = queryState.q;
  const entries = filteredEntries();
  displayItems = groupEntriesForDisplay(entries);

  const validSeries = new Set(displayItems.filter(item => item.kind === 'series').map(item => item.id));
  for (const id of seriesIndexes.keys()) {
    if (!validSeries.has(id)) seriesIndexes.delete(id);
  }

  results.innerHTML = displayItems.map(displayItemHtml).join('');
  emptyState.hidden = entries.length > 0;
}
```

This guarantees Chinese search and favorites determine which members are swipeable. A search returning only `辣` renders a normal card because `groupEntriesForDisplay` receives only that matching entry.

- [ ] **Step 4: Add series lookup and navigation**

Add:

```js
function currentSeriesGroup(id) {
  return displayItems.find(item => item.kind === 'series' && item.id === id) || null;
}

function replaceSeriesShell(group, focusDirection = null) {
  const oldShell = [...results.querySelectorAll('[data-series-id]')]
    .find(element => element.dataset.seriesId === group.id);
  if (!oldShell) return;

  const template = document.createElement('template');
  template.innerHTML = seriesHtml(group).trim();
  const freshShell = template.content.firstElementChild;
  oldShell.replaceWith(freshShell);

  if (focusDirection) {
    freshShell.querySelector(`[data-series-nav="${focusDirection}"]`)?.focus();
  }
}

function moveSeries(id, direction, focusDirection = null) {
  const group = currentSeriesGroup(id);
  if (!group) return;

  const current = activeSeriesIndex(group);
  const delta = direction === 'next' ? 1 : -1;
  const next = clampSeriesIndex(current + delta, group.entries.length);
  if (next === current) return;

  audioEngine.stop();
  seriesIndexes.set(id, next);
  replaceSeriesShell(group, focusDirection);
}
```

Replacing only that series shell means other open cards/details on the page are not reset. The incoming card is freshly rendered, so its `details` elements start collapsed.

- [ ] **Step 5: Handle arrow buttons before favorite/play handling**

At the beginning of the existing `results.addEventListener('click', ...)` callback:

```js
const navButton = event.target.closest('[data-series-nav]');
if (navButton) {
  const shell = navButton.closest('[data-series-id]');
  if (shell) moveSeries(shell.dataset.seriesId, navButton.dataset.seriesNav, navButton.dataset.seriesNav);
  return;
}
```

Leave the existing favorite and play handlers below it unchanged.

- [ ] **Step 6: Reset active indexes for a new search, but preserve/clamp after favorite changes**

In the existing search submit handler:

```js
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  queryState.q = searchInput.value.trim();
  seriesIndexes.clear();
  render();
});
```

Do not clear `seriesIndexes` in the favorite handler. The existing favorite handler may continue to call `render()`; `render()` prunes missing series and `activeSeriesIndex()` clamps indexes after a favorite disappears.

- [ ] **Step 7: Add full-width mobile series styling**

Append to `thai/styles.css`:

```css
.series-shell {
  display: grid;
  gap: 8px;
}

.series-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-inline: 4px;
}

.series-label {
  min-width: 0;
  font-size: .95rem;
}

.series-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.series-nav {
  width: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 999px;
}

.series-nav:disabled {
  cursor: default;
  opacity: .35;
}

.series-progress {
  min-width: 48px;
  text-align: center;
  font-size: .9rem;
  color: #6b7280;
}

.series-swipe-surface {
  width: 100%;
  min-width: 0;
  touch-action: pan-y;
}
```

Do not put arrow columns beside the vocabulary card; keeping controls in the toolbar preserves the existing full card width on 360px phones.

- [ ] **Step 8: Run all automated tests before adding gesture code**

```bash
cd thai && npm test
```

Expected: all tests pass and existing standalone rendering remains compatible.

- [ ] **Step 9: Commit Task 3**

```bash
git add thai/js/learn.js thai/styles.css
git commit -m "feat: render swipeable Thai vocabulary series"
```

---

### Task 4: Horizontal touch/pointer swipe without blocking vertical scroll

**Files:**
- Modify: `thai/js/learn.js`
- Test: `thai/tests/series.test.js`

**Interfaces:**
- Consumes: `getSwipeDirection(deltaX, deltaY, 50)`.
- Gesture state shape: `{ id:string, pointerId:number, x:number, y:number } | null`.

- [ ] **Step 1: Add edge-case tests for swipe interpretation**

Append to `thai/tests/series.test.js`:

```js
test('exact threshold counts as a swipe but equal horizontal/vertical movement does not', () => {
  assert.equal(getSwipeDirection(-50, 0), 'next');
  assert.equal(getSwipeDirection(50, 0), 'prev');
  assert.equal(getSwipeDirection(60, 60), null);
});
```

- [ ] **Step 2: Run tests and verify current helper behavior**

```bash
cd thai && npm test
```

Expected: PASS if the Task 2 helper correctly uses `absX < threshold` and `absX <= absY`; if not, correct only `getSwipeDirection` until this test passes.

- [ ] **Step 3: Track pointer start only on the card surface**

Add to `thai/js/learn.js`:

```js
results.addEventListener('pointerdown', event => {
  const surface = event.target.closest('[data-series-swipe]');
  if (!surface) return;
  if (event.target.closest('button, a, input, summary')) return;

  swipeStart = {
    id: surface.dataset.seriesSwipe,
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY
  };
});
```

- [ ] **Step 4: Interpret pointer release and switch the whole card**

Add:

```js
results.addEventListener('pointerup', event => {
  if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

  const direction = getSwipeDirection(
    event.clientX - swipeStart.x,
    event.clientY - swipeStart.y,
    50
  );
  const id = swipeStart.id;
  swipeStart = null;

  if (direction) moveSeries(id, direction);
});

results.addEventListener('pointercancel', event => {
  if (swipeStart?.pointerId === event.pointerId) swipeStart = null;
});
```

Do not call `preventDefault()` in these handlers. `touch-action: pan-y` on the swipe surface tells the browser that vertical scrolling remains native.

- [ ] **Step 5: Run all tests**

```bash
cd thai && npm test
```

Expected: zero failures.

- [ ] **Step 6: Manual mobile-width gesture QA**

Serve the repository root:

```bash
python3 -m http.server 8000
```

At `/thai/learn.html?scene=restaurant`, verify:

- `口味` shows one full card and `1 / 5` initially;
- left swipe of more than 50px changes to the next word;
- right swipe changes to the previous word;
- a vertical drag scrolls the page and does not switch words;
- a tap on `🔊`, favorite, or `<summary>` does not switch words;
- `‹` is disabled at the first item and `›` at the last;
- changing word stops currently playing audio;
- moving to a new word shows collocations/examples collapsed;
- arrow button activation leaves keyboard focus on the equivalent arrow after the card changes.

- [ ] **Step 7: Commit Task 4**

```bash
git add thai/js/learn.js thai/tests/series.test.js
git commit -m "feat: add full-card swipe gestures for Thai series"
```

---

### Task 5: Regression QA, preview, and branch verification

**Files:**
- Modify only if a verified defect is found: `thai/js/learn.js`, `thai/js/series.js`, `thai/styles.css`, `thai/data/series.js`, tests.
- Generate local conversation preview: `/mnt/data/thai-preview.html` (not committed to GitHub).

**Interfaces:**
- No new public interface.

- [ ] **Step 1: Run the complete suite**

```bash
cd thai && npm test
```

Expected: zero failing tests, with previous search/state/audio/data tests plus new series tests all green.

- [ ] **Step 2: Run JS syntax checks**

```bash
find thai/js thai/data thai/tests -name '*.js' -print0 | xargs -0 -n1 node --check
```

Expected: exit code 0.

- [ ] **Step 3: Regression-check filter-specific grouping**

Using the local page:

```text
/thai/learn.html?scene=restaurant
/thai/learn.html?q=辣
/thai/learn.html?favorites=1
```

Verify:

- normal restaurant view groups `甜 / 辣 / 酸 / 咸 / 淡`;
- search `辣` shows `辣` as a normal card, not a five-word series;
- two favorited words from one series form a two-item series in favorites;
- one favorited word from a series is standalone;
- standalone words such as `结账` remain unchanged;
- Chinese search results are unchanged apart from the intended grouping presentation.

- [ ] **Step 4: Verify key series membership**

Check at minimum:

```text
restaurant: 口味, 增减
coffee: 冷热 / 冰量
convenience: 这个 / 那个, 数量
market: 重量
 taxi: 路线
directions: 这里 / 那里, 方向, 距离
greetings: 可以 / 不可以, 有 / 没有
friends: 时间
```

The leading space before `taxi` above is formatting only; the scene ID is `taxi`.

- [ ] **Step 5: Generate a refreshed standalone preview for the user**

Build `/mnt/data/thai-preview.html` from the verified branch content so the preview visibly demonstrates at least these series even if the chat file preview restricts external module loading:

```text
口味: 甜 / 辣 / 酸 / 咸 / 淡
指示: 这个 / 那个
方向: 左边 / 右边 / 前面 / 后面 / 楼上 / 楼下
```

The standalone preview must show explicit `‹` / `›` controls and progress, and when JavaScript is allowed it should support horizontal pointer/touch swipe of the whole sample card.

- [ ] **Step 6: Re-run the complete suite immediately before publishing branch changes**

```bash
cd thai && npm test
```

Expected: zero failures.

- [ ] **Step 7: Verify the GitHub feature branch after publishing**

After updating `feat/thai-life-speak`, fetch these paths from GitHub and confirm they contain the expected series implementation:

```text
thai/data/series.js
thai/js/series.js
thai/js/learn.js
thai/styles.css
thai/tests/series.test.js
```

Do not merge to `main` as part of this task. The user will preview the behavior before deciding whether to publish the site.

---

## Plan Self-Review

### Spec coverage
- Entire-card switching: Tasks 3–4.
- Semantic-only grouping: Task 1 definitions + Task 2 singleton behavior.
- Swipe + arrows: Tasks 3–4.
- Progress: Task 3.
- No wrap: `clampSeriesIndex` + disabled edge buttons in Task 3.
- 50px threshold and vertical-scroll protection: Tasks 2 and 4.
- Stop audio on navigation: Task 3.
- Details reset on incoming card: Task 3 replaces only that series shell.
- Search/favorites visibility rules: grouping happens after `filteredEntries()` in Task 3; Task 5 regression checks.
- Entry-specific favorites: existing favorite logic is reused unchanged.
- Accessibility: real buttons, disabled attributes, descriptive labels, preserved focus in Task 3.
- No third-party carousel: architecture and global constraints.
- Initial high-value groups: Task 1 definitions.
- Existing standalone cards remain unchanged: Task 2 + Task 5.

### Placeholder scan
No TBD/TODO/“implement later” steps are present. Every new helper, metadata field, interaction, and test has a concrete signature or exact behavior.

### Type consistency
The plan consistently uses `seriesId`, `seriesLabel`, `seriesOrder`, `DisplayItem.kind`, `seriesIndexes`, `groupEntriesForDisplay`, `clampSeriesIndex`, and `getSwipeDirection`. Series grouping occurs only after the existing entry filter.

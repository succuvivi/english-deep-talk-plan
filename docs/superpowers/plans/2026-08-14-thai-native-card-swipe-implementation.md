# Thai Native Card Swipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current arrow/button-driven series switcher with a full-width native horizontal card track that the learner drags directly.

**Architecture:** Keep the existing scene filtering and series grouping. Render every currently visible series member as a full `entryHtml()` slide inside a horizontally scrollable `scroll-snap` track. Derive progress from actual track position and remove the old per-series active-index/replacement flow.

**Tech Stack:** Vanilla JavaScript ES modules, CSS scroll snap, Node `node:test`, existing static GitHub Pages site.

## Global Constraints

- No visible previous/next series navigation buttons.
- First/current card must be fully readable before any swipe.
- Direct drag occurs on the complete word-card track.
- Vertical page scrolling remains natural.
- No third-party carousel library.
- No looping and no autoplay.
- Search/favorites still group only entries surviving the current filter.
- Existing favorite, audio, details, Thai show/hide, and search controls remain usable.
- Existing 18 scenes / 360 entries / semantic taxonomy remain unchanged.

---

### Task 1: Add pure helpers for native track progress

**Files:**
- Modify: `thai/js/series.js`
- Modify: `thai/tests/series.test.js`

**Interfaces:**
- Produces: `getSeriesTrackIndex(scrollLeft, slideWidth, count)` and `getSeriesTrackProgress(scrollLeft, slideWidth, count)`.

- [ ] **Step 1: Write failing tests**

Add tests covering index `0`, middle, final, fractional widths, and clamping:

```js
test('series track index follows actual horizontal position', () => {
  assert.equal(getSeriesTrackIndex(0, 320, 4), 0);
  assert.equal(getSeriesTrackIndex(319, 320, 4), 1);
  assert.equal(getSeriesTrackIndex(641, 320, 4), 2);
  assert.equal(getSeriesTrackIndex(9999, 320, 4), 3);
});

test('series track progress exposes human readable current and total', () => {
  assert.deepEqual(getSeriesTrackProgress(640, 320, 4), {
    index: 2,
    current: 3,
    total: 4
  });
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

```bash
cd thai && node --test tests/series.test.js
```

Expected: fail because the new helpers do not exist.

- [ ] **Step 3: Implement minimal pure helpers**

```js
export function getSeriesTrackIndex(scrollLeft, slideWidth, count) {
  if (!Number.isFinite(slideWidth) || slideWidth <= 0 || count <= 0) return 0;
  const raw = Math.round(Math.max(0, scrollLeft) / slideWidth);
  return Math.max(0, Math.min(raw, count - 1));
}

export function getSeriesTrackProgress(scrollLeft, slideWidth, count) {
  const index = getSeriesTrackIndex(scrollLeft, slideWidth, count);
  return { index, current: count ? index + 1 : 0, total: Math.max(0, count) };
}
```

- [ ] **Step 4: Re-run targeted tests and verify GREEN**

```bash
cd thai && node --test tests/series.test.js
```

- [ ] **Step 5: Commit**

Commit message: `feat: add native series track progress helpers`.

---

### Task 2: Render complete series tracks and remove arrow navigation

**Files:**
- Modify: `thai/js/learn.js`
- Modify: `thai/styles.css`
- Test: `thai/tests/series.test.js`

**Interfaces:**
- Consumes: `groupEntriesForDisplay()` and `getSeriesTrackProgress()`.
- Produces DOM structure: `.series-track[data-series-track] > .series-slide` where every slide contains a complete `entryHtml(entry)` card.

- [ ] **Step 1: Add failing structural assertions**

Add a small exported pure renderer helper if necessary so tests can assert:

- no `data-series-nav` markup;
- all group members appear in order;
- one progress element exists;
- each member is wrapped in `.series-slide`.

Expected HTML shape:

```html
<section class="series-shell" data-series-id="restaurant-protein">
  <div class="series-heading">
    <strong class="series-label">肉类食材</strong>
    <span class="series-progress">1 / 4</span>
  </div>
  <div class="series-track" data-series-track="restaurant-protein">
    <div class="series-slide">...</div>
    <div class="series-slide">...</div>
    <div class="series-slide">...</div>
    <div class="series-slide">...</div>
  </div>
</section>
```

- [ ] **Step 2: Verify RED**

Run the targeted test and confirm the current renderer still includes arrow buttons / one active card only.

- [ ] **Step 3: Replace `seriesHtml(group)`**

Render all `group.entries` with `entryHtml(entry)` and initialize progress to `1 / N`. Delete the old `seriesIndexes`, `activeSeriesIndex`, `replaceSeriesShell`, `moveSeries`, `data-series-nav` click handling, and pointer-gesture replacement flow.

- [ ] **Step 4: Add native track CSS**

```css
.series-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.series-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.series-track::-webkit-scrollbar { display: none; }

.series-slide {
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

Remove obsolete `.series-controls`, `.series-nav`, and `.series-swipe-surface` rules.

- [ ] **Step 5: Re-run tests and syntax check**

```bash
cd thai && npm test
find js data tests -name '*.js' -print0 | xargs -0 -n1 node --check
```

Expected: zero failures.

- [ ] **Step 6: Commit**

Commit message: `feat: make vocabulary series directly swipeable`.

---

### Task 3: Keep progress and audio state synchronized with native scrolling

**Files:**
- Modify: `thai/js/learn.js`
- Modify: `thai/js/series.js`
- Modify: `thai/tests/series.test.js`

**Interfaces:**
- Uses track `scrollLeft`, `clientWidth`, and child count.
- Updates only the sibling `.series-progress` text/ARIA state.

- [ ] **Step 1: Add failing tests for progress calculation under fractional layout**

Cover 390px mobile width, tiny sub-pixel drift, and final-slide clamping.

- [ ] **Step 2: Verify RED if helper behavior is insufficient**

Run `node --test tests/series.test.js`.

- [ ] **Step 3: Add delegated scroll handling**

In `learn.js`:

- listen for `scroll` on `results` in capture mode because scroll does not bubble normally;
- identify closest `[data-series-track]`;
- once scroll movement exceeds a small threshold (e.g. 12px from the last settled position), call `audioEngine.stop()` once for that movement;
- debounce 100-140ms after scrolling to update progress from actual track position;
- use native `scrollend` when present as an additional immediate settle path;
- do not re-render the series shell during scrolling.

- [ ] **Step 4: Add accessible progress metadata**

Set text `2 / 4` and `aria-label="第 2 个，共 4 个"` on settle.

- [ ] **Step 5: Run full tests**

```bash
cd thai && npm test
```

- [ ] **Step 6: Commit**

Commit message: `feat: sync series progress with native scroll`.

---

### Task 4: Browser-level swipe regression QA

**Files:**
- Create or modify: `thai/tests/browser-series-smoke.mjs` if a browser harness is available locally; otherwise keep this as a one-off verification script outside the repository.

**Interfaces:**
- Opens `learn.html?scene=restaurant` with production modules.

- [ ] **Step 1: Assert the first card is fully visible at 390px width**

Check slide width equals track client width within 1px and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 2: Programmatically scroll the protein track to the second slide**

Assert progress becomes `2 / 4` and the second card Chinese/Thai fields match the second taxonomy entry.

- [ ] **Step 3: Expand details, move away, move back**

Assert the `<details open>` state is preserved because the card DOM was never replaced.

- [ ] **Step 4: Click favorite and audio controls inside a slide**

Assert they receive the click and horizontal navigation does not consume the interaction.

- [ ] **Step 5: Run complete regression suite**

```bash
cd thai && npm test
```

Expected: all existing data/audio/search/state tests plus new swipe tests pass.

---

## Self-review

- Spec coverage: removes visible arrows, preserves complete initial card, implements direct native drag, actual-position progress, controls inside cards, persistent details state, and audio stop during navigation.
- No placeholder steps.
- No changes to taxonomy or vocabulary content.
- The old pointer gesture helpers may remain only if still tested/used elsewhere; otherwise remove them together with obsolete tests to avoid dead code.

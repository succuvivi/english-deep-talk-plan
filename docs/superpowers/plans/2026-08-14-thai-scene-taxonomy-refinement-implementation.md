# Thai Scene Taxonomy Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the narrow Thai vocabulary series taxonomy with the user-approved 18-scene semantic-family taxonomy and regenerate a preview that visibly demonstrates those families.

**Architecture:** Keep all 360 vocabulary entries unchanged. Expand only the declarative `SERIES_DEFINITIONS` layer, letting the existing metadata enrichment and full-card swipe renderer consume the broader taxonomy automatically. Add regression tests that validate exact membership, one-series-per-entry, all-scene coverage, and the two user-highlighted families: restaurant protein (`肉 / 鸡 / 猪 / 鱼`) and coffee ingredients (`咖啡 / 茶 / 奶 / 糖`).

**Tech Stack:** Vanilla JavaScript ES modules, Node built-in `node:test`, existing preview generator in `/mnt/data/thai-life-work/make_preview.py`, existing browser-independent swipe helpers.

## Global Constraints

- Classification is scene-local; never group vocabulary across life scenes.
- Group by practical semantic family and substitutability, not only antonyms.
- Each vocabulary entry may belong to at most one series inside a scene.
- Do not rewrite Thai text, romanization, Chinese pronunciation aids, collocations, examples, IDs, or audio fields.
- Standalone vocabulary remains standalone.
- Existing full-card swipe, arrows, progress, favorites, search, TTS, slow playback, and Thai show/hide behavior remain unchanged.
- Search/favorites group only entries that survive the current filter.
- No new carousel dependency.

---

### Task 1: Lock the complete 18-scene taxonomy with failing tests

**Files:**
- Modify: `thai/tests/data.test.js`
- Modify: `thai/data/series.js`

**Interfaces:**
- Consumes: `SERIES_DEFINITIONS`, `ENTRIES`.
- Produces: expanded `SERIES_DEFINITIONS` covering all 18 scene IDs.

- [ ] **Step 1: Add a failing taxonomy contract test before changing definitions**

Append to `thai/tests/data.test.js`:

```js
const EXPECTED_SERIES = new Map([
  ['restaurant-protein', ['肉', '鸡', '猪', '鱼']],
  ['coffee-ingredients', ['咖啡', '茶', '奶', '糖']],
  ['restaurant-staples', ['米饭', '面']],
  ['coffee-sweetness', ['甜', '不甜', '少甜']],
  ['convenience-payment', ['多少钱', '现金', '扫码', '卡', '收据']],
  ['market-price', ['贵', '便宜', '多少钱', '再便宜一点']],
  ['taxi-route', ['左转', '右转', '直走', '掉头']],
  ['motorbike-check', ['油', '轮胎', '胎压', '刹车']],
  ['directions-position', ['左边', '右边', '前面', '后面', '楼上', '楼下']],
  ['petrol-fuel', ['汽油', '柴油', '91', '95', 'E20']],
  ['delivery-dropoff', ['在楼下', '在大厅', '放门口', '放前台']],
  ['condo-lease', ['房租', '押金', '合同', '一个月', '一年', '续租', '搬走']],
  ['repairs-appliances', ['冰箱', '洗衣机', '热水器']],
  ['laundry-service', ['洗衣', '烘干', '熨衣服', '干洗']],
  ['massage-body', ['头', '肩膀', '背', '腿', '脚']],
  ['hospital-symptoms', ['生病', '发烧', '咳嗽', '喉咙痛', '头痛', '肚子痛', '拉肚子', '过敏', '受伤']],
  ['bank-business', ['转账', '开户', '取钱', '存钱', '换钱']],
  ['mobile-contact', ['电话', '号码', '打电话', '接电话', '发消息']],
  ['greetings-apology', ['对不起 / 抱歉', '不好意思', '没关系', '没事']],
  ['friends-activity', ['一起去', '去哪里', '吃饭', '喝一杯']]
]);

test('approved scene taxonomy includes the required semantic families', () => {
  const byId = new Map(SERIES_DEFINITIONS.map(definition => [definition.id, definition]));
  for (const [id, members] of EXPECTED_SERIES) {
    assert.deepEqual(byId.get(id)?.members, members, `${id} taxonomy mismatch`);
  }
});

test('every one of the 18 scenes has semantic series coverage', () => {
  const covered = new Set(SERIES_DEFINITIONS.map(definition => definition.scene));
  assert.deepEqual([...sceneIds].sort(), [...covered].sort());
});

test('series classification covers most vocabulary without forcing every word', () => {
  const grouped = ENTRIES.filter(entry => entry.seriesId).length;
  assert.ok(grouped >= 300, `expected >= 300 grouped entries, got ${grouped}`);
  assert.ok(grouped < ENTRIES.length, 'some genuinely standalone vocabulary should remain');
});
```

- [ ] **Step 2: Run the suite and verify RED**

Run:

```bash
cd /mnt/data/thai-life-work/thai && npm test
```

Expected: FAIL because current `SERIES_DEFINITIONS` lacks the broad semantic families and all-scene coverage.

- [ ] **Step 3: Replace `SERIES_DEFINITIONS` with the approved full taxonomy**

Use the exact current vocabulary labels and the complete taxonomy approved in `docs/superpowers/specs/2026-08-14-thai-word-series-swipe-design.md`. Preserve `applySeriesMetadata()` unchanged.

- [ ] **Step 4: Run the suite and verify GREEN**

Run:

```bash
cd /mnt/data/thai-life-work/thai && npm test
```

Expected: zero failures and the new taxonomy contract tests pass.

---

### Task 2: Generate a preview from the real taxonomy instead of a hand-picked sample

**Files:**
- Modify: `/mnt/data/thai-life-work/make_preview.py`
- Modify: `/mnt/data/thai-life-work/test_preview_static.py`
- Generate: `/mnt/data/thai-preview.html`

**Interfaces:**
- Consumes the actual `thai/data/series.js` taxonomy and current vocabulary files.
- Produces a self-contained preview containing all 18 scene sections and visible semantic-family carousels.

- [ ] **Step 1: Add failing preview assertions**

Update `/mnt/data/thai-life-work/test_preview_static.py` so it asserts the generated preview contains `肉类食材`, all of `肉/鸡/猪/鱼`, `饮品与原料`, all of `咖啡/茶/奶/糖`, `18 个生活场景`, and at least 80 semantic-family tracks.

- [ ] **Step 2: Run the preview test and verify RED**

Run:

```bash
cd /mnt/data/thai-life-work && python3 test_preview_static.py
```

Expected: FAIL because the current preview generator contains only the earlier narrow sample series.

- [ ] **Step 3: Regenerate preview data from real scene entries and new series definitions**

Modify `make_preview.py` to build each scene from the same exact vocabulary strings and semantic families used by `SERIES_DEFINITIONS`. Every family renders a horizontal `.series-track` containing full cards. All 18 scene navigation cards remain visible; standalone entries remain standalone. CSS snap scrolling is the static attachment fallback while the real GitHub app keeps the existing JS full-card switcher.

- [ ] **Step 4: Run the preview assertions and inspect output size**

Run:

```bash
cd /mnt/data/thai-life-work && python3 make_preview.py && python3 test_preview_static.py && ls -lh /mnt/data/thai-preview.html
```

Expected: PASS; preview contains all approved families and remains a single portable HTML file.

---

### Task 3: Final verification and feature-branch sync

**Files:**
- Modify on branch: `thai/data/series.js`
- Modify on branch: `thai/tests/data.test.js`
- Keep this plan document on branch.
- Do not merge `main`.

- [ ] **Step 1: Run fresh complete verification**

```bash
cd /mnt/data/thai-life-work/thai && npm test
find js data tests -name '*.js' -print0 | xargs -0 -n1 node --check
cd /mnt/data/thai-life-work && python3 test_preview_static.py
```

Expected: all tests pass, syntax checks exit 0, preview assertions pass.

- [ ] **Step 2: Sync only the taxonomy/test changes to `feat/thai-life-speak`**

Publish `thai/data/series.js` and `thai/tests/data.test.js`. Do not merge into `main`.

- [ ] **Step 3: Fetch back the GitHub files and confirm the key families**

Confirm `restaurant-protein = 肉 / 鸡 / 猪 / 鱼` and `coffee-ingredients = 咖啡 / 茶 / 奶 / 糖`.

- [ ] **Step 4: Deliver the refreshed `/mnt/data/thai-preview.html` to the user**

The user should be able to inspect the revised classification before deciding whether to publish the website.

---

## Self-review

- Spec coverage: all 18 scenes are explicitly covered by the approved design spec consumed in Task 1.
- User-highlighted missing categories: restaurant protein and coffee ingredients have exact regression assertions.
- Interaction architecture: unchanged; existing full-card swipe renderer automatically consumes expanded taxonomy.
- Search/favorites behavior: unchanged because grouping still happens after filtering.
- No placeholders or unresolved taxonomy names.
- Exact labels that differ from conversational shorthand are preserved: `不要 / 不要这个`, `加 / 增加`, `对不起 / 抱歉`, `可以 / 能`.

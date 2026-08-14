# Thai Daily-Life Speaking Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first `/thai/` GitHub Pages vocabulary site for everyday spoken Thai, with scene navigation, Chinese search, female-form examples, favorites, optional Thai-script display, and independent TTS/audio playback for words, collocations, and example sentences.

**Architecture:** Keep the existing English site untouched and add an isolated static ES-module app under `thai/`. Separate pure search/state/audio logic from DOM rendering so the important behavior can be tested with Node’s built-in test runner and no third-party dependencies. Split vocabulary by scene and aggregate through one data index so 18 scene files stay maintainable.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, Web Speech API (`speechSynthesis`), `localStorage`, Node built-in `node:test`, GitHub Pages.

## Global Constraints

- Spoken usefulness over academic completeness.
- Scene-first navigation, vocabulary-first learning.
- Thai script must remain visually secondary and hideable.
- Romanization and Chinese meaning are primary reading aids.
- Chinese approximate pronunciation is a secondary aid.
- Female polite speech is the v1 default.
- No account, server, database, streaks, points, curriculum progression, or framework in v1.
- V1 target is about 18 scenes with 20–40 high-value entries per scene.
- Every vocabulary entry must have at least 2 collocations and 2 realistic examples unless explicitly justified in data comments.
- Word, collocation, and example sentence playback must each work independently.
- Pre-recorded `audio` URL takes priority when present; otherwise use Thai TTS.
- Persist favorites, Thai-script visibility, and speech speed with `localStorage` only.
- Existing English pages must not be modified or broken by the Thai site.
- GitHub Pages already deploys the repository root, so `/thai/` must work without changing `.github/workflows/pages.yml`.

---

## File Map

### App shell
- Create `thai/index.html` — scene directory, global Chinese search, favorites entry, display/speed controls.
- Create `thai/learn.html` — scene/search/favorites vocabulary view.
- Create `thai/styles.css` — mobile-first layout and card styling.
- Create `thai/package.json` — ES-module mode plus built-in Node test command.
- Create `thai/README.md` — content schema, local testing, and Pages URL.

### JavaScript
- Create `thai/js/core.js` — query parsing, search normalization, entry filtering.
- Create `thai/js/state.js` — safe localStorage access, favorites, Thai visibility, speech speed.
- Create `thai/js/audio.js` — recorded-audio-first playback with injected speech synthesis fallback.
- Create `thai/js/home.js` — render scene directory and home search form.
- Create `thai/js/learn.js` — render vocabulary cards, expanders, filters, favorites, and audio controls.

### Data
- Create `thai/data/scenes.js` — ordered scene metadata.
- Create `thai/data/index.js` — aggregate all scene entry arrays.
- Create one file per scene under `thai/data/`:
  - `restaurant.js`
  - `coffee.js`
  - `convenience.js`
  - `market.js`
  - `taxi.js`
  - `motorbike.js`
  - `directions.js`
  - `petrol.js`
  - `delivery.js`
  - `condo.js`
  - `repairs.js`
  - `laundry.js`
  - `massage.js`
  - `hospital.js`
  - `bank.js`
  - `mobile.js`
  - `greetings.js`
  - `friends.js`

### Tests
- Create `thai/tests/core.test.js` — search/filter/query behavior.
- Create `thai/tests/state.test.js` — persistence defaults and corruption recovery.
- Create `thai/tests/audio.test.js` — TTS selection/rate/cancellation and recorded-audio priority.
- Create `thai/tests/data.test.js` — schema, counts, IDs, playable Thai text, minimum collocations/examples.

---

### Task 1: Static app shell and test harness

**Files:**
- Create: `thai/package.json`
- Create: `thai/index.html`
- Create: `thai/learn.html`
- Create: `thai/styles.css`
- Create: `thai/js/core.js`
- Test: `thai/tests/core.test.js`

**Interfaces:**
- Produces: `normalizeText(value: unknown): string`
- Produces: `parseLearnQuery(search: string): { scene: string|null, q: string, favoritesOnly: boolean }`
- Produces: page DOM hooks used by later tasks: `#scene-grid`, `#global-search`, `#results`, `#page-title`, `#empty-state`, `[data-action="toggle-thai"]`, `[data-action="toggle-speed"]`.

- [ ] **Step 1: Add ES-module test harness**

Create `thai/package.json`:

```json
{
  "name": "thai-life-speak",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js"
  }
}
```

- [ ] **Step 2: Write failing core tests**

Create `thai/tests/core.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, parseLearnQuery } from '../js/core.js';

test('normalizeText trims, lowercases, and collapses spaces', () => {
  assert.equal(normalizeText('  Grab   TAXI  '), 'grab taxi');
});

test('parseLearnQuery reads scene, q, and favorites flag', () => {
  assert.deepEqual(
    parseLearnQuery('?scene=restaurant&q=%E8%BE%A3&favorites=1'),
    { scene: 'restaurant', q: '辣', favoritesOnly: true }
  );
});

test('parseLearnQuery returns safe defaults', () => {
  assert.deepEqual(parseLearnQuery(''), {
    scene: null,
    q: '',
    favoritesOnly: false
  });
});
```

- [ ] **Step 3: Run tests and confirm the intended failure**

Run:

```bash
cd thai && npm test
```

Expected: FAIL because `../js/core.js` does not exist or exported functions are missing.

- [ ] **Step 4: Implement minimal pure query helpers**

Create `thai/js/core.js`:

```js
export function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function parseLearnQuery(search) {
  const params = new URLSearchParams(search || '');
  return {
    scene: params.get('scene') || null,
    q: params.get('q') || '',
    favoritesOnly: params.get('favorites') === '1'
  };
}
```

- [ ] **Step 5: Create semantic HTML shells**

`thai/index.html` must include:

```html
<header class="topbar">
  <div>
    <p class="eyebrow">在泰国，直接开口</p>
    <h1>泰语生活词库</h1>
  </div>
  <nav class="top-actions" aria-label="学习设置">
    <button type="button" data-action="toggle-thai">泰文：显示</button>
    <button type="button" data-action="toggle-speed">语速：正常</button>
  </nav>
</header>

<form id="global-search" class="search-bar" action="learn.html" method="get">
  <label class="sr-only" for="q">搜索中文词汇或场景</label>
  <input id="q" name="q" type="search" placeholder="搜：辣、空调、快递、多少钱…" autocomplete="off">
  <button type="submit">搜索</button>
</form>

<a class="favorites-link" href="learn.html?favorites=1">⭐ 我的收藏</a>
<section id="scene-grid" class="scene-grid" aria-label="生活场景"></section>
```

`thai/learn.html` must include:

```html
<header class="learn-header">
  <a href="./" class="back-link">← 场景</a>
  <div>
    <p class="eyebrow">词汇 → 搭配 → 例句</p>
    <h1 id="page-title">泰语生活词库</h1>
  </div>
  <div class="top-actions">
    <button type="button" data-action="toggle-thai">泰文：显示</button>
    <button type="button" data-action="toggle-speed">语速：正常</button>
  </div>
</header>
<form id="scene-search" class="search-bar">
  <input id="scene-q" type="search" placeholder="在当前内容里搜中文…">
  <button type="submit">搜索</button>
</form>
<main id="results" class="vocab-list"></main>
<div id="empty-state" class="empty-state" hidden>没有找到。换个中文关键词试试。</div>
<div id="toast" role="status" aria-live="polite" class="toast" hidden></div>
```

Each page loads `styles.css` and the corresponding module (`js/home.js` or `js/learn.js`) with `<script type="module">`.

- [ ] **Step 6: Add mobile-first base CSS**

Create `thai/styles.css` with these minimum behaviors:

```css
:root { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: #f7f6f2; color: #1f2933; }
button, input, a { font: inherit; }
button, .scene-card, .favorites-link { min-height: 44px; }
.topbar, .learn-header { padding: 20px 16px 12px; max-width: 960px; margin: 0 auto; }
.search-bar, .scene-grid, .vocab-list, .favorites-link { width: min(100% - 32px, 928px); margin-inline: auto; }
.search-bar { display: flex; gap: 8px; margin-block: 12px 20px; }
.search-bar input { flex: 1; min-width: 0; padding: 12px 14px; }
.scene-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.scene-card, .vocab-card { background: white; border: 1px solid #e5e1d8; border-radius: 16px; padding: 16px; }
.vocab-list { display: grid; gap: 12px; padding-bottom: 48px; }
.roman { font-size: 1.2rem; font-weight: 700; }
.thai { font-size: .95rem; color: #5b6470; }
body.hide-thai .thai { display: none; }
.play-row { display: flex; gap: 8px; flex-wrap: wrap; }
button { cursor: pointer; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (min-width: 720px) { .scene-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
```

Do not add hover-only controls; all essential interactions must be visible/tappable.

- [ ] **Step 7: Run core tests**

Run:

```bash
cd thai && npm test
```

Expected: `core.test.js` passes.

- [ ] **Step 8: Commit Task 1**

```bash
git add thai/package.json thai/index.html thai/learn.html thai/styles.css thai/js/core.js thai/tests/core.test.js
git commit -m "feat: scaffold Thai life vocabulary site"
```

---

### Task 2: Scene registry and searchable vocabulary model

**Files:**
- Create: `thai/data/scenes.js`
- Create: `thai/data/restaurant.js`
- Create: `thai/data/greetings.js`
- Create: `thai/data/index.js`
- Modify: `thai/js/core.js`
- Create: `thai/js/home.js`
- Test: `thai/tests/core.test.js`
- Create: `thai/tests/data.test.js`

**Interfaces:**
- Produces: `SCENES: Array<{id:string,title:string,emoji:string,description:string,keywords:string[]}>`
- Produces: `ENTRIES: VocabularyEntry[]`
- Produces: `filterEntries(entries, {scene, q, favoritesOnly, favoriteIds}): VocabularyEntry[]`
- `VocabularyEntry` shape:

```js
{
  id: 'restaurant-spicy',
  scene: ['restaurant'],
  zh: '辣',
  th: 'เผ็ด',
  roman: 'phèt',
  zhPron: '配特',
  type: '形容词',
  audio: null,
  keywords: ['口味', '辣度'],
  collocations: [
    { th: 'ไม่เผ็ด', roman: 'mâi phèt', zh: '不辣', zhPron: '卖 配特', audio: null },
    { th: 'เผ็ดมาก', roman: 'phèt mâak', zh: '很辣', zhPron: '配特 马', audio: null }
  ],
  examples: [
    { th: 'ไม่เอาเผ็ดค่ะ', roman: 'mâi ao phèt kha', zh: '不要辣。', zhPron: '卖 奥 配特 卡', audio: null },
    { th: 'อันนี้เผ็ดไหมคะ', roman: 'an-níi phèt mái kha', zh: '这个辣吗？', zhPron: '安尼 配特 买 卡', audio: null }
  ]
}
```

- [ ] **Step 1: Extend failing core tests for search**

Append to `thai/tests/core.test.js`:

```js
import { filterEntries } from '../js/core.js';

const sampleEntries = [
  { id: 'a', scene: ['restaurant'], zh: '辣', roman: 'phet', th: 'เผ็ด', keywords: ['口味'], collocations: [{ zh: '不辣' }], examples: [{ zh: '不要辣' }] },
  { id: 'b', scene: ['repairs'], zh: '空调', roman: 'air', th: 'แอร์', keywords: ['维修'], collocations: [{ zh: '空调坏了' }], examples: [{ zh: '请来修空调' }] }
];

test('filterEntries filters by scene', () => {
  assert.deepEqual(filterEntries(sampleEntries, { scene: 'restaurant', q: '', favoritesOnly: false, favoriteIds: [] }).map(x => x.id), ['a']);
});

test('filterEntries finds Chinese text in meaning, keywords, collocations, and examples', () => {
  assert.deepEqual(filterEntries(sampleEntries, { scene: null, q: '维修', favoritesOnly: false, favoriteIds: [] }).map(x => x.id), ['b']);
  assert.deepEqual(filterEntries(sampleEntries, { scene: null, q: '不要辣', favoritesOnly: false, favoriteIds: [] }).map(x => x.id), ['a']);
});

test('filterEntries supports favorites-only mode', () => {
  assert.deepEqual(filterEntries(sampleEntries, { scene: null, q: '', favoritesOnly: true, favoriteIds: ['b'] }).map(x => x.id), ['b']);
});
```

- [ ] **Step 2: Run test and confirm failure**

```bash
cd thai && npm test
```

Expected: FAIL because `filterEntries` is missing.

- [ ] **Step 3: Implement `filterEntries`**

Add to `thai/js/core.js`:

```js
function searchableText(entry) {
  return normalizeText([
    entry.zh,
    entry.th,
    entry.roman,
    ...(entry.keywords || []),
    ...(entry.collocations || []).flatMap(item => [item.zh, item.th, item.roman]),
    ...(entry.examples || []).flatMap(item => [item.zh, item.th, item.roman])
  ].filter(Boolean).join(' '));
}

export function filterEntries(entries, { scene = null, q = '', favoritesOnly = false, favoriteIds = [] } = {}) {
  const needle = normalizeText(q);
  const favorites = new Set(favoriteIds || []);
  return entries.filter(entry => {
    if (scene && !(entry.scene || []).includes(scene)) return false;
    if (favoritesOnly && !favorites.has(entry.id)) return false;
    if (needle && !searchableText(entry).includes(needle)) return false;
    return true;
  });
}
```

- [ ] **Step 4: Create the exact 18-scene registry**

Create `thai/data/scenes.js` with this ordered list:

```js
export const SCENES = [
  { id: 'restaurant', title: '餐厅 / 路边摊', emoji: '🍜', description: '点菜、口味、加减配料、结账', keywords: ['点餐', '吃饭', '口味'] },
  { id: 'coffee', title: '咖啡 / 奶茶', emoji: '☕', description: '甜度、冰量、杯型、外带', keywords: ['咖啡', '奶茶', '饮料'] },
  { id: 'convenience', title: '便利店 / 超市', emoji: '🛒', description: '找商品、数量、袋子、付款', keywords: ['711', '超市', '购物'] },
  { id: 'market', title: '市场 / 水果摊', emoji: '🥭', description: '水果、称重、挑选、砍价', keywords: ['市场', '水果', '价格'] },
  { id: 'taxi', title: 'Taxi / Bolt / Grab', emoji: '🚕', description: '上车、目的地、路线、停车', keywords: ['打车', 'grab', 'bolt'] },
  { id: 'motorbike', title: '摩托车 / 停车', emoji: '🛵', description: '摩托、头盔、停车、修车', keywords: ['摩托', '停车'] },
  { id: 'directions', title: '问路 / 找地方', emoji: '🗺️', description: '左右、前后、附近、楼层', keywords: ['问路', '方向'] },
  { id: 'petrol', title: '加油站', emoji: '⛽', description: '油号、加满、金额、胎压', keywords: ['加油', '汽油'] },
  { id: 'delivery', title: '快递 / 外卖', emoji: '📦', description: '送到、放门口、打电话、取件', keywords: ['快递', '外卖', '送货'] },
  { id: 'condo', title: '公寓 / 物业 / 租房', emoji: '🏠', description: '房间、合同、物业、设施', keywords: ['公寓', '物业', '租房'] },
  { id: 'repairs', title: '维修 / 水电 / 空调', emoji: '🔧', description: '坏了、漏水、停电、预约维修', keywords: ['维修', '空调', '水电'] },
  { id: 'laundry', title: '洗衣店', emoji: '🧺', description: '洗、烘、熨、取衣时间', keywords: ['洗衣', '烘干'] },
  { id: 'massage', title: '按摩 / 美容', emoji: '💆', description: '力度、部位、时间、预约', keywords: ['按摩', '美容'] },
  { id: 'hospital', title: '医院 / 药店', emoji: '🏥', description: '症状、疼痛、过敏、买药', keywords: ['医院', '药店', '生病'] },
  { id: 'bank', title: '银行 / 付款', emoji: '🏦', description: '转账、现金、扫码、零钱', keywords: ['银行', '付款', '转账'] },
  { id: 'mobile', title: '手机 / 网络 / 电话', emoji: '📱', description: '套餐、网速、信号、打电话', keywords: ['手机', '网络', '电话'] },
  { id: 'greetings', title: '日常寒暄', emoji: '👋', description: '见面、感谢、道歉、简单回应', keywords: ['你好', '谢谢', '寒暄'] },
  { id: 'friends', title: '朋友聊天 / 社交', emoji: '👭', description: '约时间、感受、计划、聊天', keywords: ['朋友', '聊天', '社交'] }
];
```

- [ ] **Step 5: Seed restaurant and greetings files with schema-valid entries**

Create `thai/data/restaurant.js` and `thai/data/greetings.js`. Use the exact object shape above and start with at least 6 entries per file so UI development has realistic data. Restaurant seed meanings must include: `辣`, `甜`, `咸`, `不要`, `加`, `结账`. Greetings seed meanings must include: `你好`, `谢谢`, `没关系`, `对不起`, `可以`, `不知道`.

For every seed entry:

```js
export const restaurantEntries = [
  {
    id: 'restaurant-spicy',
    scene: ['restaurant'],
    zh: '辣',
    th: 'เผ็ด',
    roman: 'phèt',
    zhPron: '配特',
    type: '形容词',
    audio: null,
    keywords: ['口味', '辣度'],
    collocations: [
      { th: 'ไม่เผ็ด', roman: 'mâi phèt', zh: '不辣', zhPron: '卖 配特', audio: null },
      { th: 'เผ็ดมาก', roman: 'phèt mâak', zh: '很辣', zhPron: '配特 马', audio: null }
    ],
    examples: [
      { th: 'ไม่เอาเผ็ดค่ะ', roman: 'mâi ao phèt kha', zh: '不要辣。', zhPron: '卖 奥 配特 卡', audio: null },
      { th: 'อันนี้เผ็ดไหมคะ', roman: 'an-níi phèt mái kha', zh: '这个辣吗？', zhPron: '安尼 配特 买 卡', audio: null }
    ]
  }
];
```

- [ ] **Step 6: Aggregate the two seed modules**

Create `thai/data/index.js`:

```js
import { restaurantEntries } from './restaurant.js';
import { greetingsEntries } from './greetings.js';

export const ENTRIES = [
  ...restaurantEntries,
  ...greetingsEntries
];
```

- [ ] **Step 7: Add data schema tests**

Create `thai/tests/data.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES } from '../data/scenes.js';
import { ENTRIES } from '../data/index.js';

const sceneIds = new Set(SCENES.map(s => s.id));

test('scene registry contains exactly 18 unique scenes', () => {
  assert.equal(SCENES.length, 18);
  assert.equal(sceneIds.size, 18);
});

test('seed vocabulary has unique IDs and valid playable data', () => {
  const ids = new Set();
  for (const entry of ENTRIES) {
    assert.ok(entry.id && !ids.has(entry.id));
    ids.add(entry.id);
    assert.ok(entry.scene.length >= 1 && entry.scene.every(id => sceneIds.has(id)));
    assert.ok(entry.zh && entry.th && entry.roman && entry.zhPron);
    assert.ok(Array.isArray(entry.collocations) && entry.collocations.length >= 2);
    assert.ok(Array.isArray(entry.examples) && entry.examples.length >= 2);
    for (const item of [...entry.collocations, ...entry.examples]) {
      assert.ok(item.th && item.roman && item.zh);
    }
  }
});
```

- [ ] **Step 8: Render scene cards on home page**

Create `thai/js/home.js`:

```js
import { SCENES } from '../data/scenes.js';

const grid = document.querySelector('#scene-grid');

grid.innerHTML = SCENES.map(scene => `
  <a class="scene-card" href="learn.html?scene=${encodeURIComponent(scene.id)}">
    <span class="scene-emoji" aria-hidden="true">${scene.emoji}</span>
    <strong>${scene.title}</strong>
    <small>${scene.description}</small>
  </a>
`).join('');
```

Add the simple `global-search` GET flow from Task 1 unchanged; it naturally navigates to `learn.html?q=...`.

- [ ] **Step 9: Run tests**

```bash
cd thai && npm test
```

Expected: all current tests pass.

- [ ] **Step 10: Commit Task 2**

```bash
git add thai/data thai/js/core.js thai/js/home.js thai/tests/core.test.js thai/tests/data.test.js
git commit -m "feat: add Thai scene registry and vocabulary model"
```

---

### Task 3: Persistent learner settings and favorites

**Files:**
- Create: `thai/js/state.js`
- Test: `thai/tests/state.test.js`
- Modify: `thai/js/home.js`
- Modify: `thai/js/learn.js` (created in Task 5; if executing strictly in order, only implement state exports now and wire home controls; Task 5 wires learn controls)

**Interfaces:**
- Produces: `createState(storage): LearnerStateAPI`
- `LearnerStateAPI` methods:
  - `getFavorites(): string[]`
  - `isFavorite(id: string): boolean`
  - `toggleFavorite(id: string): boolean` returns new favorite state
  - `getShowThai(): boolean`
  - `setShowThai(value: boolean): void`
  - `getSpeechRate(): 'normal'|'slow'`
  - `setSpeechRate(value: 'normal'|'slow'): void`
- Storage keys: `thai-life:favorites`, `thai-life:show-thai`, `thai-life:speech-rate`.

- [ ] **Step 1: Write failing state tests**

Create `thai/tests/state.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../js/state.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key)
  };
}

test('defaults are empty favorites, Thai shown, normal speed', () => {
  const state = createState(memoryStorage());
  assert.deepEqual(state.getFavorites(), []);
  assert.equal(state.getShowThai(), true);
  assert.equal(state.getSpeechRate(), 'normal');
});

test('favorite toggle persists and returns new state', () => {
  const state = createState(memoryStorage());
  assert.equal(state.toggleFavorite('restaurant-spicy'), true);
  assert.equal(state.isFavorite('restaurant-spicy'), true);
  assert.equal(state.toggleFavorite('restaurant-spicy'), false);
  assert.equal(state.isFavorite('restaurant-spicy'), false);
});

test('corrupt storage safely falls back to defaults', () => {
  const state = createState(memoryStorage({
    'thai-life:favorites': '{bad json',
    'thai-life:show-thai': 'maybe',
    'thai-life:speech-rate': 'fast'
  }));
  assert.deepEqual(state.getFavorites(), []);
  assert.equal(state.getShowThai(), true);
  assert.equal(state.getSpeechRate(), 'normal');
});
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd thai && npm test
```

Expected: FAIL because `state.js` does not exist.

- [ ] **Step 3: Implement safe state wrapper**

Create `thai/js/state.js`:

```js
const KEYS = {
  favorites: 'thai-life:favorites',
  showThai: 'thai-life:show-thai',
  speechRate: 'thai-life:speech-rate'
};

export function createState(storage) {
  function readFavorites() {
    try {
      const value = JSON.parse(storage.getItem(KEYS.favorites) || '[]');
      return Array.isArray(value) ? value.filter(x => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  return {
    getFavorites: readFavorites,
    isFavorite(id) { return readFavorites().includes(id); },
    toggleFavorite(id) {
      const current = new Set(readFavorites());
      const next = !current.has(id);
      next ? current.add(id) : current.delete(id);
      storage.setItem(KEYS.favorites, JSON.stringify([...current]));
      return next;
    },
    getShowThai() {
      const raw = storage.getItem(KEYS.showThai);
      return raw === null ? true : raw === 'true' ? true : raw === 'false' ? false : true;
    },
    setShowThai(value) { storage.setItem(KEYS.showThai, String(Boolean(value))); },
    getSpeechRate() {
      const raw = storage.getItem(KEYS.speechRate);
      return raw === 'slow' ? 'slow' : 'normal';
    },
    setSpeechRate(value) { storage.setItem(KEYS.speechRate, value === 'slow' ? 'slow' : 'normal'); }
  };
}

export const learnerState = typeof window !== 'undefined'
  ? createState(window.localStorage)
  : null;
```

- [ ] **Step 4: Wire shared controls on the home page**

In `thai/js/home.js`, import `learnerState`, apply `body.classList.toggle('hide-thai', !showThai)`, and bind both global buttons. The speed toggle alternates `normal ↔ slow`; Thai toggle alternates `true ↔ false`. Button copy must update immediately to `泰文：显示/隐藏` and `语速：正常/慢速`.

- [ ] **Step 5: Run tests**

```bash
cd thai && npm test
```

Expected: all current tests pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add thai/js/state.js thai/js/home.js thai/tests/state.test.js
git commit -m "feat: persist Thai learner settings and favorites"
```

---

### Task 4: Audio engine with recorded-audio priority and Thai TTS fallback

**Files:**
- Create: `thai/js/audio.js`
- Test: `thai/tests/audio.test.js`

**Interfaces:**
- Produces: `createAudioEngine({ speechSynthesis, SpeechSynthesisUtterance, AudioCtor }): AudioEngine`
- `AudioEngine.play(item, speed): Promise<{ mode: 'audio'|'tts' }>`
- `item` shape: `{ th: string, audio?: string|null }`
- Speed mapping: `normal → 0.9`, `slow → 0.65`.
- Throws `Error('NO_THAI_VOICE')` if no `th-TH`/`th` speech voice exists and no recording is available.

- [ ] **Step 1: Write failing audio tests using fakes**

Create `thai/tests/audio.test.js` covering these exact behaviors:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioEngine } from '../js/audio.js';

class FakeUtterance { constructor(text) { this.text = text; this.lang = ''; this.rate = 1; this.voice = null; } }

function fakeSynth(voices) {
  return {
    cancelCalls: 0,
    spoken: [],
    getVoices: () => voices,
    cancel() { this.cancelCalls += 1; },
    speak(utterance) { this.spoken.push(utterance); utterance.onend?.(); }
  };
}

test('TTS cancels current speech, selects Thai voice, and uses slow rate', async () => {
  const synth = fakeSynth([{ name: 'English', lang: 'en-US' }, { name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: null });
  const result = await engine.play({ th: 'เผ็ด', audio: null }, 'slow');
  assert.equal(result.mode, 'tts');
  assert.equal(synth.cancelCalls, 1);
  assert.equal(synth.spoken[0].voice.name, 'Thai');
  assert.equal(synth.spoken[0].rate, 0.65);
});

test('recorded audio is used before TTS', async () => {
  const played = [];
  class FakeAudio {
    constructor(src) { this.src = src; }
    play() { played.push(this.src); return Promise.resolve(); }
    pause() {}
  }
  const synth = fakeSynth([{ name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: FakeAudio });
  const result = await engine.play({ th: 'เผ็ด', audio: 'audio/phet.mp3' }, 'normal');
  assert.equal(result.mode, 'audio');
  assert.deepEqual(played, ['audio/phet.mp3']);
  assert.equal(synth.spoken.length, 0);
});

test('missing Thai voice throws a stable error', async () => {
  const synth = fakeSynth([{ name: 'English', lang: 'en-US' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: null });
  await assert.rejects(() => engine.play({ th: 'เผ็ด', audio: null }, 'normal'), /NO_THAI_VOICE/);
});
```

- [ ] **Step 2: Run tests and confirm failure**

```bash
cd thai && npm test
```

Expected: FAIL because `audio.js` does not exist.

- [ ] **Step 3: Implement audio engine**

Create `thai/js/audio.js` with:

```js
export function createAudioEngine({ speechSynthesis, SpeechSynthesisUtterance, AudioCtor }) {
  let currentAudio = null;

  function stop() {
    speechSynthesis?.cancel?.();
    if (currentAudio) {
      currentAudio.pause?.();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  async function play(item, speed = 'normal') {
    stop();

    if (item.audio && AudioCtor) {
      currentAudio = new AudioCtor(item.audio);
      await currentAudio.play();
      return { mode: 'audio' };
    }

    const voices = speechSynthesis?.getVoices?.() || [];
    const voice = voices.find(v => /^th(-|$)/i.test(v.lang || ''));
    if (!voice) throw new Error('NO_THAI_VOICE');

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(item.th);
      utterance.lang = 'th-TH';
      utterance.voice = voice;
      utterance.rate = speed === 'slow' ? 0.65 : 0.9;
      utterance.onend = () => resolve({ mode: 'tts' });
      utterance.onerror = () => reject(new Error('TTS_FAILED'));
      speechSynthesis.speak(utterance);
    });
  }

  return { play, stop };
}

export const audioEngine = typeof window !== 'undefined'
  ? createAudioEngine({
      speechSynthesis: window.speechSynthesis,
      SpeechSynthesisUtterance: window.SpeechSynthesisUtterance,
      AudioCtor: window.Audio
    })
  : null;
```

- [ ] **Step 4: Run audio tests**

```bash
cd thai && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit Task 4**

```bash
git add thai/js/audio.js thai/tests/audio.test.js
git commit -m "feat: add Thai recorded audio and TTS playback engine"
```

---

### Task 5: Vocabulary page rendering, expanders, search, favorites, and playback

**Files:**
- Create: `thai/js/learn.js`
- Modify: `thai/styles.css`
- Modify: `thai/tests/core.test.js`

**Interfaces:**
- Consumes: `ENTRIES`, `SCENES`, `parseLearnQuery`, `filterEntries`, `learnerState`, `audioEngine`.
- Produces browser behavior only; no new cross-task public API.

- [ ] **Step 1: Add one escaping helper test before interpolating content**

Append to `thai/tests/core.test.js`:

```js
import { escapeHtml } from '../js/core.js';

test('escapeHtml protects rendered data fields', () => {
  assert.equal(escapeHtml('<b>"辣" & test</b>'), '&lt;b&gt;&quot;辣&quot; &amp; test&lt;/b&gt;');
});
```

- [ ] **Step 2: Run test and confirm failure**

```bash
cd thai && npm test
```

Expected: FAIL because `escapeHtml` is missing.

- [ ] **Step 3: Implement escaping**

Add to `thai/js/core.js`:

```js
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
```

- [ ] **Step 4: Implement `learn.js` rendering and interaction flow**

`thai/js/learn.js` must:

1. Parse initial `scene/q/favorites` query.
2. Resolve page title from `SCENES` or use `搜索结果` / `我的收藏`.
3. Filter `ENTRIES` through `filterEntries`.
4. Render cards with Chinese meaning first, romanization prominent, Thai secondary, Chinese pronunciation aid visible.
5. Render two `<details>` sections per card: `常用搭配` and `例句`.
6. Give every word/collocation/example a `data-play-th`, `data-play-audio`, and play button.
7. Toggle favorites without page reload and update the star button.
8. In favorites-only mode, immediately remove an item from the list when it is unfavorited.
9. Apply and persist show/hide Thai and normal/slow controls.
10. On `NO_THAI_VOICE`, show `当前设备没有可用的泰语语音。可以换 Chrome / Safari 或在系统里安装泰语语音。` in `#toast`.
11. On other audio errors, show `播放失败，请再试一次。`.
12. Cancel current speech before new playback through `audioEngine.play` behavior.
13. Submit scene search without full-page navigation by updating the in-memory query and rerendering.

Use this card structure:

```html
<article class="vocab-card" data-entry-id="restaurant-spicy">
  <div class="vocab-head">
    <div>
      <h2>辣</h2>
      <div class="thai">เผ็ด</div>
      <div class="roman">phèt</div>
      <div class="zh-pron">中文近似音：配特</div>
    </div>
    <button type="button" class="favorite-btn" aria-label="收藏 辣">☆</button>
  </div>
  <div class="play-row">
    <button type="button" class="play-btn" data-play-index="entry">🔊 听单词</button>
  </div>
  <details>
    <summary>常用搭配</summary>
    <div class="phrase-list">…</div>
  </details>
  <details>
    <summary>例句</summary>
    <div class="phrase-list">…</div>
  </details>
</article>
```

Do not inject raw data without `escapeHtml`.

- [ ] **Step 5: Complete mobile styling for vocabulary cards**

Add styles for:

```css
.vocab-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.vocab-head h2 { margin: 0 0 4px; font-size: 1.45rem; }
.zh-pron { margin-top: 4px; color: #6b7280; }
.favorite-btn { min-width: 44px; border-radius: 999px; }
details { margin-top: 12px; border-top: 1px solid #ece8df; padding-top: 10px; }
summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; font-weight: 700; }
.phrase-item { display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 12px 0; border-top: 1px dashed #ece8df; }
.phrase-main { min-width: 0; }
.empty-state { width: min(100% - 32px, 928px); margin: 32px auto; text-align: center; }
.toast { position: fixed; left: 16px; right: 16px; bottom: 16px; max-width: 560px; margin: 0 auto; padding: 12px 14px; background: #1f2933; color: white; border-radius: 12px; }
```

- [ ] **Step 6: Run all tests**

```bash
cd thai && npm test
```

Expected: all unit/data tests pass.

- [ ] **Step 7: Manual local smoke test**

Run:

```bash
python3 -m http.server 8000
```

Open `/thai/` and verify:
- all 18 scene cards appear;
- restaurant scene opens;
- `辣` can be found via global search;
- collocations/examples expand;
- Thai hide/show toggles;
- normal/slow toggle updates label;
- favorites survive refresh;
- play buttons trigger Thai speech on a device with Thai TTS.

- [ ] **Step 8: Commit Task 5**

```bash
git add thai/js/core.js thai/js/learn.js thai/styles.css thai/tests/core.test.js
git commit -m "feat: build Thai vocabulary browsing interactions"
```

---

### Task 6: Expand food and transport content to v1 depth

**Files:**
- Modify: `thai/data/restaurant.js`
- Create: `thai/data/coffee.js`
- Create: `thai/data/convenience.js`
- Create: `thai/data/market.js`
- Create: `thai/data/taxi.js`
- Create: `thai/data/motorbike.js`
- Create: `thai/data/directions.js`
- Create: `thai/data/petrol.js`
- Modify: `thai/data/index.js`
- Modify: `thai/tests/data.test.js`

**Interfaces:**
- Consumes and follows the exact `VocabularyEntry` schema from Task 2.
- Produces at least 20 entries in each of these 8 scene arrays.

- [ ] **Step 1: Tighten data test for completed scenes**

Add to `thai/tests/data.test.js`:

```js
const REQUIRED_COUNTS = new Map([
  ['restaurant', 20], ['coffee', 20], ['convenience', 20], ['market', 20],
  ['taxi', 20], ['motorbike', 20], ['directions', 20], ['petrol', 20]
]);

test('food and transport scenes have v1 vocabulary depth', () => {
  for (const [scene, min] of REQUIRED_COUNTS) {
    const count = ENTRIES.filter(entry => entry.scene.includes(scene)).length;
    assert.ok(count >= min, `${scene} has ${count}, expected >= ${min}`);
  }
});
```

- [ ] **Step 2: Run tests and confirm count failures**

```bash
cd thai && npm test
```

Expected: FAIL for scenes not yet at 20 entries.

- [ ] **Step 3: Author restaurant/coffee/convenience/market entries**

Each scene must include at least these 20 Chinese concepts as separate or clearly equivalent core entries, with Thai, romanization, Chinese approximate pronunciation, 2+ collocations, and 2+ natural examples:

```text
restaurant: 辣, 甜, 咸, 酸, 淡, 好吃, 不要, 要, 加, 少一点, 多一点, 水, 冰, 米饭, 面, 肉, 鸡, 猪, 鱼, 结账
coffee: 咖啡, 茶, 奶, 糖, 甜, 不甜, 少甜, 冰, 少冰, 不加冰, 热, 冷, 大杯, 小杯, 外带, 在这里喝, 加一份, 浓, 淡, 吸管
convenience: 找, 有吗, 没有, 这个, 那个, 多少钱, 一个, 两个, 袋子, 不要袋子, 现金, 扫码, 卡, 收据, 水, 纸巾, 充电器, 电池, 洗发水, 厕所
market: 贵, 便宜, 多少钱, 一公斤, 半公斤, 称, 新鲜, 熟, 生, 甜, 酸, 大, 小, 这个, 那个, 要, 不要, 再便宜一点, 帮我挑, 袋子
```

All polite request/question examples should use female endings (`ค่ะ` / `คะ`) where natural.

- [ ] **Step 4: Author taxi/motorbike/directions/petrol entries**

Minimum concepts:

```text
taxi: 去, 到这里, 地址, 左转, 右转, 直走, 掉头, 停这里, 前面, 后面, 快一点, 慢一点, 堵车, 高速, 不走高速, 多少钱, 打表, 等一下, 到了, 我下车
motorbike: 摩托车, 头盔, 停车, 停这里, 禁止停车, 钥匙, 油, 轮胎, 胎压, 刹车, 坏了, 修, 换, 租, 一天, 一个月, 多少钱, 慢一点, 小心, 入口
 directions: 左边, 右边, 前面, 后面, 直走, 附近, 远, 近, 哪里, 在哪里, 这里, 那里, 楼上, 楼下, 一楼, 二楼, 入口, 出口, 路口, 走路
petrol: 加油, 汽油, 柴油, 91, 95, E20, 加满, 加500铢, 多少钱, 现金, 扫码, 收据, 胎压, 充气, 水, 厕所, 便利店, 入口, 出口, 等一下
```

The leading space in `directions` above is formatting only; the scene id remains `directions`.

- [ ] **Step 5: Aggregate all eight modules in `data/index.js`**

Import each scene array and spread it into `ENTRIES`. Keep imports and spreads in the same order as `SCENES`.

- [ ] **Step 6: Run tests**

```bash
cd thai && npm test
```

Expected: all tests pass, including >=20 entries for all eight scenes.

- [ ] **Step 7: Commit Task 6**

```bash
git add thai/data thai/tests/data.test.js
git commit -m "content: add Thai food and transport vocabulary"
```

---

### Task 7: Expand home, services, and social content to v1 depth

**Files:**
- Create: `thai/data/delivery.js`
- Create: `thai/data/condo.js`
- Create: `thai/data/repairs.js`
- Create: `thai/data/laundry.js`
- Create: `thai/data/massage.js`
- Create: `thai/data/hospital.js`
- Create: `thai/data/bank.js`
- Create: `thai/data/mobile.js`
- Modify: `thai/data/greetings.js`
- Create: `thai/data/friends.js`
- Modify: `thai/data/index.js`
- Modify: `thai/tests/data.test.js`

**Interfaces:**
- Consumes the same `VocabularyEntry` schema.
- Produces at least 20 entries in each of the remaining 10 scenes.

- [ ] **Step 1: Extend the count test to all 18 scenes**

Replace `REQUIRED_COUNTS` with:

```js
const REQUIRED_COUNTS = new Map([
  ['restaurant', 20], ['coffee', 20], ['convenience', 20], ['market', 20],
  ['taxi', 20], ['motorbike', 20], ['directions', 20], ['petrol', 20],
  ['delivery', 20], ['condo', 20], ['repairs', 20], ['laundry', 20],
  ['massage', 20], ['hospital', 20], ['bank', 20], ['mobile', 20],
  ['greetings', 20], ['friends', 20]
]);

test('every v1 scene has at least 20 vocabulary entries', () => {
  for (const [scene, min] of REQUIRED_COUNTS) {
    const count = ENTRIES.filter(entry => entry.scene.includes(scene)).length;
    assert.ok(count >= min, `${scene} has ${count}, expected >= ${min}`);
  }
});
```

- [ ] **Step 2: Run tests and confirm remaining scene failures**

```bash
cd thai && npm test
```

Expected: FAIL for unfinished scenes.

- [ ] **Step 3: Author delivery/condo/repairs/laundry/massage content**

Minimum concepts:

```text
delivery: 快递, 外卖, 送到, 到了, 在楼下, 在大厅, 放门口, 放前台, 打电话, 不用打电话, 等一下, 马上下来, 房间号, 地址, 找不到, 入口, 电梯, 现金, 扫码, 取件
condo: 公寓, 房间, 房租, 押金, 合同, 一个月, 一年, 物业, 前台, 门卡, 钥匙, 停车位, 游泳池, 健身房, 电费, 水费, 网络, 续租, 搬走, 有问题
repairs: 坏了, 修, 空调, 不冷, 漏水, 没水, 停电, 灯, 插座, 门, 锁, 冰箱, 洗衣机, 热水器, 网络, 什么时候, 今天, 明天, 可以来吗, 修好了吗
laundry: 洗衣, 烘干, 熨衣服, 干洗, 洗衣机, 烘干机, 洗衣液, 柔顺剂, 一公斤, 一件, 白色, 彩色, 一起洗, 分开洗, 今天, 明天, 几点取, 多少钱, 取衣服, 袋子
massage: 按摩, 泰式按摩, 精油按摩, 脚底按摩, 头, 肩膀, 背, 腿, 脚, 痛, 轻一点, 重一点, 可以, 不可以, 一小时, 两小时, 预约, 现在, 等多久, 多少钱
```

- [ ] **Step 4: Author hospital/bank/mobile content**

Minimum concepts:

```text
hospital: 医院, 药店, 医生, 药, 生病, 发烧, 咳嗽, 喉咙痛, 头痛, 肚子痛, 拉肚子, 过敏, 痛, 很痛, 受伤, 什么时候开始, 今天, 昨天, 吃几次, 有副作用吗
bank: 银行, 现金, 卡, 转账, 扫码, 二维码, 账户, 账号, 开户, 取钱, 存钱, 换钱, 泰铢, 手续费, 密码, 签名, 收据, 失败, 成功, 可以刷卡吗
mobile: 手机, 电话, 号码, SIM卡, 套餐, 网络, Wi-Fi, 信号, 没信号, 网速慢, 流量, 充值, 一个月, 自动续费, 取消, 打电话, 接电话, 发消息, 密码, 重启
```

Medical examples must remain basic communication aids, not diagnostic advice.

- [ ] **Step 5: Expand greetings/friends content**

Minimum concepts:

```text
greetings: 你好, 谢谢, 不客气, 没关系, 对不起, 不好意思, 可以, 不可以, 是, 不是, 有, 没有, 知道, 不知道, 明白, 不明白, 等一下, 没事, 再见, 慢慢来
friends: 今天, 明天, 昨天, 有空吗, 一起去, 去哪里, 吃饭, 喝一杯, 什么时候, 几点, 我到了, 还没到, 快到了, 很累, 很开心, 很喜欢, 不喜欢, 没问题, 下次, 联系我
```

- [ ] **Step 6: Aggregate all remaining modules in `data/index.js`**

Keep imports/spreads ordered exactly like `SCENES` to make maintenance and diff review predictable.

- [ ] **Step 7: Strengthen schema test for global content**

Add these assertions inside the per-entry loop in `thai/tests/data.test.js`:

```js
assert.ok(entry.id.startsWith(`${entry.scene[0]}-`), `${entry.id} should be prefixed by primary scene`);
assert.ok(entry.audio === null || typeof entry.audio === 'string');
for (const item of [...entry.collocations, ...entry.examples]) {
  assert.ok(item.audio === null || typeof item.audio === 'string');
  assert.ok(item.zh.length > 0 && item.th.length > 0 && item.roman.length > 0);
}
```

- [ ] **Step 8: Run tests**

```bash
cd thai && npm test
```

Expected: all tests pass with at least 360 vocabulary entries total (18 × 20 minimum), each with 2+ collocations and 2+ examples.

- [ ] **Step 9: Commit Task 7**

```bash
git add thai/data thai/tests/data.test.js
git commit -m "content: complete Thai daily-life vocabulary scenes"
```

---

### Task 8: Documentation, responsive QA, and GitHub Pages release verification

**Files:**
- Create: `thai/README.md`
- Modify: `README.md` only by adding a separate Thai-site link; do not alter existing English training content.
- Modify: `thai/styles.css` only for defects discovered in QA.
- Modify: app/data files only for verified defects discovered in QA.

**Interfaces:**
- No new public JS API.
- Release URL target: `https://succuvivi.github.io/english-deep-talk-plan/thai/`.

- [ ] **Step 1: Create Thai maintenance README**

`thai/README.md` must document:

```markdown
# 泰语生活词库

面向在泰国生活、以“能开口”为目标的中文用户。

## 本地运行

```bash
python3 -m http.server 8000
```

打开 `http://localhost:8000/thai/`。

## 测试

```bash
cd thai
npm test
```

## 内容结构

每个词条包含中文、泰文、罗马音、中文近似音、2+ 常用搭配、2+ 真实例句，以及可选 `audio` 路径。

音频规则：有 `audio` 文件时优先播放；否则使用设备的泰语 TTS。

## 发布

推送到 `main` 后，现有 GitHub Pages workflow 会部署整个仓库；泰语站地址：
`https://succuvivi.github.io/english-deep-talk-plan/thai/`
```

- [ ] **Step 2: Add a non-invasive Thai link to root README**

Append after the existing English site intro, without deleting/rewording existing sections:

```markdown
## 🇹🇭 泰语生活词库

👉 **[打开按生活场景学习的泰语词汇 + 搭配 + 例句点读网站](https://succuvivi.github.io/english-deep-talk-plan/thai/)**
```

- [ ] **Step 3: Run full automated verification**

```bash
cd thai && npm test
```

Expected: zero failing tests; data count >=360; all entries schema-valid.

- [ ] **Step 4: Run local static-server verification**

```bash
python3 -m http.server 8000
```

Verify at 360 px, 390–430 px, tablet width, and desktop width:

- scene cards do not overflow;
- vocabulary cards do not overflow;
- every action is tappable without hover;
- Thai hide/show keeps Chinese + romanization usable;
- details expand/collapse cleanly;
- empty state appears for a nonsense query;
- favorite state survives reload;
- speed state survives reload;
- Thai visibility survives reload;
- global Chinese search `空调` returns repair/mobile-relevant results;
- `restaurant` scene includes at least 20 entries;
- `hospital` wording stays basic communication only;
- all audio buttons are individually wired.

- [ ] **Step 5: Verify existing English root remains reachable locally**

With the same server, open `/` and confirm the existing English landing page still loads before checking `/thai/`.

- [ ] **Step 6: Commit release-ready documentation/QA fixes**

```bash
git add README.md thai
git commit -m "docs: publish Thai life vocabulary site"
```

- [ ] **Step 7: Push main and verify Pages deployment**

After pushing, inspect the GitHub Pages workflow for the release commit. The repository workflow uploads `path: .`, so no workflow edit is expected.

Verify these public URLs return the intended pages:

```text
https://succuvivi.github.io/english-deep-talk-plan/
https://succuvivi.github.io/english-deep-talk-plan/thai/
```

If the Pages run fails, debug the actual workflow run instead of changing unrelated site files.

---

## Plan Self-Review

### Spec coverage
- Scene-first navigation: Tasks 1, 2, 5.
- 18 scenes: Task 2.
- 20–40 entries per scene: Tasks 6–7 enforce >=20; content authors should stop at <=40 unless a scene genuinely needs more.
- Vocabulary + collocations + examples: Tasks 2, 6, 7 plus schema tests.
- Female polite forms: Global constraint + content tasks.
- Thai + romanization + Chinese pronunciation aid: Tasks 2 and 5.
- Independent playback: Tasks 4–5.
- Recorded audio future path: Tasks 2 and 4.
- Normal/slow speech: Tasks 3–5.
- Chinese search: Tasks 2 and 5.
- Favorites/local persistence: Tasks 3 and 5.
- Thai show/hide: Tasks 3 and 5.
- Mobile-first: Tasks 1, 5, 8.
- Static GitHub Pages: Tasks 1 and 8.
- Existing English site isolation: file map + Task 8.
- Missing voice/error handling: Tasks 4–5.

### Placeholder scan
No TBD/TODO/future implementation placeholders are used. Future-compatible recorded audio is implemented as a real optional field and precedence rule, not deferred architecture.

### Type consistency
`scene`, `q`, `favoritesOnly`, favorite IDs, `audio`, state key names, speed values (`normal|slow`), and audio engine signatures are consistent across tasks.

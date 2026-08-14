# Thai Life Talk Standalone Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the approved Thai learning site into a new standalone `succuvivi/thai-life-talk` repository with Thai Life Talk branding, independent GitHub Pages deployment, preserved human-audio provenance, and then remove the Thai site from `english-deep-talk-plan` after standalone verification.

**Architecture:** Treat the current feature branch as the migration source of truth. Re-root the existing `thai/` application to the new repository root, add a real branded landing page and standalone workflows, then verify public Pages before deleting any Thai production files from the English repository. The migration preserves existing data, swipe behavior, human audio files, attribution metadata, and device-TTS fallback.

**Tech Stack:** Static HTML/CSS/ES modules, Node.js tests, GitHub Actions, GitHub Pages, GitHub REST/connector tooling.

## Global Constraints

- Product name is exactly `Thai Life Talk`.
- Chinese subtitle is exactly `泰国生活口语 · 真实场景开口就用`.
- New repository is `succuvivi/thai-life-talk`.
- Public Pages URL is `https://succuvivi.github.io/thai-life-talk/`.
- Site lives at repository root, never under `/thai/` in the new repository.
- Preserve all 18 scenes and all 360 entries.
- Preserve native full-card horizontal scroll-snap and remove visible previous/next arrows.
- Preserve verified local human audio and `audio/sources.json` attribution.
- Human audio normal rate is `1.0`; slow rate is approximately `0.8`.
- Audio fallback must synthesize exact Thai `item.th`, never romanization or Chinese near-pronunciation.
- No runtime API key.
- No login, streaks, points, leaderboard, or account progress system.
- Only after standalone public verification may Thai production files be removed from `english-deep-talk-plan`.

---

### Task 1: Create the standalone repository and import the approved Thai application

**Files:**
- Create repo: `succuvivi/thai-life-talk`
- Create at root: `learn.html`, `audio-sources.html`, `styles.css`, `package.json`, `README.md`
- Create directories: `js/`, `data/`, `audio/`, `tests/`, `tools/`, `.github/workflows/`, `docs/`
- Source: `succuvivi/english-deep-talk-plan@feat/thai-native-swipe-official-audio:thai/**`
- Source tools: `tools/import_thai_audio_generator.mjs`, `tools/run_thai_audio_import.mjs`

**Interfaces:**
- Consumes: current feature-branch Thai site and generated human-audio assets.
- Produces: a standalone repository whose application files are rooted at `/`.

- [ ] **Step 1: Verify the target repository does not already contain conflicting work**

Run:
```bash
gh repo view succuvivi/thai-life-talk --json nameWithOwner,defaultBranchRef,isPrivate
```
Expected before first creation: repository not found. If it exists, inspect it and preserve any user content rather than overwriting blindly.

- [ ] **Step 2: Create the public repository**

Run:
```bash
gh repo create succuvivi/thai-life-talk --public --description "Thai Life Talk — 泰国生活口语 · 真实场景开口就用"
```
Expected: repository `succuvivi/thai-life-talk` created.

- [ ] **Step 3: Import the exact approved Thai application tree to repository root**

Copy all files currently under source `thai/` to the target repository root, preserving binary audio bytes and file names. Do not copy the old repository root or English files.

Expected root examples:
```text
learn.html
styles.css
js/audio.js
data/index.js
audio/sources.json
audio/words/coffee-01.wav
tests/audio.test.js
```

- [ ] **Step 4: Copy only the Thai audio import tools needed by the standalone project**

Target:
```text
tools/import_thai_audio_generator.mjs
tools/run_thai_audio_import.mjs
```

- [ ] **Step 5: Commit the imported baseline**

Commit message:
```text
chore: import Thai learning site baseline
```

### Task 2: Add Thai Life Talk branding and real homepage

**Files:**
- Replace: `index.html`
- Modify: `styles.css`
- Replace: `README.md`
- Test: `tests/brand.test.js`

**Interfaces:**
- Consumes: scene metadata exported by `data/scenes.js` or existing homepage scene data.
- Produces: standalone Thai Life Talk landing page and brand copy.

- [ ] **Step 1: Write a failing brand regression test**

Create `tests/brand.test.js` that reads `index.html` and `README.md` and asserts:
```js
assert.match(index, /Thai Life Talk/);
assert.match(index, /泰国生活口语 · 真实场景开口就用/);
assert.match(readme, /https:\/\/succuvivi\.github\.io\/thai-life-talk\//);
assert.doesNotMatch(index + readme, /English Deep Talk/);
```

- [ ] **Step 2: Run the test and verify it fails**

Run:
```bash
node --test tests/brand.test.js
```
Expected: FAIL because the imported `index.html` is still the old Thai scene homepage copy and README still reflects the old embedded project context.

- [ ] **Step 3: Implement the real homepage**

`index.html` must contain, in this order:
```text
Hero: Thai Life Talk
Subtitle: 泰国生活口语 · 真实场景开口就用
Positioning paragraph
Primary CTA: 开始学泰语
Secondary link: 真人音频来源
Proof row: 360 个高频词 / 18 个生活场景 / 搭配 + 真实例句 / 真人录音优先
18 scene cards
How-to-use section
Audio source note
```

Each scene card links to:
```text
learn.html?scene=<scene-id>
```

- [ ] **Step 4: Update visual styling without changing learning-card behavior**

Add homepage-specific warm neutral hero, proof chips/cards, scene grid, and large mobile touch targets. Do not alter `.series-track`, `.series-slide`, scroll-snap, or audio button behavior in this task.

- [ ] **Step 5: Replace README with standalone project copy**

Opening must be:
```md
# Thai Life Talk

泰国生活口语：目标不是先把泰文学会，而是进入真实生活场景后，能尽快说出真正用得上的泰语。

## 🇹🇭 开始学习

👉 **[打开 Thai Life Talk](https://succuvivi.github.io/thai-life-talk/)**

> 360 个高频词 + 常用搭配 + 真实例句 + 真人泰语发音 + 18 个生活场景。
```

README must also explain pronunciation aids, human-audio-first behavior, device-TTS fallback, swipe interaction, and audio attribution.

- [ ] **Step 6: Run brand test**

Run:
```bash
node --test tests/brand.test.js
```
Expected: PASS.

- [ ] **Step 7: Commit**

Commit message:
```text
feat: brand standalone site as Thai Life Talk
```

### Task 3: Re-root paths and protect standalone behavior with tests

**Files:**
- Modify if required: `index.html`, `learn.html`, `audio-sources.html`, `js/*.js`, `data/*.js`
- Create: `tests/standalone-paths.test.js`
- Preserve: `tests/static-series-ui.test.js`, `tests/audio-map.test.js`, `tests/audio.test.js`

**Interfaces:**
- Consumes: imported relative paths from the old `/thai/` directory.
- Produces: all URLs valid when served from `/thai-life-talk/` repository root.

- [ ] **Step 1: Write a failing standalone path test**

Assertions:
```js
for (const file of ['index.html', 'learn.html', 'audio-sources.html']) {
  const text = read(file);
  assert.doesNotMatch(text, /(?:href|src)=["']\/thai\//);
  assert.doesNotMatch(text, /english-deep-talk-plan/);
}
```
Also assert `learn.html`, `styles.css`, required JS modules, `audio/sources.json`, and every manifest audio file exist in the repository root structure.

- [ ] **Step 2: Run test and confirm any stale assumptions fail**

Run:
```bash
node --test tests/standalone-paths.test.js
```
Expected: FAIL if any old embedded paths remain; otherwise record the green baseline and continue with static link checks.

- [ ] **Step 3: Fix only stale root/path assumptions**

Use relative links such as:
```html
<link rel="stylesheet" href="styles.css">
<script type="module" src="js/learn.js"></script>
<a href="audio-sources.html">真人音频来源</a>
```
Audio mappings remain relative local paths such as:
```text
audio/words/coffee-01.wav
```

- [ ] **Step 4: Run targeted behavior tests**

Run:
```bash
node --test tests/standalone-paths.test.js tests/static-series-ui.test.js tests/audio.test.js tests/audio-map.test.js
```
Expected: all PASS.

- [ ] **Step 5: Commit**

Commit message:
```text
fix: re-root Thai Life Talk for standalone hosting
```

### Task 4: Add independent QA and GitHub Pages deployment

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `.github/workflows/qa.yml`
- Create: `.github/workflows/import-thai-audio.yml`

**Interfaces:**
- Consumes: root static site and existing Node tests/importer.
- Produces: standalone CI, Pages deployment, and audio refresh workflow.

- [ ] **Step 1: Add Pages workflow**

Use:
```yaml
name: Deploy Thai Life Talk to GitHub Pages
on:
  push:
    branches: ["main"]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/configure-pages@v5
        with:
          enablement: true
      - uses: actions/upload-pages-artifact@v4
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add QA workflow**

QA executes:
```bash
npm test
find js data tools -name '*.js' -o -name '*.mjs' | xargs -n1 node --check
grep -R "data-series-nav\|class=\"series-nav" index.html learn.html js styles.css && exit 1 || true
grep -R "API_KEY\|aiforthai\|api.aiforthai" index.html learn.html js data && exit 1 || true
```
Then print human coverage from `audio/sources.json` / audio map.

- [ ] **Step 3: Add standalone audio-import workflow**

Adapt the existing generator importer workflow to checkout this repository, run `tools/import_thai_audio_generator.mjs`, run `npm test`, then commit generated `audio/` and `data/audio-map.js` changes only when there is an actual diff.

- [ ] **Step 4: Commit**

Commit message:
```text
ci: add standalone Thai Life Talk Pages and QA
```

### Task 5: Verify standalone repository and public Pages

**Files:** none unless verification finds a defect.

**Interfaces:**
- Consumes: target `main` commit and Actions runs.
- Produces: fresh evidence required before old-repo cleanup.

- [ ] **Step 1: Run full local/CI-equivalent test suite**

Run:
```bash
npm test
```
Expected: zero failures.

- [ ] **Step 2: Run syntax checks**

Run:
```bash
find js data tools -type f \( -name '*.js' -o -name '*.mjs' \) -print0 | xargs -0 -n1 node --check
```
Expected: zero syntax failures.

- [ ] **Step 3: Verify content counts**

Run project data test and confirm exactly:
```text
18 scenes
360 entries
```

- [ ] **Step 4: Verify audio integrity**

Confirm every `audio/sources.json` entry points to an existing local file, allowed license, exact Thai target, and valid attribution where required. Confirm current coverage report is truthful; do not hard-code 360/360.

- [ ] **Step 5: Verify GitHub Actions**

Check newest `qa.yml` and `pages.yml` runs for target `main`; both must conclude `success`.

- [ ] **Step 6: Verify public Pages URLs**

Open:
```text
https://succuvivi.github.io/thai-life-talk/
https://succuvivi.github.io/thai-life-talk/learn.html?scene=restaurant
https://succuvivi.github.io/thai-life-talk/audio-sources.html
```
Expected: HTTP 200 / rendered pages. Confirm homepage branding, a restaurant scene, horizontal full-card swipe markup, and human-audio files are included in the Pages artifact.

### Task 6: Remove Thai hosting from English Deep Talk only after Task 5 passes

**Files in `succuvivi/english-deep-talk-plan`:**
- Remove: `thai/**`
- Remove: `preview-thai/**`
- Remove: `.github/workflows/import-thai-audio.yml`
- Remove: `.github/workflows/thai-feature-qa.yml`
- Remove: `.github/workflows/thai-preview-pages.yml`
- Remove: Thai-only importer tools no longer used by English project
- Modify: `README.md`
- Keep untouched: English root app and `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: successful standalone public verification.
- Produces: English Deep Talk repository with no hosted Thai application.

- [ ] **Step 1: Assert standalone verification evidence exists**

Do not run deletion steps unless Task 5 Pages and QA are both green and public Thai Life Talk URLs resolve.

- [ ] **Step 2: Remove Thai site and preview directories from English repository**

Delete only:
```text
thai/
preview-thai/
```

- [ ] **Step 3: Remove Thai-only workflows and import tools**

Delete workflows and scripts whose sole purpose was Thai audio import, Thai feature QA, or Thai preview publishing.

- [ ] **Step 4: Remove Thai section from English README**

Keep English Deep Talk intro, 30-day training, 2-second rule, and English deployment documentation unchanged.

- [ ] **Step 5: Verify English production app still deploys**

Run/inspect English project checks and Pages deployment. Confirm:
```text
https://succuvivi.github.io/english-deep-talk-plan/
```
continues to serve English Deep Talk.

- [ ] **Step 6: Commit English cleanup**

Commit message:
```text
chore: move Thai Life Talk to standalone repository
```

### Task 7: Final verification and handoff

**Files:** none unless defects are found.

**Interfaces:**
- Consumes: both final repositories.
- Produces: final user-facing URLs and evidence summary.

- [ ] **Step 1: Re-run standalone full tests on final target commit**

Run:
```bash
npm test
```
Expected: zero failures.

- [ ] **Step 2: Re-check standalone Pages deployment on exact final commit**

Confirm target Pages run is `completed/success` and artifact includes `audio/words/` plus the root site.

- [ ] **Step 3: Re-check English repository state**

Assert there is no `thai/` or `preview-thai/` directory on English `main`, and the English Pages workflow is green.

- [ ] **Step 4: Report only verified final state**

Provide:
```text
Thai Life Talk: https://succuvivi.github.io/thai-life-talk/
English Deep Talk: https://succuvivi.github.io/english-deep-talk-plan/
```
State exact test counts and current human-audio coverage from fresh verification output.

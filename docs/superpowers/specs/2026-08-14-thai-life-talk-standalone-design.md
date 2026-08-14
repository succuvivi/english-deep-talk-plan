# Thai Life Talk — Standalone Project Design

Date: 2026-08-14

## 1. Brand

**Product name:** Thai Life Talk  
**Chinese subtitle:** 泰国生活口语 · 真实场景开口就用  
**Repository:** `succuvivi/thai-life-talk`  
**GitHub Pages:** `https://succuvivi.github.io/thai-life-talk/`

Thai Life Talk is a sister brand to English Deep Talk, but it is an independent product. It keeps the same clear, mobile-first, card-based learning philosophy while focusing only on practical Thai used in daily life in Thailand.

The project must contain no English Deep Talk branding, paths, deployment assumptions, or shared runtime dependencies.

## 2. Positioning

Primary promise:

> 给在泰国真实生活的人用的实用泰语。不是为了先学会读泰文，而是为了在点餐、打车、购物、租房、看病、办事、交朋友时，能马上说出真正用得上的泰语。

Homepage proof line:

> 360 个高频词 · 常用搭配 · 真实例句 · 真人泰语发音 · 18 个生活场景

Target user is a Chinese speaker who wants to speak practical Thai quickly. Thai script remains the standard reference, while romanization and Chinese near-pronunciation are prominent speaking aids.

## 3. Visual direction

Keep a family resemblance to English Deep Talk through:

- clean typography
- strong mobile-first spacing
- simple cards
- minimal controls
- fast loading and no decorative framework dependency

Thai Life Talk should feel warmer and more everyday-life oriented rather than copying the English site exactly. Use a warm neutral page background, restrained accent treatment, rounded cards, generous touch targets, and scene-first navigation.

Do not use stock-photo-heavy hero sections, dashboards, gamification, progress streaks, or login UI.

## 4. Homepage information architecture

The new root `index.html` is a real Thai Life Talk homepage, not an immediate redirect.

Order:

1. **Hero**
   - Thai Life Talk
   - 泰国生活口语 · 真实场景开口就用
   - short positioning paragraph
   - primary CTA: `开始学泰语`
   - secondary small link: `真人音频来源`

2. **What you get**
   - 360 个高频词
   - 18 个生活场景
   - 搭配 + 真实例句
   - 真人录音优先

3. **18 scene cards**
   - restaurant, coffee, convenience store, market, taxi, motorbike, directions, petrol, delivery, condo, repairs, laundry, massage, hospital, bank, mobile, greetings, friends
   - each card links directly to `learn.html?scene=<id>`

4. **How to use**
   - 先看中文意思
   - 跟着罗马音 / 中文近似音开口
   - 点真人泰语反复听
   - 同类词整张卡左右滑

5. **Audio note**
   - human recordings are preferred when a redistribution-safe exact recording exists
   - otherwise device Thai TTS is used
   - link to attribution page

No login, streaks, points, leaderboards, or course-progress account system.

## 5. Learning page

Keep the approved current learning behavior:

- scene filter, search, favorites
- Thai script show/hide control
- normal/slow audio control
- full-card native horizontal swipe for semantic-series groups
- no visible previous/next arrows
- progress text derived from actual scroll position
- standalone card when only one series member survives filtering
- details/collocations/examples stay inside each complete card

Audio priority:

1. verified local human recording from `item.audio`
2. device Thai TTS using exact `item.th`

Never synthesize from romanization or Chinese near-pronunciation.

Human audio normal speed is 1.0 and slow speed is approximately 0.8.

Labels:

- human: `🔊 听真人泰语` / `真人录音`
- fallback: `🔊 听泰语` / `设备语音`

## 6. Repository structure

The standalone repository should place the Thai site at repository root, not under `/thai/`.

Proposed structure:

```text
thai-life-talk/
  index.html
  learn.html
  audio-sources.html
  styles.css
  js/
  data/
  audio/
    words/
    sources.json
  tests/
  tools/
  docs/
  package.json
  README.md
  .github/workflows/
    pages.yml
    qa.yml
    import-thai-audio.yml
```

All relative paths must be updated for root hosting under `/thai-life-talk/`.

## 7. README

README should mirror the clarity of English Deep Talk while using Thai Life Talk positioning.

Opening:

```md
# Thai Life Talk

泰国生活口语：目标不是先把泰文学会，而是进入真实生活场景后，能尽快说出真正用得上的泰语。

## 🇹🇭 开始学习

👉 [打开 Thai Life Talk](https://succuvivi.github.io/thai-life-talk/)

> 360 个高频词 + 常用搭配 + 真实例句 + 真人泰语发音 + 18 个生活场景。
```

Then explain the 18 scenes, pronunciation aids, human-audio-first policy, swipe behavior, and license attribution.

Do not mention that it is hosted inside English Deep Talk, because it is not.

## 8. Audio provenance

Keep the existing exact-match open-license pipeline.

Allowed redistribution licenses:

- CC0
- Public Domain
- CC BY
- CC BY-SA

Reject NC, ND, unknown, custom, or ambiguous licenses.

Primary source pool:

- Wikimedia Commons Thai pronunciation
- Lingua Libre Thai recordings hosted on Commons
- other sources only when redistribution terms are explicit and compatible

`audio/sources.json` remains the provenance manifest. `audio-sources.html` lists recording, creator, source, and license.

Current imported recordings are migrated into the new repository exactly with their provenance; no source metadata is discarded.

## 9. Deployment

The new repo has its own GitHub Pages workflow triggered by pushes to `main`.

Publishing Thai Life Talk must not trigger or depend on English Deep Talk deployment.

The new QA workflow should run:

- full Node test suite
- JS syntax checks
- no series arrow regression check
- no public API-key/provider-secret hooks
- human-audio manifest integrity
- current human-audio coverage report

## 10. Migration from English Deep Talk

Migration is two-phase to avoid breaking the working Thai site before the new repository is verified.

### Phase A — Standalone launch

1. create `succuvivi/thai-life-talk`
2. migrate current approved Thai site, tests, importer, audio files, and provenance
3. rebase paths from `/thai/` to repository root
4. add new brand homepage and README
5. enable standalone Pages
6. verify public homepage, scene page, swipe, human audio, fallback TTS, attribution page, and QA

### Phase B — Clean old repository

Only after the standalone public site is verified:

- remove `/thai/` from `english-deep-talk-plan`
- remove `/preview-thai/`
- remove Thai-specific workflows/tools/docs that are no longer needed there
- remove the Thai section from the English README
- keep English Deep Talk production files untouched

No duplicate live Thai product remains in the English repository after cleanup.

## 11. Error handling and resilience

- Missing human recording: use device Thai TTS; do not fail the card.
- Broken local human audio: fall back to device Thai TTS.
- No Thai system voice explicitly listed: still request browser speech with `lang=th-TH`.
- Importer network or source failure: skip unavailable recording and preserve the rest of the valid import; do not invent coverage.
- License or attribution ambiguity: reject the candidate.

## 12. Acceptance criteria

The migration is complete only when all are true:

- `succuvivi/thai-life-talk` exists as its own repository
- public Pages URL is `https://succuvivi.github.io/thai-life-talk/`
- homepage uses Thai Life Talk branding and standalone Chinese positioning
- all 18 scenes and 360 entries are present
- native full-card swipe has no arrow buttons
- current verified human audio files and attribution are preserved
- device TTS fallback still uses Thai script
- full standalone QA is green
- public site is manually reachable on homepage and at least one scene URL
- after standalone verification, English Deep Talk contains no hosted Thai site or Thai preview directory

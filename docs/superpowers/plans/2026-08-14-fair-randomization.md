# Fair Randomization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every exercise question/choice order fair and unpredictable while keeping each active round stable.

**Architecture:** Replace deterministic seeded `sh()` usage in exercise paths with Web-Crypto-backed Fisher-Yates helpers and a transient round cache. Keep the existing static page architecture and current answer maps; only exercise ordering/sampling changes.

**Tech Stack:** Static JavaScript, Web Crypto API, GitHub Pages.

## Global Constraints
- Keep learning cards in curriculum order.
- Keep `englishDeepTalk.v3` unchanged.
- Re-rendering within a round must not move questions or options.
- Switching Day or refreshing starts a fresh random round.
- All sampling is without replacement.

### Task 1: Random core
**Files:** Modify `app-core-v2.js`
- [ ] Add unbiased `randomInt(max)` using rejection sampling with `crypto.getRandomValues` and compatibility fallback.
- [ ] Add Fisher-Yates `fairShuffle(items)`.
- [ ] Add transient `roundOrders` cache and `roundShuffle(key, items, idFn)` / `roundSample(key, items, n, idFn)`.
- [ ] Clear `roundOrders` inside `resetTransient()`.
- [ ] Verify helper unit tests pass.

### Task 2: Practice exercises
**Files:** Modify `app-practice-v2.js`
- [ ] Randomize question order for meaning, scene, recall.
- [ ] Randomize all choice positions through cached round shuffles.
- [ ] Randomly shuffle all 10 collocation targets before splitting into two rounds; randomize left/right columns independently.
- [ ] Keep answer-state keys stable by word/phrase rather than visible index where needed.
- [ ] Verify syntax and static coverage checks.

### Task 3: Review and cloze exercises
**Files:** Modify `app-review-base-v2.js`, `app-weak-review-v3.js`
- [ ] Replace deterministic source-day sampling with equal-probability `roundSample()`.
- [ ] Randomize final due-review order.
- [ ] Build extension cloze pool, deduplicate it, uniformly sample up to five, then randomize final question order.
- [ ] Randomize cloze answer choices with cached round shuffles.
- [ ] Randomize previous-day weak-word question order and choices.
- [ ] Verify syntax and ordering checks.

### Task 4: Deploy
- [ ] Commit production files to `main`.
- [ ] Verify latest GitHub Pages workflow is `completed/success` for the new main SHA.

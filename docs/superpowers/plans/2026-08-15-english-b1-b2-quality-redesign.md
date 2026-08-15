# English B1+/B2 Quality Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Day 4–33 elementary vocabulary slots with 300 adult high-frequency B1+/B2 lexical items and remove repetitive cloze / answer-leaking collocation behavior.

**Architecture:** Keep the stable training UI and state code. Add `course-v5.js` after `plan.js` to replace Day 4–33 curriculum data while retaining a legacy copy for old weak words; replace the lexicon layer with `lexicon-v5.js`, which builds every exercise from explicit per-item cloze and safe collocation data rather than POS fallback templates. Add a Node validator that rejects elementary blocked terms, duplicate cloze prompts, answer leakage, duplicate vocabulary, missing metadata, and malformed answer sets.

**Tech Stack:** Static JavaScript, HTML, browser localStorage, Node.js validation, GitHub Pages.

## Global Constraints

- Keep `englishDeepTalk.v3` unchanged.
- Preserve existing Day 3 baseline.
- Day 4–33 must contain exactly 30 days × 10 unique target items.
- Target difficulty: practical adult B1+/B2 speaking vocabulary and lexical chunks; do not spend target slots on elementary items such as `size`, `bill`, `spicy`, `free`, `busy`, `full`, `table`, `menu`, `because`, `family`, or `parents`.
- Every target must have a distinct English cloze sentence that is different from its word-card example.
- Every cloze must have exactly four English options with exactly one target answer.
- Matching cues must never contain the target answer text.
- Existing fair-randomization layer remains active.
- Existing weak-word records must not be cleared; unresolved old targets must remain available through legacy lookup.

---

### Task 1: Write quality regression tests

**Files:**
- Create: `tests/validate_english_v5.js`

**Interfaces:**
- Consumes `course-v5.js` and `lexicon-v5.js` in a VM sandbox.
- Produces process exit 0 only when all curriculum and exercise-quality invariants pass.

- [ ] Write assertions for 30 days, 10 targets/day, 300 unique targets, blocked elementary targets absent, non-empty collocations, unique cloze strings, four unique cloze choices, answer included once, card example != cloze, and match cue not containing answer.
- [ ] Run against the current production data and confirm RED failures for blocked elementary words, repeated cloze templates, and leaking match cues.

### Task 2: Build upgraded Day 4–33 curriculum

**Files:**
- Create: `course-v5.js`

**Interfaces:**
- Captures old `window.P` Day 4–33 words into `window.LEGACY_WORDS_V5`.
- Replaces `window.P` Day 4–33 entries with the upgraded curriculum.
- Adds explicit fourth-field cloze prompts for each target item.

- [ ] Curate 10 adult high-frequency B1+/B2 targets per theme, favoring lexical chunks and precise conversational vocabulary over elementary nouns/adjectives.
- [ ] Ensure every `w` record contains `[target, zh, collocation, cloze]` and collocation contains the target text exactly once so a safe cue can be generated.
- [ ] Run the validator and fix duplicate / blocked / malformed targets until curriculum checks pass.

### Task 3: Replace generic lexicon generation

**Files:**
- Create: `lexicon-v5.js`

**Interfaces:**
- Produces `window.LX[target]` entries with `pos`, `memory`, `example`, `exampleZh`, `collocation`, `collocationParts`, `confusers`, `zhConfusers`, `cloze`, and `clozeOptions`.

- [ ] Derive safe match cue by replacing the exact target inside its collocation with `___`; fail closed instead of showing the original collocation when the answer cannot be removed.
- [ ] Build topic-aware confusers from same-day and same-form candidate pools, ensuring four unique choices.
- [ ] Generate a distinct natural card example from the collocation and day context; never reuse the cloze string.
- [ ] Keep Day 3 compatible with the existing baseline.
- [ ] Run the validator until all lexicon checks pass.

### Task 4: Preserve legacy weak-word resolution

**Files:**
- Create: `app-quality-v5.js`
- Modify: `app-review-v2.js` loader chain only if necessary.

**Interfaces:**
- Produces `resolveCourseWord(day, target)` that checks current curriculum first, then `LEGACY_WORDS_V5`.
- Overrides weak-word review item resolution paths without changing `S.weak` storage shape.

- [ ] Add regression test using a replaced Day 5 old weak target and confirm it resolves through legacy data.
- [ ] Patch due review / previous-day weak / sentence extension weak resolution to use the resolver.

### Task 5: Wire production resources

**Files:**
- Modify: `learn.html`

**Interfaces:**
- Load order: `plan.js` → `course-v5.js` → `lexicon-v5.js` → existing core/practice/review stack → quality patch/random layer.

- [ ] Replace `lexicon-v2.js` reference with `lexicon-v5.js` and insert `course-v5.js` before it.
- [ ] Keep all existing section DOM and localStorage behavior unchanged.

### Task 6: Verification and deployment

**Files:** production files above.

- [ ] Run `node tests/validate_english_v5.js` and require zero failures.
- [ ] Run `node --check` on every changed JavaScript file.
- [ ] Check the banned examples (`size`, `bill`, `spicy`) are absent from Day 4–33 target slots.
- [ ] Check all 300 cloze strings are unique and no `collocationParts[1]` contains its target.
- [ ] Commit to `main`, verify `main` points to the new commit, then verify the latest GitHub Pages workflow is `completed / success` with matching `head_sha`.

# English B1+/B2 Curriculum & Exercise Quality Redesign — Design Spec

Date: 2026-08-15
Repository: `succuvivi/english-deep-talk-plan`

## Goal

Upgrade the English-learning site from a mixed A1–B1 vocabulary set to an adult, high-frequency B1+/B2 speaking curriculum, while fixing the two quality problems now visible in production:

1. English cloze questions are repetitive because most words fall back to the same POS-based templates.
2. Collocation matching can leak the target word or show awkward fragments when the current collocation cannot be safely blanked.

The redesign keeps the existing daily themes, review cadence, weak-word workflow, fair-randomization layer, and browser-local progress model.

## 1. Vocabulary Level

### Target level

- Primary band: B1+ to B2.
- Favor high-frequency adult conversation, travel, work, relationships, decisions, and life-management language.
- Prefer useful lexical chunks and precise everyday expressions over rare academic vocabulary.
- A term may be simple-looking only if the chunk itself carries B1+/B2 value.

### Remove / replace

Replace obviously elementary targets such as `size`, `bill`, `spicy`, `free`, `busy`, `full`, `straight`, `turn`, `noisy`, `quiet`, `finish`, `send`, `tired`, `better`, `table`, `menu`, `family`, `parents`, and basic connectors such as `because` when they occupy one of the ten target slots.

Examples of the upgraded direction:

- dining: `dietary restriction`, `signature dish`, `allergen`, `seasoning`, `overpowering`, `subtle`, `complimentary`, `separate checks`, `house specialty`, `undercooked`
- shopping: `true to size`, `defective`, `exchange policy`, `store credit`, `eligible for a refund`, `overpriced`, `marked down`, `impulse purchase`, `durable`, `return window`
- work: `workload`, `prioritize`, `delegate`, `bandwidth`, `backlog`, `deliverable`, `bottleneck`, `follow through`, `take ownership`, `on track`

### Scope

- Keep Day 3 as the historical baseline.
- Redesign all ten target entries for Day 4 through Day 33.
- Preserve each day's topic/date identity.
- Avoid duplicate target terms across Day 4–33.

## 2. Data Model

`plan.js` remains the source of daily curriculum metadata and the first three fields of every word record:

```js
[term, chineseMeaning, collocation]
```

The new curriculum may add optional fields after those three without breaking current consumers.

A new enrichment layer, `lexicon-v3.js`, must produce the existing `window.LX[term]` interface with explicit quality-controlled fields:

```js
{
  pos,
  memory,
  example,
  exampleZh,
  collocation,
  collocationParts: [term, cue],
  confusers,
  zhConfusers,
  cloze,
  clozeOptions
}
```

For every Day 4–33 target, `cue` and `cloze` are explicit curriculum data, not POS-based fallback templates.

## 3. Cloze Quality

Every target receives a unique, natural sentence written for that word or phrase.

Requirements:

- Exactly one blank `______`.
- The cloze sentence differs from the word-card example sentence.
- Do not reuse generic templates such as `I need to ______ this before tomorrow.` across unrelated verbs.
- Sentence context must make the correct answer meaningfully preferable to all three distractors.
- Distractors must match the grammatical category required by the blank.
- Four options must be real English and unique.
- Avoid sentences where two options are both idiomatic or semantically acceptable.
- Final cloze module remains English-only.

## 4. Collocation Matching Quality

Every target receives an explicit match cue that trains a real high-frequency chunk.

Examples:

- `deadline` ↔ `meet a ___`
- `follow through` ↔ `on a promise`
- `eligible for a refund` ↔ `under the store policy`

Requirements:

- The cue must not contain the full target answer.
- For single-word targets, prefer a natural left/right chunk such as `meet a ___`, `heavy ___`, `raise a ___`.
- For multiword targets, the cue should be the natural complement, e.g. `on a promise`, not a malformed string with the whole target repeated.
- No `target · ___` fallback is allowed in production data.
- Matching remains English-only and uses the existing fair randomization behavior.

## 5. Scene Quiz / Confusers

Maintain the prior requirement that English distractors are confusable alternatives rather than random words learned that day.

- Three real English distractors per target.
- Same broad grammatical role as the correct answer.
- Similar enough to require meaning/usage discrimination.
- Avoid distractors that make the answer obvious by length or form when practical.
- Do not use fake words.

## 6. Word Cards

Keep the current enriched card experience:

- term / phrase
- part of speech
- Chinese meaning
- concise memory hook
- high-frequency collocation
- English example
- Chinese translation
- speaker button that reads only the English target
- weak-word toggle

Memory hooks must never claim false etymology.

## 7. Existing Progress & Weak Words

- Keep localStorage key exactly `englishDeepTalk.v3`.
- Do not clear existing data on deployment.
- Existing weak entries for removed legacy words must remain visible in the full weak-word library as historical weak words.
- New daily/review exercises resolve against the new curriculum when possible.
- Unresolvable legacy weak entries must be skipped safely in exercise generation rather than crash the page.

## 8. Fair Randomization

Keep the current `app-random-v4.js` behavior:

- equal-probability Fisher–Yates ordering
- no-replacement sampling
- question/option order stable during one round
- new random order after page refresh or Day switch

The new curriculum and cloze/collocation data must work with this layer without weakening fairness.

## 9. Automated Quality Validation

Add a validator under `tools/` that fails when any Day 4–33 item violates these checks:

- exactly 300 Day 4–33 targets and 10 per day
- no duplicate target terms
- banned elementary target list absent
- required lexical fields present
- exactly three unique confusers
- cloze has exactly one blank
- cloze answer not visible outside the blank
- four unique cloze options and answer appears exactly once
- cloze sentence not equal to example sentence
- duplicate normalized cloze templates below a strict threshold; exact duplicate sentences forbidden
- collocation cue non-empty
- collocation cue does not contain the full target term
- no production cue uses the fallback marker ` · ___`
- no empty Chinese meaning / POS / example / example translation

## 10. Acceptance Criteria

The redesign is complete when:

- Day 4–33 contains 300 unique B1+/B2-oriented targets.
- `size`, `bill`, `spicy` and the other banned elementary targets are no longer target entries.
- Every target has an explicit natural cloze sentence and collocation cue.
- No repeated generic cloze template dominates the corpus.
- Collocation matching never reveals the answer in its cue.
- Existing weak/progress storage remains intact.
- All JS syntax checks pass.
- Curriculum validator passes with zero failures.
- GitHub Pages deployment for the final main commit completes successfully.

# Vocabulary Training Redesign — Design Spec

Date: 2026-08-13
Repository: `succuvivi/english-deep-talk-plan`

## Goal

Rebuild the daily learning flow so it moves from understanding to recognition, discrimination, collocation, active recall, spaced review, and finally English-only contextual use. The redesign must preserve the existing Day 3–Day 33 curriculum, localStorage progress, weak-word pool, 1H/1D/2D/6D review schedule, and word-only pronunciation behavior.

The user should receive more support while first learning a word, then progressively less support in later exercises.

## Constraints

- Keep the current static GitHub Pages architecture.
- Keep `plan.js` as the base curriculum source so existing Day/date/theme/word data does not need to be rewritten.
- Keep localStorage key `englishDeepTalk.v3`; no migration or reset should be required.
- Keep the current weak-word and completion behavior unless a change is explicitly described below.
- Do not copy Duolingo branding, artwork, layout, or proprietary content. Only borrow general learning patterns such as short rounds, immediate feedback, repeated retrieval, and low-friction tapping.
- Do not invent fake English distractors or false etymologies.

## Architecture

Add a new `lexicon.js` enrichment layer loaded after `plan.js` and before the page logic. `plan.js` remains the canonical list of daily words. `lexicon.js` supplies richer learning metadata keyed by the English word/phrase.

Each enriched entry should support:

```js
{
  pos: "adj.",
  zh: "有空的；可用的",
  memory: "avail（可获得/可用）+ able（能够…的）→ 能被使用的、可用的；用于人时就是‘有空的’。",
  example: "I am available on Friday evening.",
  exampleZh: "我周五晚上有空。",
  collocation: "be available on Friday",
  collocationParts: ["available", "on Friday"],
  confusers: ["valuable", "avoidable", "reliable"],
  cloze: "Is the meeting room ______ after lunch?",
  clozeAnswer: "available",
  clozeOptions: ["available", "valuable", "avoidable", "reliable"]
}
```

For phrases, `pos` may be `phr.` / `v. phr.` / `adv. phr.` as appropriate. `memory` should explain chunks and usage rather than forcing a word-root story.

### Memory-method rules

1. Prefer real morphology when useful: prefix, root, suffix, or transparent compound structure.
2. For phrasal verbs and fixed phrases, explain the chunks and the mental image of the phrase.
3. For short/simple words without a trustworthy decomposition, use a concise contrast, sound association, or usage hook.
4. Never present a mnemonic as historical etymology unless it is genuinely etymological.
5. Keep each mnemonic to roughly one or two short Chinese sentences.

## Daily Flow

### 1. 今日 10 词 — enriched learning cards

Each card should show, in this order:

- English word/phrase
- part of speech
- Chinese meaning
- memory/decomposition method
- high-frequency collocation
- English example sentence
- Chinese translation of that example
- existing speaker button, still reading only the English word/phrase
- existing weak-word control

Example:

**available** · `adj.`

有空的；可用的

记忆：`avail + able` → 能被使用的、可用的；说人时常表示“有空”。

搭配：`be available on Friday`

例句：`I am available on Friday evening.`

中文：我周五晚上有空。

### 2. 看英文选中文

Insert this new section before the existing scene quiz.

- 10 questions, one per daily word.
- Prompt shows only the English word/phrase.
- Four Chinese meaning choices.
- Correct choice is the entry's primary Chinese meaning.
- Distractors should be plausible/nearby meanings where possible rather than obviously unrelated meanings.
- Immediate correct/wrong feedback.
- No extra usage hint before answering.

Purpose: fast recognition check after studying the cards.

### 3. 场景选择题 — confusable English choices

Keep the scene/Chinese-to-English direction, but replace the current distractor strategy.

- Prompt uses a Chinese meaning or short realistic Chinese scenario.
- Four English options.
- Correct answer is the target word/phrase.
- The three wrong options come from curated `confusers`, not random words from today's 10-word list.
- Confusers should be real English and should be difficult for a learner because of spelling, form, sound, or nearby usage.

Examples:

- `confirm` → `conform / confront / confuse`
- `available` → `valuable / avoidable / reliable`
- `afford` → `avoid / effort / offer`

For phrases, use similar-looking or similar-function phrases rather than unrelated single words.

If an entry lacks three validated confusers, the build/data validation must fail rather than silently creating fake words.

### 4. 搭配强化 — short matching rounds

Add a new collocation section inspired by short, tap-driven language-learning rounds.

Use two mini-rounds so all 10 daily words are covered without creating a long exercise:

- Round A: 5 word/phrase ↔ collocation-fragment pairs.
- Round B: remaining 5 pairs.
- Each round displays a shuffled left/right matching grid.
- User taps one item from each side.
- Correct pair locks/removes immediately.
- Wrong pair gives brief visual feedback and remains available.
- No Chinese translation in this section; the goal is chunk memory.

Example pairs:

- `handle` ↔ `pressure`
- `split` ↔ `the bill`
- `confirm` ↔ `the time`

The collocation fragments must come from the entry's real high-frequency collocation, not automatically generated filler.

### 5. 2 秒主动回忆

Keep the current 10-word active-recall section and weak-word behavior.

- Chinese prompt remains acceptable here.
- Before reveal, show only a minimal instruction such as `2 秒内说英文`.
- The English answer and collocation remain hidden until the user taps `看答案`.
- Existing 熟练 / 超过 2 秒 controls remain.

### 6. 到期复习

Keep Start → 1H → 1D → 2D → 6D scheduling and weak-word mixing.

Change the pre-answer UI:

- Keep review label (`1H`, `1D`, `2D`, `6D`, `弱词`) and the Chinese prompt.
- Remove the current text that exposes the collocation after `说英文 + ...`.
- Replace it with only `2 秒内说英文` or equivalent.
- English answer stays hidden until `看答案`.
- The revealed answer may include the English word and collocation after the learner has attempted recall.

### 7. 全英选词完形

Replace the current bilingual context section with English-only multiple-choice cloze.

- 10 daily target questions, plus up to 5 existing old/weak-word extension questions.
- Every question is an English sentence with `______` replacing the target word/phrase.
- Four English options only.
- The correct answer is the target word/phrase.
- Wrong options should be the same curated confusers used for lexical discrimination when they fit the grammar; otherwise use a separate validated `clozeOptions` set.
- No Chinese meaning, Day source, target label, or translation before answering.
- The cloze sentence must be different from the example sentence shown on the learning card.
- After answering: show only concise correctness feedback; on wrong answers, reveal the correct English answer.

Example:

Learning-card example:
`I am available on Friday evening.`

Cloze:
`Is the meeting room ______ after lunch?`

Options:
`available / valuable / avoidable / reliable`

## Data Quality

Create a validator (for example `tools/validate_lexicon.py`) and run it before committing the final implementation.

Validation requirements:

- Every word/phrase in `plan.js` has one enrichment entry.
- Every entry has a non-empty part of speech.
- Every entry has a memory method.
- Every entry has an English example and Chinese translation.
- Every entry has a high-frequency collocation.
- Every entry has at least three real, non-duplicate scene-quiz confusers.
- Every entry has an English cloze sentence and four unique English cloze options.
- Cloze answer appears exactly once in the choices.
- Cloze sentence is not identical to the learning-card example.
- Cloze prompt does not contain the answer string outside the blank.
- No answer option is empty.

The implementation should fail validation instead of degrading into random/unrelated options.

## UI and State

- Keep the existing responsive card style and mobile behavior.
- Renumber sections in the displayed order after inserting new modules.
- Add independent in-memory score state for the new recognition and collocation sections; no localStorage schema change is required.
- Switching days resets transient question answers for all quiz sections, matching current behavior.
- Weak-word, completion, notes already removed in previous redesign, and review schedule state remain unchanged.

## Graceful Fallback

If an enrichment entry is unexpectedly missing at runtime:

- Learning card falls back to the base `plan.js` fields.
- Do not show invented POS/mnemonic/example translations.
- Exercises that require missing curated data should show a small `数据待补充` message for that item rather than generating fake choices.
- One bad item must not crash the rest of the page.

## README Update

Update README to describe the final flow:

1. rich word cards
2. English → Chinese recognition
3. confusable-word scene quiz
4. collocation matching
5. 2-second active recall
6. spaced review
7. English-only cloze

Also document that progress remains browser-local.

## Acceptance Criteria

The redesign is complete when:

- Each daily word card visibly includes POS, Chinese meaning, mnemonic/decomposition, collocation, English example, and Chinese example translation.
- Word audio still reads only the word/phrase.
- A new English→Chinese section exists before scene questions.
- Scene questions no longer draw distractors from the current day's other target words and instead use curated confusable real English.
- A new collocation-matching section covers all 10 daily words in short rounds.
- Review prompts no longer reveal the collocation before answer reveal.
- The final exercise is English-only cloze with a new sentence and English choices only.
- Current localStorage learning progress remains intact.
- The lexicon validator passes for the full Day 3–Day 33 vocabulary set.
- GitHub Pages deploy completes successfully.

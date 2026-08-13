# Previous-Day Weak Review & Weak-Word Library — Design Spec

Date: 2026-08-14
Repository: `succuvivi/english-deep-talk-plan`

## Goal

Strengthen words marked weak on the previous training day, and make the header weak-word count clickable so the learner can inspect the complete current weak-word pool.

The feature must reuse the existing browser-local weak-word data stored under `englishDeepTalk.v3` and preserve the existing rule that a weak word is removed after three successful review confirmations.

## Chosen Behavior

The learner selected **Option A**: on each day, the dedicated weak-word reinforcement section should contain only weak words originating from the immediately previous curriculum day.

Example:

- Day 5 reinforcement shows weak words marked from Day 4.
- Day 6 reinforcement shows weak words marked from Day 5.
- Older unresolved weak words stay visible in the weak-word library and may still appear in the existing spaced-review system, but they do not fill the dedicated "previous-day weak review" section.

## 1. New Previous-Day Weak Review Section

Insert a new learning section after the standard due-review section and before the final English cloze section.

Displayed title:

`前一天弱词加强`

Behavior:

- Determine the previous curriculum day as `currentDay - 1`.
- Read the existing `S.weak` store and select entries whose `d` equals the previous day.
- Resolve each weak entry back to its full word record in `plan.js` and enrichment data in `LX`.
- If the previous day has no active weak words, show a compact empty state such as `前一天没有留下弱词。`.
- Do not pull weak words from earlier days into this section.

### Reinforcement sequence per word

Each previous-day weak word receives a compact three-step review card:

1. **Chinese → English recall**
   - show Chinese meaning
   - instruction: `2 秒内说英文`
   - answer hidden until reveal

2. **Collocation check**
   - after revealing the word, show its high-frequency collocation
   - do not expose the collocation before the learner attempts recall

3. **English cloze reinforcement**
   - show the existing `LX[word].cloze` English-only sentence
   - four English choices using `LX[word].clozeOptions`

After the learner completes the card, provide the existing controls:

- `✅ 熟练` → call the existing `goodWeak(day, word)` behavior
- `⚠️ 还不熟` → keep/reset the weak entry with existing `addWeak(day, word)` semantics

Three successful weak reviews across the existing system should still remove the word automatically.

## 2. Header Weak Count Becomes Clickable

The existing header stat currently displays:

`弱词` + count

Change the whole stat into a clickable control without changing its visual position in the four-stat header.

Interaction:

- click/tap opens a modal or full-screen sheet on mobile
- heading: `我的弱词`
- show the total number of currently active weak words
- list every active entry in `S.weak`, not only the 12 currently shown in the sidebar
- sort newest marked/reviewed first using the existing `last` timestamp

Each list item shows:

- English word/phrase
- part of speech from `LX` when available
- Chinese meaning
- source Day
- current weak-review progress: `0/3`, `1/3`, or `2/3`
- speaker button that reads only the English word/phrase

The modal is read-only for this change: no manual deletion button is required. Weak words leave the list only through the existing remove/toggle behavior on word cards or after three successful reviews.

## 3. Existing Sidebar Weak Pool

Keep the sidebar `弱词复习池` as a quick preview.

- It may continue to show only the most recent subset for compactness.
- Add a small `查看全部` action that opens the same weak-word modal as the header stat.
- The modal is the canonical full weak-word view.

## 4. State and Compatibility

- Keep localStorage key exactly `englishDeepTalk.v3`.
- Do not migrate or clear existing user data.
- Reuse current weak entry shape: `{d, w, zh, ok, last}`.
- Existing `addWeak()` and `goodWeak()` behavior remains authoritative.
- Existing 1H/1D/2D/6D review and current weak mixing remain unchanged.
- Existing final cloze and other daily modules remain unchanged except section numbering.

## 5. Section Order

After this change, the daily flow becomes:

1. 今日 10 词
2. 看英文选中文
3. 场景选择题
4. 搭配强化
5. 2 秒主动回忆
6. 到期复习
7. 前一天弱词加强
8. 全英选词完形

## 6. Empty and Edge Cases

- Day 3 has no previous curriculum day in this plan context; show the empty weak-review state.
- If an old weak entry points to a word that can no longer be resolved, skip that entry without crashing the page.
- If `LX` data is missing for one weak word, Chinese→English recall must still work from `plan.js`; cloze may show `数据待补充` for that word.
- When `goodWeak()` removes an entry after the third success, both the reinforcement section and modal should refresh immediately.

## Acceptance Criteria

The change is complete when:

- Day N's dedicated weak reinforcement section only contains unresolved weak words from Day N-1.
- Previous-day weak words receive recall plus hidden-answer collocation plus English cloze reinforcement.
- Marking a reinforcement item `熟练` advances the existing `ok/3` counter and removes it at 3/3.
- The top header weak-word count is clickable.
- Clicking it shows every active weak word with English, POS, Chinese meaning, source Day, progress, and word-only audio.
- Sidebar includes a `查看全部` entry to open the same full list.
- Existing weak records survive the deployment unchanged.
- `englishDeepTalk.v3` remains the storage key.
- Existing daily review and weak-word mixing behavior are not removed.

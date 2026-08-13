# Vocabulary Training Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the daily vocabulary flow with enriched word cards, English→Chinese recognition, confusable scene choices, collocation matching, cleaner recall/review, and English-only cloze practice.

**Architecture:** Keep `plan.js` as the base curriculum and add `lexicon.js` as an enrichment layer keyed by word/phrase. Use a generator/validator script to guarantee every plan entry receives POS, mnemonic, example translation, confusers, collocation metadata, and a second English cloze sentence. Patch `index.html` to consume the new layer while preserving `englishDeepTalk.v3` progress state.

**Tech Stack:** Static HTML/CSS/JavaScript, Python 3 generator/validator, GitHub Actions, GitHub Pages.

## Global Constraints

- Keep the current static GitHub Pages architecture.
- Preserve `plan.js`, Day 3–Day 33 curriculum, weak-word logic, completion logic, and localStorage key `englishDeepTalk.v3`.
- Word audio must continue to read only the English word/phrase.
- Do not invent fake English distractors or false etymologies.
- Final cloze section must be English-only and use sentences different from learning-card examples.

---

### Task 1: Build lexicon enrichment data

**Files:**
- Create: `tools/build_lexicon.py`
- Create: `lexicon.js`
- Create: `tools/validate_lexicon.py`

**Interfaces:**
- Consumes: `window.P` JSON payload from `plan.js`.
- Produces: `window.LX[word]` entries with `pos`, `zh`, `memory`, `example`, `exampleZh`, `collocation`, `collocationParts`, `confusers`, `cloze`, `clozeAnswer`, `clozeOptions`.

- [ ] **Step 1: Implement a parser for `plan.js`**

```python
text = Path('plan.js').read_text(encoding='utf-8').strip()
assert text.startswith('window.P=') and text.endswith(';')
plan = json.loads(text[len('window.P='):-1])
```

- [ ] **Step 2: Add POS and mnemonic generation plus high-quality overrides for Day 3–Day 5**

Use explicit overrides for the words most likely to be reviewed immediately, then safe morphology/phrase heuristics for the remaining curriculum. Single words without a reliable decomposition must use a usage hook rather than invented etymology.

- [ ] **Step 3: Generate real confusers using curated real-word/real-phrase banks plus string similarity**

```python
def pick_confusers(target, candidates, forbidden):
    ranked = sorted(
        (c for c in candidates if c != target and c not in forbidden),
        key=lambda c: (edit_distance(target.lower(), c.lower()), abs(len(target)-len(c)), c)
    )
    return ranked[:3]
```

- [ ] **Step 4: Generate a second cloze sentence from the word's collocation, never the card example**

Prefer collocation-based templates such as `I need to check my ______ before I answer.` for `schedule`, with grammar-aware fallbacks by POS.

- [ ] **Step 5: Write `lexicon.js`**

```python
Path('lexicon.js').write_text(
    'window.LX=' + json.dumps(entries, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8'
)
```

- [ ] **Step 6: Validate full coverage and data integrity**

Validator must assert every `plan.js` word has an enrichment entry, required fields are non-empty, confusers/cloze options are unique, answer appears once, and cloze differs from the card example.

Run:

```bash
python tools/build_lexicon.py
python tools/validate_lexicon.py
```

Expected: both exit 0 and validator prints the full enriched-word count.

### Task 2: Rebuild the page learning flow

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `window.P`, `window.LX`.
- Produces: seven visible learning sections and transient answer state for recognition, scene quiz, collocation matching, recall, review, and cloze.

- [ ] **Step 1: Load `lexicon.js` after `plan.js`**

```html
<script src="plan.js"></script>
<script src="lexicon.js"></script>
```

- [ ] **Step 2: Enrich word cards**

Render POS, Chinese meaning, mnemonic, collocation, English example, and Chinese example translation. Keep the speaker handler exactly word-only:

```js
c.querySelector('.speak').onclick=()=>speak(w[0]);
```

- [ ] **Step 3: Insert English→Chinese recognition before scene quiz**

Add `meaningQuiz()` with 10 questions, four Chinese choices, and immediate feedback.

- [ ] **Step 4: Replace scene distractors with `LX[word].confusers`**

No distractor may be drawn from the current day's other target words unless it is explicitly curated as a confuser.

- [ ] **Step 5: Add two-round collocation matching**

Split the 10 words into two groups of five. Tapping one left item and one right item locks correct pairs; wrong pairs remain available.

- [ ] **Step 6: Simplify recall and review prompts**

Before reveal, only show `2 秒内说英文`. Do not display the collocation in the instruction. Revealed answers may show both word and collocation.

- [ ] **Step 7: Replace bilingual context quiz with English-only cloze**

Use `LX[word].cloze` and `LX[word].clozeOptions`. Keep the existing current-day + up-to-five old/weak item selection logic.

- [ ] **Step 8: Renumber sections and update completion copy**

Displayed order: rich cards → English→Chinese → confusable scene quiz → collocation matching → 2-second recall → due review → English-only cloze.

### Task 3: Update documentation and regression checks

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document the seven-stage flow and browser-local progress**

- [ ] **Step 2: Run lexicon validation again after page changes**

```bash
python tools/validate_lexicon.py
```

Expected: PASS.

- [ ] **Step 3: Confirm no localStorage key migration was introduced**

Search `index.html` for `englishDeepTalk.v3`; expected exactly the existing key and no replacement key.

- [ ] **Step 4: Confirm word audio still uses only `speak(w[0])`**

### Task 4: Deploy and verify GitHub Pages

**Files:**
- Existing: `.github/workflows/pages.yml`

- [ ] **Step 1: Commit generated/modified production files**

Production diff should include `lexicon.js`, `index.html`, `README.md`, and validator tooling.

- [ ] **Step 2: Verify GitHub Pages workflow completes successfully**

Expected workflow: `Deploy English Training to GitHub Pages`, conclusion `success`.

- [ ] **Step 3: Inspect final `index.html` and `lexicon.js` from `main`**

Confirm all seven sections exist and Day 4 entries visibly include POS, mnemonic, translated example, curated confusers, collocation pair data, and English cloze data.

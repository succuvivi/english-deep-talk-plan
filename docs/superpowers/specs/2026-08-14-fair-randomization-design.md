# Fair Randomization Design

## Goal
All quiz/exercise question order and answer-choice order must be unpredictable and fair. Learning cards remain in curriculum order.

## Rules
- Use Fisher-Yates shuffle with unbiased random integers from `crypto.getRandomValues`; use `Math.random()` only as a compatibility fallback.
- Every candidate has equal probability of occupying every position at round creation.
- Question and option order is generated once per round/candidate set and cached so answering/re-rendering does not move items.
- Refreshing the page or switching Day starts a new random round.
- Random sampling is without replacement and equal-probability across the eligible candidate pool.

## Covered exercises
1. 看英文选中文: random question order + random Chinese choices.
2. 场景选择题: random question order + random English choices.
3. 搭配强化: randomly shuffle all 10 targets before splitting into two rounds; random left/right order.
4. 2 秒主动回忆: random question order.
5. 到期复习: fair random sampling within due pools and random final order.
6. 前一天弱词加强: random weak-word question order + random cloze choices.
7. 全英选词完形: random current/extension question order + random choices; extension sampling is equal-probability without replacement.

## Stability
- Random order is transient, not saved to localStorage.
- Re-rendering after answering does not reshuffle the current round.
- Switching Day clears the round cache and starts fresh random order.

## Compatibility
- Keep localStorage key `englishDeepTalk.v3` unchanged.
- Do not alter learning cards, weak-word persistence, 3-success removal, pronunciation behavior, or review cadence.

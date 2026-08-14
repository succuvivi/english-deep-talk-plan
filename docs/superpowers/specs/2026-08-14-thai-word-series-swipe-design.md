# Thai Word-Series Swipe Interaction — Design Spec

Date: 2026-08-14
Status: approved interaction design, pending implementation plan

## Goal

Add a mobile-first interaction that groups closely related Thai vocabulary into horizontal swipe series. Swiping left or right switches the **entire vocabulary card**, including the word, Thai spelling, romanization, Chinese pronunciation aid, playback, collocations, and examples.

The feature should make related vocabulary easier to compare and remember without turning every word into a carousel.

## Core interaction

A related-word group appears as one swipeable vocabulary unit.

Example: **口味**

- 甜
- 辣
- 酸
- 咸
- 淡

The learner sees one full vocabulary card at a time. Swiping horizontally replaces the whole card with the previous or next member.

The card includes the same information and actions as the current vocabulary card:

- Chinese meaning
- Thai spelling
- romanization
- Chinese approximate pronunciation
- favorite button
- word playback
- collocations
- examples
- independent playback for collocations/examples

## Navigation controls

Each series supports both touch and explicit controls:

1. **Touch swipe** on the card body for phone use.
2. **Previous / next arrow buttons** (`‹` and `›`) so the feature remains discoverable and usable without gestures.
3. **Progress indicator**, for example `2 / 5`.
4. **Series label**, for example `口味` or `方向`, displayed above or within the card header.

The first and last item do not wrap around. At the first item, the previous button is disabled; at the last item, the next button is disabled.

## Swipe behavior

- Horizontal swipe threshold: about 50 CSS pixels before changing cards.
- Predominantly vertical gestures must continue to scroll the page normally.
- A short tap must not accidentally switch cards.
- Switching cards must stop any currently playing TTS or recorded audio so audio never continues from a card that is no longer visible.
- The incoming card becomes the active item immediately after a successful swipe.
- Expanded `常用搭配` / `例句` sections reset to collapsed when moving to another item so the next card starts cleanly.

## Initial related-word groups

These are the minimum high-value groups for v1. Exact membership may be limited by which entries exist in a scene; unrelated words must not be forced into a group.

### Taste / food

**口味**
- 甜
- 辣
- 酸
- 咸
- 淡

**冷热 / 饮料状态**
- 热
- 冷
- 冰
- 少冰
- 不加冰

**增减**
- 少一点
- 多一点
- 不要
- 加

### Demonstratives / location

**指示**
- 这个
- 那个
- 这里
- 那里

**方向**
- 左边 / 左转
- 右边 / 右转
- 前面
- 后面
- 楼上
- 楼下

**距离**
- 远
- 近

### Quantity / state

**数量**
- 一个
- 两个
- 一公斤
- 半公斤

**有无 / 许可**
- 有
- 没有
- 可以
- 不可以

### Time

**时间**
- 今天
- 明天
- 昨天
- 现在
- 等一下

## What should remain a normal single card

Do not group words merely to create more swipe interactions.

Examples that should normally stay independent:

- 结账
- 过敏
- 门卡
- 收据
- 充电器
- 物业
- 修好了吗

A series is justified only when its members have an obvious semantic contrast, sequence, or substitution relationship that helps learning.

## Data model

Add optional series metadata to vocabulary entries:

```js
{
  id: 'restaurant-spicy',
  scene: ['restaurant'],
  zh: '辣',
  // existing vocabulary fields...
  seriesId: 'restaurant-taste',
  seriesLabel: '口味',
  seriesOrder: 2
}
```

Rules:

- `seriesId`: stable ID shared by related entries.
- `seriesLabel`: Chinese learner-facing label shared by the series.
- `seriesOrder`: integer defining swipe order.
- Entries without `seriesId` remain normal standalone cards.
- A valid series requires at least 2 visible members after scene/search filtering.
- If filtering leaves only 1 member, render that entry as a normal card rather than a one-item carousel.

## Rendering architecture

The vocabulary results renderer first filters entries using the existing search/scene/favorites logic, then groups the resulting entries:

1. Standalone entries are rendered with the existing card renderer.
2. Entries with the same `seriesId` become one `series-card` container.
3. Each `series-card` stores its own active index in memory.
4. The active member is rendered through the same vocabulary-card template used for standalone entries.

This keeps word content rendering in one place and makes the swipe interaction a wrapper around existing cards instead of a second card implementation.

## Search behavior

Search remains primarily Chinese-first.

When search matches a member of a series:

- Include the series only if one or more members match the current filter.
- The first matching member becomes active when the search result is first rendered.
- Only members that satisfy the active scene/search/favorites filter are part of that temporary swipe series.
- If just one member matches, show it as a normal standalone card.

Example: searching `辣` should not force the learner to swipe through unrelated non-matching taste words in the search-results view.

## Favorites behavior

Favorites remain entry-specific, not series-specific.

- Favoriting `辣` does not favorite `甜`.
- In `我的收藏`, related favorite entries can still form a series if at least 2 members of the same series are favorited.
- If only one member of a series is favorited, it appears as a normal card.

## Audio behavior

The existing audio engine remains unchanged except that series navigation calls `audioEngine.stop()` before changing the active member.

Every active card keeps independent playback for:

- the word
- every collocation
- every example

Audio speed and Thai-script visibility remain global settings.

## Accessibility

- Previous/next controls are real `<button>` elements.
- Disabled edge buttons use the native `disabled` attribute.
- Buttons have descriptive labels such as `上一个：甜` / `下一个：酸`.
- The progress indicator exposes readable text such as `第 2 个，共 5 个`.
- Swipe is an enhancement; every series is fully operable with buttons.
- Keyboard focus remains on the navigation button that was activated; the card change must not unexpectedly move focus.
- Touch behavior must not prevent normal vertical page scrolling.

## Visual treatment

The feature should look like part of the existing vocabulary design rather than a separate component family.

Recommended structure:

```text
口味                         2 / 5

‹   [ full vocabulary card: 辣 ]   ›

      ●  ●  ●  ○  ○   (optional subtle dots)
```

Requirements:

- Main card width remains within the existing mobile content column.
- Arrows must have at least 44px touch targets.
- Avoid showing multiple full cards side-by-side on a narrow phone.
- A subtle hint that horizontal swipe is available may be shown the first time, but no tutorial modal is needed.
- Progress text is required; pagination dots are optional.

## Error / edge handling

- Missing or duplicate `seriesOrder`: sort deterministically by entry order and fail the data test so content can be corrected.
- A `seriesId` with only one entry in the full dataset is invalid and should fail data validation.
- Filtering to one member is valid and renders a normal card.
- Changing search or scene resets active indexes based on the new filtered results.
- Re-rendering after a favorite toggle must not produce an out-of-range active index.

## Testing strategy

### Pure grouping tests

Add a pure helper such as:

```js
groupEntriesForDisplay(entries)
```

Verify:

- standalone entries remain standalone;
- same-series entries become one ordered group;
- series members sort by `seriesOrder`;
- one surviving filtered member becomes standalone;
- independent series do not merge.

### Data tests

Verify:

- each series has at least 2 dataset members;
- `seriesId` + `seriesLabel` are consistently paired;
- `seriesOrder` values are unique within a series;
- required high-value groups exist where their words exist in the dataset.

### Interaction tests / manual QA

Verify on phone-width layout:

- drag left switches to next full card;
- drag right switches to previous full card;
- vertical scrolling is not blocked;
- short taps do not trigger a swipe;
- arrows switch cards;
- first/last arrows disable correctly;
- progress text updates;
- current audio stops when card changes;
- expanded details close when card changes;
- favorites remain entry-specific;
- search with one matching group member renders a normal card.

## Acceptance criteria

The feature is complete when:

1. Related vocabulary can be explicitly tagged into semantic series.
2. A series renders one full vocabulary card at a time.
3. The learner can navigate by horizontal swipe and arrow buttons.
4. The full word card changes, including collocations and examples.
5. Progress is clearly visible (`current / total`).
6. Standalone vocabulary remains unchanged.
7. Search and favorites only group members still visible after filtering.
8. Audio stops on series navigation.
9. Vertical page scrolling continues to work naturally on phones.
10. Existing search, favorites, TTS, slow playback, and Thai show/hide behavior remain intact.

## Explicitly out of scope

- Infinite / looping carousel
- Auto-advance
- Timed slideshow
- Swiping between unrelated vocabulary
- Saving the last active item of every series across browser sessions
- Drag physics libraries or third-party carousel dependencies

## Decisions confirmed with user

- Interaction applies to semantic word series, not every vocabulary item.
- Swipe changes the **entire vocabulary card**, not only the word heading.
- Touch swipe and arrow navigation are both included.
- Progress indicator is included.
- High-value groups include taste, demonstratives, directions, quantity/state, temperature, distance, and time.

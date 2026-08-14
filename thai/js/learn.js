import { ENTRIES } from '../data/index.js';
import { SCENES } from '../data/scenes.js';
import { parseLearnQuery, filterEntries, escapeHtml } from './core.js';
import { learnerState } from './state.js';
import { audioEngine } from './audio.js';
import { groupEntriesForDisplay, clampSeriesIndex, getSeriesViewState, beginSwipeGesture, finishSwipeGesture } from './series.js';

const results = document.querySelector('#results');
const emptyState = document.querySelector('#empty-state');
const pageTitle = document.querySelector('#page-title');
const searchForm = document.querySelector('#scene-search');
const searchInput = document.querySelector('#scene-q');
const toast = document.querySelector('#toast');

const initial = parseLearnQuery(window.location.search);
let queryState = { ...initial };
let toastTimer = null;
const seriesIndexes = new Map();
let displayItems = [];
let swipeStart = null;

function getScene(id) {
  return SCENES.find(scene => scene.id === id) || null;
}

function setTitle() {
  if (queryState.favoritesOnly) {
    pageTitle.textContent = '我的收藏';
  } else if (queryState.scene) {
    pageTitle.textContent = getScene(queryState.scene)?.title || '泰语生活词库';
  } else if (queryState.q) {
    pageTitle.textContent = `搜索：${queryState.q}`;
  } else {
    pageTitle.textContent = '全部词汇';
  }
  document.title = `${pageTitle.textContent} · 泰语生活词库`;
}

function phraseHtml(item, entryId, kind, index) {
  return `
    <div class="phrase-item">
      <div class="phrase-main">
        <strong>${escapeHtml(item.zh)}</strong>
        <div class="thai">${escapeHtml(item.th)}</div>
        <div class="roman">${escapeHtml(item.roman)}</div>
        ${item.zhPron ? `<div class="zh-pron">近似音：${escapeHtml(item.zhPron)}</div>` : ''}
      </div>
      <button type="button" class="play-btn compact" data-play-entry="${escapeHtml(entryId)}" data-play-kind="${kind}" data-play-index="${index}" aria-label="播放 ${escapeHtml(item.zh)}">🔊</button>
    </div>
  `;
}

function entryHtml(entry) {
  const favorite = learnerState.isFavorite(entry.id);
  return `
    <article class="vocab-card" data-entry-id="${escapeHtml(entry.id)}">
      <div class="vocab-head">
        <div class="vocab-main">
          <div class="word-meta">${escapeHtml(entry.type || '词汇')}</div>
          <h2>${escapeHtml(entry.zh)}</h2>
          <div class="thai">${escapeHtml(entry.th)}</div>
          <div class="roman">${escapeHtml(entry.roman)}</div>
          <div class="zh-pron">中文近似音：${escapeHtml(entry.zhPron)}</div>
        </div>
        <button type="button" class="favorite-btn" data-favorite="${escapeHtml(entry.id)}" aria-label="${favorite ? '取消收藏' : '收藏'} ${escapeHtml(entry.zh)}">${favorite ? '★' : '☆'}</button>
      </div>
      <div class="play-row">
        <button type="button" class="play-btn primary" data-play-entry="${escapeHtml(entry.id)}" data-play-kind="entry" data-play-index="0">🔊 听单词</button>
      </div>
      <details>
        <summary>常用搭配 <span>${entry.collocations.length}</span></summary>
        <div class="phrase-list">${entry.collocations.map((item, index) => phraseHtml(item, entry.id, 'collocation', index)).join('')}</div>
      </details>
      <details>
        <summary>例句 <span>${entry.examples.length}</span></summary>
        <div class="phrase-list">${entry.examples.map((item, index) => phraseHtml(item, entry.id, 'example', index)).join('')}</div>
      </details>
    </article>
  `;
}

function activeSeriesIndex(group) {
  return clampSeriesIndex(seriesIndexes.get(group.id) ?? 0, group.entries.length);
}

function seriesHtml(group) {
  const state = getSeriesViewState(group, activeSeriesIndex(group));
  seriesIndexes.set(group.id, state.index);

  const previousLabel = state.previous ? `上一个：${state.previous.zh}` : '已经是第一个';
  const nextLabel = state.next ? `下一个：${state.next.zh}` : '已经是最后一个';

  return `
    <section class="series-shell" data-series-id="${escapeHtml(group.id)}">
      <div class="series-toolbar">
        <div>
          <strong class="series-label">${escapeHtml(group.label)}</strong>
          <span class="series-hint">左右滑动整张词卡</span>
        </div>
        <div class="series-controls" aria-label="同系列词切换">
          <button type="button" class="series-nav" data-series-nav="prev" ${state.atStart ? 'disabled' : ''} aria-label="${escapeHtml(previousLabel)}">‹</button>
          <span class="series-progress" aria-label="第 ${state.current} 个，共 ${state.total} 个">${state.current} / ${state.total}</span>
          <button type="button" class="series-nav" data-series-nav="next" ${state.atEnd ? 'disabled' : ''} aria-label="${escapeHtml(nextLabel)}">›</button>
        </div>
      </div>
      <div class="series-swipe-surface" data-series-swipe="${escapeHtml(group.id)}">
        ${entryHtml(state.active)}
      </div>
    </section>
  `;
}

function displayItemHtml(item) {
  return item.kind === 'series' ? seriesHtml(item) : entryHtml(item.entry);
}

function filteredEntries() {
  return filterEntries(ENTRIES, {
    scene: queryState.scene,
    q: queryState.q,
    favoritesOnly: queryState.favoritesOnly,
    favoriteIds: learnerState.getFavorites()
  });
}

function render() {
  setTitle();
  searchInput.value = queryState.q;
  const entries = filteredEntries();
  displayItems = groupEntriesForDisplay(entries);

  const validSeries = new Set(displayItems.filter(item => item.kind === 'series').map(item => item.id));
  for (const id of seriesIndexes.keys()) {
    if (!validSeries.has(id)) seriesIndexes.delete(id);
  }

  results.innerHTML = displayItems.map(displayItemHtml).join('');
  emptyState.hidden = entries.length > 0;
}

function syncControls() {
  const showThai = learnerState.getShowThai();
  const speed = learnerState.getSpeechRate();
  document.body.classList.toggle('hide-thai', !showThai);
  document.querySelectorAll('[data-action="toggle-thai"]').forEach(button => {
    button.textContent = `泰文：${showThai ? '显示' : '隐藏'}`;
  });
  document.querySelectorAll('[data-action="toggle-speed"]').forEach(button => {
    button.textContent = `语速：${speed === 'slow' ? '慢速' : '正常'}`;
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
}

function playableItem(entry, kind, index) {
  if (kind === 'entry') return entry;
  if (kind === 'collocation') return entry.collocations[index];
  if (kind === 'example') return entry.examples[index];
  return null;
}

function currentSeriesGroup(id) {
  return displayItems.find(item => item.kind === 'series' && item.id === id) || null;
}

function replaceSeriesShell(group, focusDirection = null) {
  const oldShell = [...results.querySelectorAll('[data-series-id]')]
    .find(element => element.dataset.seriesId === group.id);
  if (!oldShell) return;

  const template = document.createElement('template');
  template.innerHTML = seriesHtml(group).trim();
  const freshShell = template.content.firstElementChild;
  oldShell.replaceWith(freshShell);

  if (focusDirection) {
    const sameButton = freshShell.querySelector(`[data-series-nav="${focusDirection}"]:not(:disabled)`);
    const fallbackDirection = focusDirection === 'next' ? 'prev' : 'next';
    (sameButton || freshShell.querySelector(`[data-series-nav="${fallbackDirection}"]:not(:disabled)`))?.focus();
  }
}

function moveSeries(id, direction, focusDirection = null) {
  const group = currentSeriesGroup(id);
  if (!group) return;

  const current = activeSeriesIndex(group);
  const delta = direction === 'next' ? 1 : -1;
  const next = clampSeriesIndex(current + delta, group.entries.length);
  if (next === current) return;

  audioEngine.stop();
  seriesIndexes.set(id, next);
  replaceSeriesShell(group, focusDirection);
}

results.addEventListener('click', async event => {
  const navButton = event.target.closest('[data-series-nav]');
  if (navButton) {
    const shell = navButton.closest('[data-series-id]');
    if (shell) moveSeries(shell.dataset.seriesId, navButton.dataset.seriesNav, navButton.dataset.seriesNav);
    return;
  }

  const favoriteButton = event.target.closest('[data-favorite]');
  if (favoriteButton) {
    learnerState.toggleFavorite(favoriteButton.dataset.favorite);
    render();
    return;
  }

  const playButton = event.target.closest('[data-play-entry]');
  if (!playButton) return;
  const entry = ENTRIES.find(item => item.id === playButton.dataset.playEntry);
  if (!entry) return;
  const item = playableItem(entry, playButton.dataset.playKind, Number(playButton.dataset.playIndex));
  if (!item) return;

  playButton.disabled = true;
  try {
    await audioEngine.play(item, learnerState.getSpeechRate());
  } catch (error) {
    if (String(error?.message).includes('NO_THAI_VOICE')) {
      showToast('当前设备没有可用的泰语语音。可以换 Chrome / Safari 或在系统里安装泰语语音。');
    } else {
      showToast('播放失败，请再试一次。');
    }
  } finally {
    playButton.disabled = false;
  }
});

results.addEventListener('pointerdown', event => {
  const surface = event.target.closest('[data-series-swipe]');
  if (!surface) return;
  if (event.target.closest('button, a, input, summary')) return;

  swipeStart = beginSwipeGesture(
    surface.dataset.seriesSwipe,
    event.pointerId,
    event.clientX,
    event.clientY
  );
});

results.addEventListener('pointerup', event => {
  const result = finishSwipeGesture(
    swipeStart,
    event.pointerId,
    event.clientX,
    event.clientY,
    50
  );
  swipeStart = null;
  if (result) moveSeries(result.id, result.direction);
});

results.addEventListener('pointercancel', event => {
  if (swipeStart?.pointerId === event.pointerId) swipeStart = null;
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  queryState.q = searchInput.value.trim();
  seriesIndexes.clear();
  render();
});

document.querySelectorAll('[data-action="toggle-thai"]').forEach(button => {
  button.addEventListener('click', () => {
    learnerState.setShowThai(!learnerState.getShowThai());
    syncControls();
  });
});

document.querySelectorAll('[data-action="toggle-speed"]').forEach(button => {
  button.addEventListener('click', () => {
    learnerState.setSpeechRate(learnerState.getSpeechRate() === 'slow' ? 'normal' : 'slow');
    syncControls();
  });
});

syncControls();
render();

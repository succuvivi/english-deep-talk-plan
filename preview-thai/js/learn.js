import { ENTRIES } from '../data/index.js';
import { SCENES } from '../data/scenes.js';
import { parseLearnQuery, filterEntries, escapeHtml } from './core.js';
import { learnerState } from './state.js';
import { audioEngine } from './audio.js';
import { groupEntriesForDisplay, getSeriesTrackProgress, renderSeriesTrack } from './series.js';

const results = document.querySelector('#results');
const emptyState = document.querySelector('#empty-state');
const pageTitle = document.querySelector('#page-title');
const searchForm = document.querySelector('#scene-search');
const searchInput = document.querySelector('#scene-q');
const toast = document.querySelector('#toast');

const initial = parseLearnQuery(window.location.search);
let queryState = { ...initial };
let toastTimer = null;
let displayItems = [];
const seriesScrollState = new WeakMap();

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
  const humanAudio = Boolean(item.audio);
  return `
    <div class="phrase-item">
      <div class="phrase-main">
        <strong>${escapeHtml(item.zh)}</strong>
        <div class="thai">${escapeHtml(item.th)}</div>
        <div class="roman">${escapeHtml(item.roman)}</div>
        ${item.zhPron ? `<div class="zh-pron">近似音：${escapeHtml(item.zhPron)}</div>` : ''}
      </div>
      <div class="phrase-audio">
        <button type="button" class="play-btn compact" data-play-entry="${escapeHtml(entryId)}" data-play-kind="${kind}" data-play-index="${index}" aria-label="播放 ${escapeHtml(item.zh)}">🔊</button>
        <span class="audio-source-tag">${humanAudio ? '真人录音' : '设备语音'}</span>
      </div>
    </div>
  `;
}

function entryHtml(entry) {
  const favorite = learnerState.isFavorite(entry.id);
  const humanAudio = Boolean(entry.audio);
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
        <button type="button" class="play-btn primary" data-play-entry="${escapeHtml(entry.id)}" data-play-kind="entry" data-play-index="0">${humanAudio ? '🔊 听真人泰语' : '🔊 听泰语'}</button>
        <span class="audio-source-tag">${humanAudio ? '真人录音' : '设备语音'}</span>
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

function seriesHtml(group) {
  return renderSeriesTrack(group, entryHtml, escapeHtml);
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

function settleSeriesTrack(track) {
  if (!track) return;
  const slideCount = track.querySelectorAll('.series-slide').length;
  const { current, total } = getSeriesTrackProgress(track.scrollLeft, track.clientWidth, slideCount);
  const progress = track.closest('[data-series-id]')?.querySelector('.series-progress');
  if (progress) {
    progress.textContent = `${current} / ${total}`;
    progress.setAttribute('aria-label', `第 ${current} 个，共 ${total} 个`);
  }
  const state = seriesScrollState.get(track) || {};
  clearTimeout(state.timer);
  seriesScrollState.set(track, {
    ...state,
    timer: null,
    lastSettled: track.scrollLeft,
    audioStopped: false
  });
}

function handleSeriesScroll(track) {
  const existing = seriesScrollState.get(track) || {
    lastSettled: 0,
    audioStopped: false,
    timer: null
  };
  const moved = Math.abs(track.scrollLeft - existing.lastSettled);
  if (moved >= 12 && !existing.audioStopped) {
    audioEngine.stop();
    existing.audioStopped = true;
  }
  clearTimeout(existing.timer);
  existing.timer = setTimeout(() => settleSeriesTrack(track), 120);
  seriesScrollState.set(track, existing);
}

results.addEventListener('click', async event => {
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
    const hadHumanAudio = Boolean(item.audio);
    const result = await audioEngine.play(item, learnerState.getSpeechRate());
    if (hadHumanAudio && result.mode === 'tts') {
      showToast('真人录音播放失败，正在使用设备泰语语音');
    }
  } catch {
    showToast('播放失败，请再试一次。');
  } finally {
    playButton.disabled = false;
  }
});

results.addEventListener('scroll', event => {
  const track = event.target.closest?.('[data-series-track]');
  if (track) handleSeriesScroll(track);
}, true);

results.addEventListener('scrollend', event => {
  const track = event.target.closest?.('[data-series-track]');
  if (track) settleSeriesTrack(track);
}, true);

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  queryState.q = searchInput.value.trim();
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

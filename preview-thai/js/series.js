export function groupEntriesForDisplay(entries) {
  const output = [];
  const seenSeries = new Set();

  entries.forEach(entry => {
    if (!entry.seriesId) {
      output.push({ kind: 'entry', entry });
      return;
    }

    if (seenSeries.has(entry.seriesId)) return;
    seenSeries.add(entry.seriesId);

    const members = entries
      .filter(candidate => candidate.seriesId === entry.seriesId)
      .map((candidate, originalIndex) => ({ candidate, originalIndex }))
      .sort((a, b) => {
        const orderA = Number.isFinite(a.candidate.seriesOrder) ? a.candidate.seriesOrder : Number.MAX_SAFE_INTEGER;
        const orderB = Number.isFinite(b.candidate.seriesOrder) ? b.candidate.seriesOrder : Number.MAX_SAFE_INTEGER;
        return orderA - orderB || a.originalIndex - b.originalIndex;
      })
      .map(item => item.candidate);

    if (members.length < 2) {
      output.push({ kind: 'entry', entry: members[0] || entry });
      return;
    }

    output.push({
      kind: 'series',
      id: entry.seriesId,
      label: entry.seriesLabel || '同系列',
      entries: members
    });
  });

  return output;
}

export function clampSeriesIndex(index, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return Math.min(Math.max(Number.isFinite(index) ? index : 0, 0), length - 1);
}

export function getSwipeDirection(deltaX, deltaY, threshold = 50) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX < threshold || absX <= absY) return null;
  return deltaX < 0 ? 'next' : 'prev';
}

export function getSeriesViewState(group, index) {
  const entries = group?.entries || [];
  const safeIndex = clampSeriesIndex(index, entries.length);
  return {
    index: safeIndex,
    active: entries[safeIndex] || null,
    previous: entries[safeIndex - 1] || null,
    next: entries[safeIndex + 1] || null,
    current: entries.length ? safeIndex + 1 : 0,
    total: entries.length,
    atStart: safeIndex === 0,
    atEnd: entries.length === 0 || safeIndex === entries.length - 1
  };
}

export function beginSwipeGesture(id, pointerId, x, y) {
  return { id, pointerId, x, y };
}

export function finishSwipeGesture(start, pointerId, x, y, threshold = 50) {
  if (!start || start.pointerId !== pointerId) return null;
  const direction = getSwipeDirection(x - start.x, y - start.y, threshold);
  return direction ? { id: start.id, direction } : null;
}

export function getSeriesTrackIndex(scrollLeft, slideWidth, count) {
  if (!Number.isFinite(slideWidth) || slideWidth <= 0 || !Number.isFinite(count) || count <= 0) return 0;
  const raw = Math.round(Math.max(0, Number.isFinite(scrollLeft) ? scrollLeft : 0) / slideWidth);
  return Math.max(0, Math.min(raw, count - 1));
}

export function getSeriesTrackProgress(scrollLeft, slideWidth, count) {
  const total = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const index = getSeriesTrackIndex(scrollLeft, slideWidth, total);
  return { index, current: total ? index + 1 : 0, total };
}

export function renderSeriesTrack(group, renderEntry, escape = value => String(value)) {
  const entries = group?.entries || [];
  const total = entries.length;
  return `
    <section class="series-shell" data-series-id="${escape(group.id)}">
      <div class="series-heading">
        <div>
          <strong class="series-label">${escape(group.label || '同系列')}</strong>
          <span class="series-hint">左右滑动整张词卡</span>
        </div>
        <span class="series-progress" aria-label="第 ${total ? 1 : 0} 个，共 ${total} 个">${total ? 1 : 0} / ${total}</span>
      </div>
      <div class="series-track" data-series-track="${escape(group.id)}" aria-label="${escape(group.label || '同系列')}，同系列词，可左右滑动">
        ${entries.map(entry => `<div class="series-slide">${renderEntry(entry)}</div>`).join('')}
      </div>
    </section>
  `;
}

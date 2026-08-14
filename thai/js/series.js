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

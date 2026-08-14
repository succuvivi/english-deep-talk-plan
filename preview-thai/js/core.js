export function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function parseLearnQuery(search) {
  const params = new URLSearchParams(search || '');
  return {
    scene: params.get('scene') || null,
    q: params.get('q') || '',
    favoritesOnly: params.get('favorites') === '1'
  };
}

function searchableText(entry) {
  return normalizeText([
    entry.zh,
    entry.th,
    entry.roman,
    ...(entry.keywords || []),
    ...(entry.collocations || []).flatMap(item => [item.zh, item.th, item.roman]),
    ...(entry.examples || []).flatMap(item => [item.zh, item.th, item.roman])
  ].filter(Boolean).join(' '));
}

export function filterEntries(entries, { scene = null, q = '', favoritesOnly = false, favoriteIds = [] } = {}) {
  const needle = normalizeText(q);
  const favorites = new Set(favoriteIds || []);
  return entries.filter(entry => {
    if (scene && !(entry.scene || []).includes(scene)) return false;
    if (favoritesOnly && !favorites.has(entry.id)) return false;
    if (needle && !searchableText(entry).includes(needle)) return false;
    return true;
  });
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

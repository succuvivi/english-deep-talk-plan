export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeHttpUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return /^(https?):$/.test(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function uniqueSourceRows(rows) {
  const seen = new Set();
  return (rows || []).filter(row => {
    const key = row.sourceFileTitle || row.localPath;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function renderSourceRow(row) {
  const sourceUrl = safeHttpUrl(row.sourceUrl);
  const licenseUrl = safeHttpUrl(row.licenseUrl);
  const source = sourceUrl
    ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.source || '来源页面')}</a>`
    : escapeHtml(row.source || '来源页面');
  const license = licenseUrl
    ? `<a href="${escapeHtml(licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.license)}</a>`
    : escapeHtml(row.license || '开放许可');
  return `
    <article class="audio-source-card">
      <div class="audio-source-thai">${escapeHtml(row.thai)}</div>
      <div><strong>录音者：</strong>${escapeHtml(row.creator || '来源页未标注')}</div>
      <div><strong>来源：</strong>${source}</div>
      <div><strong>许可：</strong>${license}</div>
    </article>
  `;
}

async function loadSources() {
  const coverage = document.querySelector('#audio-coverage');
  const list = document.querySelector('#audio-sources-list');
  try {
    const response = await fetch('./audio/sources.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();
    const humanEntries = new Set(rows.map(row => row.entryId)).size;
    coverage.textContent = `真人单词录音 ${humanEntries} / 360 · 其余词条使用设备泰语语音`;
    const unique = uniqueSourceRows(rows);
    list.innerHTML = unique.length
      ? unique.map(renderSourceRow).join('')
      : '<p class="empty-state">当前分支还没有导入真人录音。</p>';
  } catch {
    coverage.textContent = '音频来源暂时无法读取。';
    list.innerHTML = '';
  }
}

if (typeof document !== 'undefined') loadSources();

import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function createPacedFetch(fetchImpl, {
  gapMs = 1000,
  retryDelays = [1500, 3000, 6000],
  maxRetryAfterMs = 10000,
  sleepFn = ms => new Promise(resolve => setTimeout(resolve, ms)),
  nowFn = () => Date.now()
} = {}) {
  let queue = Promise.resolve();
  let lastStartedAt = 0;

  return function pacedFetch(url, options) {
    const task = queue.then(async () => {
      const gap = Number(gapMs);
      if (lastStartedAt && Number.isFinite(gap) && gap > 0) {
        const remaining = gap - (nowFn() - lastStartedAt);
        if (remaining > 0) await sleepFn(remaining);
      }

      for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
        lastStartedAt = nowFn();
        const response = await fetchImpl(url, options);
        if (response.status !== 429 || attempt === retryDelays.length) return response;

        const retryAfterSeconds = Number(response.headers?.get?.('retry-after'));
        const requestedMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds * 1000
          : retryDelays[attempt];
        const cappedMs = Number.isFinite(maxRetryAfterMs) && maxRetryAfterMs > 0
          ? Math.min(requestedMs, maxRetryAfterMs)
          : requestedMs;
        await sleepFn(Math.max(retryDelays[attempt], cappedMs));
      }
      throw new Error('unreachable fetch retry state');
    });

    queue = task.then(() => undefined, () => undefined);
    return task;
  };
}

export async function runPacedImport({
  repoRoot = process.cwd(),
  fetchImpl = globalThis.fetch,
  gapMs = Number(process.env.COMMONS_REQUEST_GAP_MS || 1000)
} = {}) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = createPacedFetch(fetchImpl, { gapMs });
  try {
    const { runImport } = await import('./import_thai_audio.mjs');
    return await runImport({ repoRoot, download: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  runPacedImport({ repoRoot: process.cwd() }).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

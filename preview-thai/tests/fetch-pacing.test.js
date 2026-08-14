import test from 'node:test';
import assert from 'node:assert/strict';
import { createPacedFetch } from '../../tools/run_thai_audio_import.mjs';

test('paced fetch serializes concurrent requests and inserts a gap', async () => {
  let clock = 1000;
  const calls = [];
  const waits = [];
  const fetchImpl = async url => {
    calls.push({ url, at: clock });
    return { status: 200, ok: true, headers: { get: () => null } };
  };
  const paced = createPacedFetch(fetchImpl, {
    gapMs: 100,
    nowFn: () => clock,
    sleepFn: async ms => { waits.push(ms); clock += ms; }
  });
  await Promise.all([paced('a'), paced('b'), paced('c')]);
  assert.deepEqual(calls.map(call => call.url), ['a', 'b', 'c']);
  assert.deepEqual(calls.map(call => call.at), [1000, 1100, 1200]);
  assert.deepEqual(waits, [100, 100]);
});

test('paced fetch retries 429 without waiting an excessive Retry-After', async () => {
  let calls = 0;
  const waits = [];
  const paced = createPacedFetch(async () => {
    calls += 1;
    if (calls === 1) return { status: 429, ok: false, headers: { get: () => '9999' } };
    return { status: 200, ok: true, headers: { get: () => null } };
  }, {
    gapMs: 0,
    retryDelays: [50],
    maxRetryAfterMs: 500,
    sleepFn: async ms => waits.push(ms),
    nowFn: () => 1
  });
  const response = await paced('x');
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
  assert.deepEqual(waits, [500]);
});

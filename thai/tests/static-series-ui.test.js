import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const learn = readFileSync(new URL('../js/learn.js', import.meta.url), 'utf8');

test('series UI is native full-card scroll snap without navigation buttons', () => {
  assert.match(css, /\.series-track\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /\.series-slide\s*\{[\s\S]*flex:\s*0 0 100%/);
  assert.doesNotMatch(css, /\.series-nav\s*\{/);
  assert.doesNotMatch(learn, /data-series-nav/);
  assert.doesNotMatch(learn, /pointerdown/);
  assert.match(learn, /getSeriesTrackProgress/);
});

test('audio controls label human recordings separately from device Thai voice', () => {
  assert.match(learn, /听真人泰语/);
  assert.match(learn, /真人录音/);
  assert.match(learn, /设备语音/);
  assert.match(learn, /真人录音播放失败，正在使用设备泰语语音/);
});

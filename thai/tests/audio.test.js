import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioEngine } from '../js/audio.js';

class FakeUtterance {
  constructor(text) { this.text = text; this.lang = ''; this.rate = 1; this.voice = null; }
}
function fakeSynth(voices) {
  return { cancelCalls: 0, spoken: [], getVoices: () => voices,
    cancel() { this.cancelCalls += 1; },
    speak(utterance) { this.spoken.push(utterance); utterance.onend?.(); } };
}

test('TTS cancels current speech, selects Thai voice, and uses slow rate', async () => {
  const synth = fakeSynth([{ name: 'English', lang: 'en-US' }, { name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: null });
  const result = await engine.play({ th: 'เผ็ด', audio: null }, 'slow');
  assert.equal(result.mode, 'tts');
  assert.equal(synth.cancelCalls, 1);
  assert.equal(synth.spoken[0].voice.name, 'Thai');
  assert.equal(synth.spoken[0].rate, 0.65);
});

test('recorded audio is used before TTS at normal playback rate', async () => {
  const instances = [];
  class FakeAudio { constructor(src) { this.src = src; this.playbackRate = 99; instances.push(this); } play() { return Promise.resolve(); } pause() {} }
  const synth = fakeSynth([{ name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: FakeAudio });
  const result = await engine.play({ th: 'กาแฟ', audio: './audio/words/coffee-01.wav' }, 'normal');
  assert.equal(result.mode, 'audio');
  assert.equal(instances[0].src, './audio/words/coffee-01.wav');
  assert.equal(instances[0].playbackRate, 1);
  assert.equal(synth.spoken.length, 0);
});

test('slow recorded audio reuses the same file at 0.8 playback rate', async () => {
  const instances = [];
  class FakeAudio { constructor(src) { this.src = src; this.playbackRate = 1; instances.push(this); } play() { return Promise.resolve(); } pause() {} }
  const synth = fakeSynth([]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: FakeAudio });
  await engine.play({ th: 'กาแฟ', audio: './audio/words/coffee-01.wav' }, 'slow');
  assert.equal(instances[0].src, './audio/words/coffee-01.wav');
  assert.equal(instances[0].playbackRate, 0.8);
});

test('broken recorded audio falls back to Thai TTS', async () => {
  class BrokenAudio { constructor(src) { this.src = src; } play() { return Promise.reject(new Error('404')); } pause() {} }
  const synth = fakeSynth([{ name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: BrokenAudio });
  const result = await engine.play({ th: 'เผ็ด', audio: 'missing.mp3', roman: 'phet', zhPron: '配' }, 'normal');
  assert.equal(result.mode, 'tts');
  assert.equal(synth.spoken[0].text, 'เผ็ด');
  assert.notEqual(synth.spoken[0].text, 'phet');
});

test('missing speech synthesis throws a stable unavailable error', async () => {
  const engine = createAudioEngine({ speechSynthesis: null, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: null });
  await assert.rejects(() => engine.play({ th: 'เผ็ด', audio: null }, 'normal'), /TTS_UNAVAILABLE/);
});

test('missing listed Thai voice still uses lang-based browser TTS fallback', async () => {
  const synth = fakeSynth([{ name: 'English', lang: 'en-US' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: null });
  const result = await engine.play({ th: 'เผ็ด', audio: null }, 'normal');
  assert.equal(result.mode, 'tts');
  assert.equal(synth.spoken.length, 1);
  assert.equal(synth.spoken[0].lang, 'th-TH');
  assert.equal(synth.spoken[0].voice, null);
});

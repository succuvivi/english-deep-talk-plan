import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioEngine } from '../js/audio.js';

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.voice = null;
  }
}

function fakeSynth(voices) {
  return {
    cancelCalls: 0,
    spoken: [],
    getVoices: () => voices,
    cancel() { this.cancelCalls += 1; },
    speak(utterance) { this.spoken.push(utterance); utterance.onend?.(); }
  };
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

test('recorded audio is used before TTS', async () => {
  const played = [];
  class FakeAudio {
    constructor(src) { this.src = src; }
    play() { played.push(this.src); return Promise.resolve(); }
    pause() {}
  }
  const synth = fakeSynth([{ name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: FakeAudio });
  const result = await engine.play({ th: 'เผ็ด', audio: 'audio/phet.mp3' }, 'normal');
  assert.equal(result.mode, 'audio');
  assert.deepEqual(played, ['audio/phet.mp3']);
  assert.equal(synth.spoken.length, 0);
});

test('broken recorded audio falls back to Thai TTS', async () => {
  class BrokenAudio {
    constructor(src) { this.src = src; }
    play() { return Promise.reject(new Error('404')); }
    pause() {}
  }
  const synth = fakeSynth([{ name: 'Thai', lang: 'th-TH' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: BrokenAudio });
  const result = await engine.play({ th: 'เผ็ด', audio: 'missing.mp3' }, 'normal');
  assert.equal(result.mode, 'tts');
  assert.equal(synth.spoken[0].text, 'เผ็ด');
});

test('missing Thai voice throws a stable error', async () => {
  const synth = fakeSynth([{ name: 'English', lang: 'en-US' }]);
  const engine = createAudioEngine({ speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance, AudioCtor: null });
  await assert.rejects(() => engine.play({ th: 'เผ็ด', audio: null }, 'normal'), /NO_THAI_VOICE/);
});

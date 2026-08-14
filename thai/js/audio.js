export function createAudioEngine({ speechSynthesis, SpeechSynthesisUtterance, AudioCtor }) {
  let currentAudio = null;

  function stop() {
    speechSynthesis?.cancel?.();
    if (currentAudio) {
      currentAudio.pause?.();
      try { currentAudio.currentTime = 0; } catch {}
      currentAudio = null;
    }
  }

  function playTts(item, speed) {
    if (!speechSynthesis?.speak || !SpeechSynthesisUtterance) {
      throw new Error('TTS_UNAVAILABLE');
    }

    const voices = speechSynthesis.getVoices?.() || [];
    const voice = voices.find(v => /^th(-|$)/i.test(v.lang || '')) || null;

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(item.th);
      utterance.lang = 'th-TH';
      if (voice) utterance.voice = voice;
      utterance.rate = speed === 'slow' ? 0.65 : 0.9;
      utterance.onend = () => resolve({ mode: 'tts' });
      utterance.onerror = () => reject(new Error('TTS_FAILED'));
      speechSynthesis.speak(utterance);
    });
  }

  async function play(item, speed = 'normal') {
    stop();

    if (item.audio && AudioCtor) {
      currentAudio = new AudioCtor(item.audio);
      currentAudio.playbackRate = speed === 'slow' ? 0.8 : 1;
      try {
        await currentAudio.play();
        return { mode: 'audio' };
      } catch {
        currentAudio = null;
      }
    }

    return playTts(item, speed);
  }

  return { play, stop };
}

export const audioEngine = typeof window !== 'undefined'
  ? createAudioEngine({
      speechSynthesis: window.speechSynthesis,
      SpeechSynthesisUtterance: window.SpeechSynthesisUtterance,
      AudioCtor: window.Audio
    })
  : null;

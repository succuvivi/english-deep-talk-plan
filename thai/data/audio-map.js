export const AUDIO_BY_ENTRY_ID = {};

export function applyAudioMetadata(entries, audioMap = AUDIO_BY_ENTRY_ID) {
  return entries.map(entry => {
    const audio = audioMap[entry.id];
    return audio ? { ...entry, audio } : { ...entry };
  });
}

export const AUDIO_BY_ENTRY_ID = {
  "coffee-01": "./audio/words/coffee-01.wav",
  "coffee-02": "./audio/words/coffee-02.ogg",
  "coffee-04": "./audio/words/coffee-04.wav",
  "coffee-08": "./audio/words/coffee-08.wav",
  "convenience-15": "./audio/words/convenience-15.ogg",
  "greetings-extra06": "./audio/words/greetings-extra06.wav",
  "greetings-extra08": "./audio/words/greetings-extra08.wav",
  "hospital-03": "./audio/words/hospital-03.ogg",
  "laundry-12": "./audio/words/laundry-12.wav",
  "market-06": "./audio/words/market-06.ogg",
  "massage-05": "./audio/words/massage-05.wav",
  "petrol-15": "./audio/words/convenience-15.ogg",
  "restaurant-extra07": "./audio/words/convenience-15.ogg",
  "restaurant-extra08": "./audio/words/coffee-08.wav",
  "restaurant-extra09": "./audio/words/restaurant-extra09.oga",
  "restaurant-extra11": "./audio/words/restaurant-extra11.ogg",
  "restaurant-extra12": "./audio/words/restaurant-extra12.wav",
  "restaurant-extra13": "./audio/words/restaurant-extra13.wav",
  "restaurant-extra14": "./audio/words/restaurant-extra14.wav"
};

export function applyAudioMetadata(entries, audioMap = AUDIO_BY_ENTRY_ID) {
  return entries.map(entry => {
    const audio = audioMap[entry.id];
    return audio ? { ...entry, audio } : { ...entry };
  });
}

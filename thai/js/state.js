const KEYS = {
  favorites: 'thai-life:favorites',
  showThai: 'thai-life:show-thai',
  speechRate: 'thai-life:speech-rate'
};

export function createState(storage) {
  function readFavorites() {
    try {
      const value = JSON.parse(storage.getItem(KEYS.favorites) || '[]');
      return Array.isArray(value) ? value.filter(x => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  return {
    getFavorites: readFavorites,
    isFavorite(id) { return readFavorites().includes(id); },
    toggleFavorite(id) {
      const current = new Set(readFavorites());
      const next = !current.has(id);
      if (next) current.add(id); else current.delete(id);
      storage.setItem(KEYS.favorites, JSON.stringify([...current]));
      return next;
    },
    getShowThai() {
      const raw = storage.getItem(KEYS.showThai);
      return raw === null ? true : raw === 'true' ? true : raw === 'false' ? false : true;
    },
    setShowThai(value) { storage.setItem(KEYS.showThai, String(Boolean(value))); },
    getSpeechRate() {
      const raw = storage.getItem(KEYS.speechRate);
      return raw === 'slow' ? 'slow' : 'normal';
    },
    setSpeechRate(value) { storage.setItem(KEYS.speechRate, value === 'slow' ? 'slow' : 'normal'); }
  };
}

export const learnerState = typeof window !== 'undefined'
  ? createState(window.localStorage)
  : null;

/** Lecture / écriture sécurisées dans le localStorage. */

export const STORAGE_KEYS = {
  conversations: 'mathis-ai:conversations:v1',
  activeId: 'mathis-ai:active-conversation:v1',
  settings: 'mathis-ai:settings:v1',
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Quota dépassé ou stockage désactivé (navigation privée…)
    console.warn('[Mathis AI] Sauvegarde locale impossible :', error);
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignoré */
  }
}

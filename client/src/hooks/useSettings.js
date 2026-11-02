import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage.js';

export const DEFAULT_SETTINGS = {
  responseStyle: 'balanced', // concise | balanced | detailed
  smoothTyping: true, // effet d'apparition progressive
  enterToSend: true, // Entrée envoie, Maj+Entrée = retour à la ligne
};

export function useSettings() {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...loadJSON(STORAGE_KEYS.settings, {}),
  }));

  useEffect(() => {
    saveJSON(STORAGE_KEYS.settings, settings);
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  return { settings, updateSetting, resetSettings };
}

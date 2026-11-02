import { useCallback, useEffect, useState } from 'react';
import { fetchHealth } from '../api/chatApi.js';

const REFRESH_MS = 60_000;

/**
 * Indicateur de disponibilité de l'IA.
 * status : checking | online | offline | not_configured | server_down
 */
export function useHealth() {
  const [health, setHealth] = useState({ status: 'checking', message: 'Vérification…', model: null });

  const refresh = useCallback(async () => {
    const data = await fetchHealth();
    setHealth({
      status: data.ai?.status ?? 'offline',
      message: data.ai?.message ?? '',
      model: data.model ?? null,
      effort: data.effort ?? null,
      webSearch: data.webSearch ?? null,
    });
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  return { health, refreshHealth: refresh };
}

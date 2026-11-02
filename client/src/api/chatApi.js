/**
 * Communication avec le backend Express.
 * Le frontend n'appelle JAMAIS l'API d'IA directement : tout passe par /api.
 */

export class ChatError extends Error {
  constructor(message, code = 'unknown_error') {
    super(message);
    this.name = 'ChatError';
    this.code = code;
  }
}

// En local, /api passe par le proxy Vite. Sur le site HubSpot, le backend est
// hébergé ailleurs : VITE_API_URL contient alors son adresse (voir .env.hubspot).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// En ligne, le serveur gratuit peut mettre une minute à se réveiller.
const SERVER_DOWN_MESSAGE = API_BASE
  ? 'Le serveur Mathis AI ne répond pas pour le moment. Il est peut-être en train de se réveiller : réessaie dans une minute.'
  : 'Impossible de joindre le serveur Mathis AI. Vérifie que le backend est lancé (npm run dev dans le dossier server).';

function messageForStatus(status) {
  if (status === 429) return 'Trop de requêtes. Patiente un peu avant de réessayer.';
  if (status >= 500) return SERVER_DOWN_MESSAGE;
  return `Le serveur a répondu avec une erreur (${status}).`;
}

async function readErrorBody(response) {
  try {
    const data = await response.json();
    return data?.error ?? null;
  } catch {
    return null;
  }
}

/**
 * Envoie la conversation au backend et lit la réponse en streaming (SSE).
 * @param {object} options
 * @param {Array<{role: string, content: string}>} options.messages
 * @param {string} options.responseStyle
 * @param {AbortSignal} options.signal  permet d'arrêter la génération
 * @param {(text: string) => void} options.onDelta  appelé à chaque morceau reçu
 * @param {(event: object) => void} [options.onMeta]  recherche web : { type: 'status' | 'sources' | 'search_unavailable', … }
 * @returns {Promise<{stopReason: string, model: string}>}
 */
export async function streamChat({ messages, responseStyle, signal, onDelta, onMeta = () => {} }) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, responseStyle }),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ChatError(SERVER_DOWN_MESSAGE, 'network_error');
  }

  if (!response.ok) {
    const apiError = await readErrorBody(response);
    throw new ChatError(
      apiError?.message || messageForStatus(response.status),
      apiError?.code || `http_${response.status}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const data = rawEvent
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');
      if (!data) continue;

      let event;
      try {
        event = JSON.parse(data);
      } catch {
        continue;
      }

      if (event.type === 'delta') onDelta(event.text);
      else if (event.type === 'done') result = event;
      else if (event.type === 'error') throw new ChatError(event.message, event.code);
      else if (['status', 'sources', 'search_unavailable'].includes(event.type)) onMeta(event);
    }
  }

  if (!result) {
    throw new ChatError(
      'La connexion avec le serveur a été coupée avant la fin de la réponse.',
      'stream_interrupted',
    );
  }
  return result;
}

/** Récupère l'état du serveur et de l'IA. */
export async function fetchHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
    if (!response.ok) throw new Error(String(response.status));
    return await response.json();
  } catch {
    return {
      server: 'down',
      ai: { status: 'server_down', message: SERVER_DOWN_MESSAGE },
    };
  }
}

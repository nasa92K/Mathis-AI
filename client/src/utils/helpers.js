export function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Titre automatique d'une conversation à partir du premier message. */
export function makeTitle(text) {
  const firstLine = text.replace(/\s+/g, ' ').trim();
  return firstLine.length > 42 ? `${firstLine.slice(0, 42).trimEnd()}…` : firstLine || 'Nouvelle conversation';
}

/** Copie du texte dans le presse-papiers (avec repli pour les vieux navigateurs). */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
}

/** Date relative courte pour la barre latérale. */
export function formatRelativeDate(timestamp) {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "À l'instant";
  if (diff < hour) return `Il y a ${Math.floor(diff / minute)} min`;
  if (diff < day) return `Il y a ${Math.floor(diff / hour)} h`;
  if (diff < 2 * day) return 'Hier';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(timestamp);
}

// Limites alignées sur la validation du backend.
const HISTORY_MAX_MESSAGES = 60;
const HISTORY_MAX_CHARS = 350_000;

/**
 * Transforme les messages affichés en historique envoyé à l'IA :
 * - ignore les réponses en erreur ou vides (elles ne viennent pas de l'IA),
 * - garde les messages les plus récents dans la limite autorisée,
 * - commence toujours par un message utilisateur.
 */
export function toApiHistory(messages) {
  const usable = messages
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.status !== 'error' && m.content.trim()))
    .map((m) => ({ role: m.role, content: m.content }));

  const kept = [];
  let total = 0;
  for (let i = usable.length - 1; i >= 0; i--) {
    total += usable[i].content.length;
    if (kept.length >= HISTORY_MAX_MESSAGES || (total > HISTORY_MAX_CHARS && kept.length > 0)) break;
    kept.unshift(usable[i]);
  }
  while (kept.length && kept[0].role !== 'user') kept.shift();
  return kept;
}

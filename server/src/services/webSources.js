/**
 * Outils pour la recherche web (browser_search de Groq) :
 * - extraction des sources réellement consultées,
 * - nettoyage des marqueurs de citation internes du modèle (ex. 【2†L6-L10】).
 */

const MAX_SOURCES = 8;

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function cleanTitle(title, url) {
  const text = String(title ?? '').replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 160);
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Récupère les pages renvoyées par un outil exécuté (résultats de recherche + pages ouvertes). */
export function extractSources(executedTool) {
  const candidates = [
    ...(executedTool?.search_results?.results ?? []),
    ...(executedTool?.browser_results ?? []),
  ];
  return candidates
    .filter((item) => item && isHttpUrl(item.url))
    .map((item) => ({ title: cleanTitle(item.title, item.url), url: item.url }));
}

/** Requête de recherche lisible à partir des arguments JSON de l'outil. */
export function extractQuery(executedTool) {
  try {
    const args = JSON.parse(executedTool?.arguments ?? '{}');
    const query = args.query ?? args.q ?? args.search ?? Object.values(args).find((v) => typeof v === 'string');
    return typeof query === 'string' ? query.slice(0, 140) : null;
  } catch {
    return null;
  }
}

/** Accumule les sources sans doublon (même URL) et dans la limite de MAX_SOURCES. */
export function createSourceCollector() {
  const byUrl = new Map();
  return {
    /** Ajoute des sources et renvoie seulement les nouvelles. */
    add(sources) {
      const added = [];
      for (const source of sources) {
        if (byUrl.size >= MAX_SOURCES) break;
        const key = source.url.replace(/[#?].*$/, '').replace(/\/+$/, '');
        if (byUrl.has(key)) continue;
        byUrl.set(key, source);
        added.push(source);
      }
      return added;
    },
    get count() {
      return byUrl.size;
    },
  };
}

/**
 * Retire les marqueurs 【…】 du texte reçu en streaming, même s'ils arrivent
 * coupés entre deux morceaux. Un « 【 » jamais refermé est relâché tel quel.
 */
export function createCitationCleaner() {
  const OPEN = '【';
  const CLOSE = '】';
  const MAX_MARKER = 60;
  let pending = '';

  // Retire le marqueur sans abîmer la ponctuation française (« vrai ! » garde son espace) :
  // on garde une espace seulement s'il y en avait des deux côtés du marqueur.
  const strip = (text) =>
    text.replace(/( ?)【[^【】]{0,60}】( ?)/g, (_match, before, after) => (before && after ? ' ' : after));

  return {
    push(chunk) {
      pending += chunk;
      const open = pending.lastIndexOf(OPEN);
      // Marqueur peut-être incomplet à la fin : on le garde (avec l'espace qui le précède)
      // pour le prochain morceau.
      if (open !== -1 && pending.indexOf(CLOSE, open) === -1 && pending.length - open <= MAX_MARKER) {
        const start = open > 0 && pending[open - 1] === ' ' ? open - 1 : open;
        const ready = pending.slice(0, start);
        pending = pending.slice(start);
        return strip(ready);
      }
      // Les espaces de fin attendent le morceau suivant : un marqueur peut les suivre.
      let end = pending.length;
      while (end > 0 && pending[end - 1] === ' ') end -= 1;
      const ready = pending.slice(0, end);
      pending = pending.slice(end);
      return strip(ready);
    },
    flush() {
      const rest = pending;
      pending = '';
      return strip(rest);
    },
  };
}

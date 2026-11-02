import Groq from 'groq-sdk';
import { config, isApiKeyConfigured, isWebSearchEnabled } from '../config.js';
import { MATHIS_PERSONALITY, buildContextPrompt } from '../prompts/mathisPersonality.js';
import { createCitationCleaner, createSourceCollector, extractQuery, extractSources } from './webSources.js';

let client = null;

function getClient() {
  if (!client) {
    client = new Groq({
      apiKey: config.apiKey,
      maxRetries: 2, // relance automatique sur 429 / 5xx / erreurs réseau
    });
  }
  return client;
}

/**
 * Garde les messages les plus récents dans la limite de caractères,
 * en commençant toujours par un message utilisateur.
 */
function trimHistory(messages) {
  const kept = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    total += messages[i].content.length;
    if (total > config.maxHistoryChars && kept.length > 0) break;
    kept.unshift(messages[i]);
  }
  while (kept.length > 1 && kept[0].role !== 'user') kept.shift();
  return kept;
}

function buildParams({ messages, responseStyle, webSearch }) {
  const params = {
    model: config.model,
    max_completion_tokens: config.maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: `${MATHIS_PERSONALITY}\n\n${buildContextPrompt({ responseStyle, webSearch })}` },
      ...trimHistory(messages),
    ],
  };

  // Les modèles gpt-oss réfléchissent avant de répondre : on règle l'effort
  // et on ne renvoie que la réponse finale.
  if (config.model.startsWith('openai/gpt-oss')) {
    params.reasoning_effort = config.effort;
    params.include_reasoning = false;
  }

  // Recherche web exécutée chez Groq. "auto" : le modèle ne cherche que quand c'est utile
  // (vérifier un fait, une info récente…), ce qui économise le quota gratuit.
  if (webSearch) {
    params.tools = [{ type: 'browser_search' }];
    params.tool_choice = 'auto';
  }

  return params;
}

/** Erreurs pour lesquelles on retente sans recherche web (outil refusé, requête trop grosse). */
function shouldRetryWithoutSearch(error) {
  return error instanceof Groq.APIError && [400, 413, 422].includes(error.status);
}

/**
 * Génère la réponse de Mathis AI en streaming. Événements produits :
 *   { type: 'delta', text }                 morceau de réponse
 *   { type: 'status', status: 'searching', query }   Mathis cherche sur le web
 *   { type: 'sources', sources: [{ title, url }] }  pages consultées (nouvelles seulement)
 *   { type: 'search_unavailable' }          réponse produite sans recherche web
 *   { type: 'done', stopReason, model }     fin normale
 *   { type: 'error', code, message }        réponse vide
 * @param {{ messages: Array<{role: 'user'|'assistant', content: string}>, responseStyle?: string, signal?: AbortSignal }} options
 */
export async function* streamMathisReply({ messages, responseStyle, signal }) {
  let webSearch = isWebSearchEnabled();
  let stream;

  try {
    stream = await getClient().chat.completions.create(buildParams({ messages, responseStyle, webSearch }), { signal });
  } catch (error) {
    if (!webSearch || !shouldRetryWithoutSearch(error)) throw error;
    console.warn('[recherche web] indisponible, nouvelle tentative sans recherche :', error.message);
    webSearch = false;
    yield { type: 'search_unavailable' };
    stream = await getClient().chat.completions.create(buildParams({ messages, responseStyle, webSearch }), { signal });
  }

  const sources = createSourceCollector();
  const cleaner = createCitationCleaner();
  let stopReason = null;
  let model = config.model;
  let emitted = 0;

  for await (const chunk of stream) {
    if (chunk.model) model = chunk.model;
    const choice = chunk.choices?.[0];
    const delta = choice?.delta;

    for (const tool of delta?.executed_tools ?? []) {
      const found = extractSources(tool);
      if (found.length === 0) {
        // Outil lancé, résultats pas encore là : on prévient l'interface.
        yield { type: 'status', status: 'searching', query: extractQuery(tool) };
      } else {
        const added = sources.add(found);
        if (added.length) yield { type: 'sources', sources: added };
      }
    }

    if (delta?.content) {
      const text = cleaner.push(delta.content);
      if (text) {
        emitted += text.length;
        yield { type: 'delta', text };
      }
    }
    if (choice?.finish_reason) stopReason = choice.finish_reason;
  }

  const rest = cleaner.flush();
  if (rest) {
    emitted += rest.length;
    yield { type: 'delta', text: rest };
  }

  // Avec la recherche web, le modèle peut épuiser son budget de tokens avant d'écrire.
  if (emitted === 0 && stopReason !== 'content_filter') {
    yield {
      type: 'error',
      code: 'empty_response',
      message:
        stopReason === 'length'
          ? "Mathis a passé trop de temps à chercher et n'a pas eu le temps de répondre. Reformule ta question plus précisément ou réessaie."
          : "Mathis n'a rien répondu cette fois. Réessaie.",
    };
    return;
  }

  yield { type: 'done', stopReason, model };
}

/**
 * Vérifie que la clé API et le modèle sont utilisables.
 * Résultat mis en cache 60 s pour ne pas interroger l'API à chaque rafraîchissement.
 */
let healthCache = { at: 0, value: null };

export async function checkAiAvailability() {
  if (!isApiKeyConfigured()) {
    return {
      status: 'not_configured',
      message: "Aucune clé API n'est configurée côté serveur (voir server/.env).",
    };
  }

  const now = Date.now();
  if (healthCache.value && now - healthCache.at < 60_000) return healthCache.value;

  let value;
  try {
    // La liste plutôt que models.retrieve : le "/" des noms comme
    // "openai/gpt-oss-120b" casse l'URL de récupération d'un seul modèle.
    const { data } = await getClient().models.list();
    value = data.some((model) => model.id === config.model)
      ? { status: 'online', message: 'Mathis AI est en ligne.' }
      : {
          status: 'offline',
          code: 'model_not_found',
          message: `Le modèle "${config.model}" est introuvable. Vérifie GROQ_MODEL dans server/.env.`,
        };
  } catch (error) {
    const mapped = mapAiError(error);
    value = { status: 'offline', message: mapped.message, code: mapped.code };
  }

  healthCache = { at: now, value };
  return value;
}

/**
 * Traduit une erreur du SDK en message clair pour l'utilisateur.
 * Les classes sont testées de la plus spécifique à la plus générale.
 */
export function mapAiError(error) {
  if (error instanceof Groq.AuthenticationError) {
    return {
      status: 401,
      code: 'auth_error',
      message: 'La clé API configurée sur le serveur est invalide ou a expiré.',
    };
  }
  if (error instanceof Groq.PermissionDeniedError) {
    return {
      status: 403,
      code: 'permission_denied',
      message: "Cette clé API n'a pas accès au modèle demandé.",
    };
  }
  if (error instanceof Groq.NotFoundError) {
    return {
      status: 404,
      code: 'model_not_found',
      message: `Le modèle "${config.model}" est introuvable. Vérifie GROQ_MODEL dans server/.env.`,
    };
  }
  if (error instanceof Groq.RateLimitError) {
    return {
      status: 429,
      code: 'rate_limited',
      message: "Mathis a atteint la limite gratuite de l'IA. Réessaie dans une minute (ou demain si le quota du jour est épuisé).",
    };
  }
  if (error instanceof Groq.APIError && error.status === 413) {
    return {
      status: 413,
      code: 'too_large',
      message: 'Ce message est trop long pour la version gratuite. Raccourcis-le ou démarre une nouvelle conversation.',
    };
  }
  if (error instanceof Groq.BadRequestError) {
    return {
      status: 400,
      code: 'bad_request',
      message: "La requête envoyée à l'IA a été refusée (conversation trop longue ou paramètre invalide).",
      detail: error.message,
    };
  }
  if (error instanceof Groq.APIConnectionTimeoutError) {
    return {
      status: 504,
      code: 'timeout',
      message: "L'IA met trop de temps à répondre. Réessaie dans un instant.",
    };
  }
  if (error instanceof Groq.APIConnectionError) {
    return {
      status: 503,
      code: 'connection_error',
      message: "Impossible de joindre le service d'IA. Vérifie la connexion Internet du serveur.",
    };
  }
  if (error instanceof Groq.APIError && error.status >= 500) {
    return {
      status: 503,
      code: 'ai_unavailable',
      message: "Le service d'IA est momentanément surchargé ou indisponible. Réessaie dans un instant.",
    };
  }
  if (error instanceof Groq.APIError) {
    return {
      status: error.status || 500,
      code: 'api_error',
      message: "Le service d'IA a renvoyé une erreur inattendue.",
      detail: error.message,
    };
  }
  return {
    status: 500,
    code: 'internal_error',
    message: 'Une erreur interne est survenue sur le serveur.',
  };
}

export { Groq };

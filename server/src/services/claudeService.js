import Anthropic from '@anthropic-ai/sdk';
import { config, isApiKeyConfigured } from '../config.js';
import { MATHIS_PERSONALITY, buildContextPrompt } from '../prompts/mathisPersonality.js';

// Modèles qui acceptent le repli automatique "fallbacks: default" côté serveur.
const FALLBACK_CAPABLE_MODELS = new Set([
  'claude-fable-5-1',
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-sonnet-5-5',
]);

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: 2, // relance automatique sur 429 / 5xx / erreurs réseau
    });
  }
  return client;
}

/**
 * Ouvre un flux de réponse de Mathis AI.
 * @param {{ messages: Array<{role: 'user'|'assistant', content: string}>, responseStyle?: string }} options
 * @returns Un MessageStream du SDK (itérable, avec .abort() et .finalMessage()).
 */
export function streamMathisReply({ messages, responseStyle }) {
  const params = {
    model: config.model,
    max_tokens: config.maxTokens,
    output_config: { effort: config.effort },
    // Met en cache automatiquement l'historique de la conversation.
    cache_control: { type: 'ephemeral' },
    system: [
      // Bloc stable : la personnalité (mise en cache).
      { type: 'text', text: MATHIS_PERSONALITY, cache_control: { type: 'ephemeral' } },
      // Bloc variable : date + style de réponse.
      { type: 'text', text: buildContextPrompt({ responseStyle }) },
    ],
    messages,
  };

  const anthropic = getClient();

  if (config.enableFallbacks && FALLBACK_CAPABLE_MODELS.has(config.model)) {
    return anthropic.beta.messages.stream({
      ...params,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
  }

  return anthropic.messages.stream(params);
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
    await getClient().models.retrieve(config.model);
    value = { status: 'online', message: 'Mathis AI est en ligne.' };
  } catch (error) {
    const mapped = mapAnthropicError(error);
    value = { status: 'offline', message: mapped.message, code: mapped.code };
  }

  healthCache = { at: now, value };
  return value;
}

/**
 * Traduit une erreur du SDK en message clair pour l'utilisateur.
 * Les classes sont testées de la plus spécifique à la plus générale.
 */
export function mapAnthropicError(error) {
  if (error instanceof Anthropic.AuthenticationError) {
    return {
      status: 401,
      code: 'auth_error',
      message: 'La clé API configurée sur le serveur est invalide ou a expiré.',
    };
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return {
      status: 403,
      code: 'permission_denied',
      message: "Cette clé API n'a pas accès au modèle demandé.",
    };
  }
  if (error instanceof Anthropic.NotFoundError) {
    return {
      status: 404,
      code: 'model_not_found',
      message: `Le modèle "${config.model}" est introuvable. Vérifie ANTHROPIC_MODEL dans server/.env.`,
    };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return {
      status: 429,
      code: 'rate_limited',
      message: "Trop de requêtes vers l'IA en ce moment. Patiente quelques secondes puis réessaie.",
    };
  }
  if (error instanceof Anthropic.BadRequestError) {
    return {
      status: 400,
      code: 'bad_request',
      message: "La requête envoyée à l'IA a été refusée (conversation trop longue ou paramètre invalide).",
      detail: error.message,
    };
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return {
      status: 504,
      code: 'timeout',
      message: "L'IA met trop de temps à répondre. Réessaie dans un instant.",
    };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return {
      status: 503,
      code: 'connection_error',
      message: "Impossible de joindre le service d'IA. Vérifie la connexion Internet du serveur.",
    };
  }
  if (error instanceof Anthropic.APIError && error.status >= 500) {
    return {
      status: 503,
      code: 'ai_unavailable',
      message: "Le service d'IA est momentanément surchargé ou indisponible. Réessaie dans un instant.",
    };
  }
  if (error instanceof Anthropic.APIError) {
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

export { Anthropic };

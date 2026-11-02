import 'dotenv/config';

// Niveaux de réflexion acceptés par les modèles gpt-oss de Groq
const EFFORT_LEVELS = ['low', 'medium', 'high'];

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const effort = (process.env.MATHIS_EFFORT || 'medium').toLowerCase();

export const config = {
  port: toInt(process.env.PORT, 3001),
  // Une ou plusieurs origines séparées par des virgules (Vite en local, site HubSpot en ligne)
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  // Nombre de proxys devant le serveur (1 sur Render) : nécessaire pour que la
  // limite de requêtes voie la vraie IP du visiteur.
  trustProxy: toInt(process.env.TRUST_PROXY, 0),
  apiKey: process.env.GROQ_API_KEY?.trim() || '',
  model: process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b',
  effort: EFFORT_LEVELS.includes(effort) ? effort : 'medium',
  // L'offre gratuite de Groq limite chaque requête (~8 000 tokens/min, réponse comprise) :
  // réponse plafonnée et historique raccourci pour rester en dessous.
  maxTokens: toInt(process.env.MAX_TOKENS, 2048),
  maxHistoryChars: toInt(process.env.MAX_HISTORY_CHARS, 8000),
  rateLimitPerMinute: toInt(process.env.RATE_LIMIT_PER_MINUTE, 20),
  // Recherche web (outil browser_search de Groq) pour vérifier les faits et citer des sources.
  // Disponible seulement avec les modèles gpt-oss. Mettre "false" pour la couper.
  webSearch: (process.env.MATHIS_WEB_SEARCH ?? 'true').toLowerCase() !== 'false',

  // Limites de validation des messages entrants
  limits: {
    maxMessages: 60,
    maxUserMessageChars: 12000, // ce que l'utilisateur peut taper
    maxAssistantMessageChars: 100000, // réponses précédentes de l'IA renvoyées en contexte
    maxTotalChars: 400000,
  },
};

/** La recherche web est-elle utilisable avec le modèle configuré ? */
export function isWebSearchEnabled() {
  return config.webSearch && config.model.startsWith('openai/gpt-oss');
}

export function isApiKeyConfigured() {
  return Boolean(config.apiKey) && !config.apiKey.includes('xxxx');
}

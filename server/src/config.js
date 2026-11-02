import 'dotenv/config';

const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

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
  apiKey: process.env.ANTHROPIC_API_KEY?.trim() || '',
  model: process.env.ANTHROPIC_MODEL?.trim() || 'claude-opus-5-5',
  effort: EFFORT_LEVELS.includes(effort) ? effort : 'medium',
  maxTokens: toInt(process.env.MAX_TOKENS, 64000),
  enableFallbacks: (process.env.MATHIS_ENABLE_FALLBACKS ?? 'true').toLowerCase() !== 'false',
  rateLimitPerMinute: toInt(process.env.RATE_LIMIT_PER_MINUTE, 20),

  // Limites de validation des messages entrants
  limits: {
    maxMessages: 60,
    maxUserMessageChars: 12000, // ce que l'utilisateur peut taper
    maxAssistantMessageChars: 100000, // réponses précédentes de l'IA renvoyées en contexte
    maxTotalChars: 400000,
  },
};

export function isApiKeyConfigured() {
  return Boolean(config.apiKey) && !config.apiKey.includes('xxxx');
}

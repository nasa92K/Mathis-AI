import { config } from '../config.js';
import { RESPONSE_STYLE_KEYS } from '../prompts/mathisPersonality.js';

function fail(res, message) {
  return res.status(400).json({ error: { code: 'invalid_request', message } });
}

/**
 * Valide et nettoie le corps de POST /api/chat :
 * { messages: [{ role: 'user'|'assistant', content: string }], responseStyle?: string }
 */
export function validateChat(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return fail(res, 'Corps de requête manquant ou invalide (JSON attendu).');
  }

  const { messages, responseStyle } = body;
  const { maxMessages, maxUserMessageChars, maxAssistantMessageChars, maxTotalChars } = config.limits;

  if (!Array.isArray(messages) || messages.length === 0) {
    return fail(res, 'Le champ "messages" doit être une liste non vide.');
  }
  if (messages.length > maxMessages) {
    return fail(res, `La conversation contient trop de messages (maximum ${maxMessages}).`);
  }

  const cleaned = [];
  let totalChars = 0;

  for (const [index, message] of messages.entries()) {
    if (!message || typeof message !== 'object') {
      return fail(res, `Message n°${index + 1} invalide.`);
    }
    const { role, content } = message;
    if (role !== 'user' && role !== 'assistant') {
      return fail(res, `Message n°${index + 1} : rôle "${role}" non autorisé.`);
    }
    if (typeof content !== 'string') {
      return fail(res, `Message n°${index + 1} : le contenu doit être du texte.`);
    }
    const text = content.trim();
    if (!text) {
      return fail(res, `Message n°${index + 1} : le contenu est vide.`);
    }
    const maxChars = role === 'user' ? maxUserMessageChars : maxAssistantMessageChars;
    if (text.length > maxChars) {
      return fail(res, `Un message dépasse la limite de ${maxChars} caractères.`);
    }
    totalChars += text.length;
    cleaned.push({ role, content: text });
  }

  if (totalChars > maxTotalChars) {
    return fail(res, 'La conversation est trop longue. Démarre une nouvelle conversation.');
  }
  if (cleaned[0].role !== 'user') {
    return fail(res, 'La conversation doit commencer par un message utilisateur.');
  }
  if (cleaned.at(-1).role !== 'user') {
    return fail(res, 'Le dernier message doit venir de l’utilisateur.');
  }
  if (responseStyle !== undefined && !RESPONSE_STYLE_KEYS.includes(responseStyle)) {
    return fail(res, 'Style de réponse inconnu.');
  }

  req.chat = { messages: cleaned, responseStyle: responseStyle ?? 'balanced' };
  next();
}

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config, isApiKeyConfigured } from '../config.js';
import { validateChat } from '../middleware/validateChat.js';
import { Anthropic, mapAnthropicError, streamMathisReply } from '../services/claudeService.js';

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: config.rateLimitPerMinute,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'too_many_requests',
      message: 'Doucement frérot 😅 Trop de messages en peu de temps. Attends une minute avant de réessayer.',
    },
  },
});

/**
 * POST /api/chat
 * Répond en Server-Sent Events (text/event-stream). Chaque événement est un JSON :
 *   { type: 'delta', text }                      → morceau de réponse
 *   { type: 'done', stopReason, model }          → fin normale
 *   { type: 'error', code, message }             → erreur pendant la génération
 */
router.post('/chat', chatLimiter, validateChat, async (req, res) => {
  if (!isApiKeyConfigured()) {
    return res.status(503).json({
      error: {
        code: 'not_configured',
        message: "Mathis AI n'est pas encore branché à l'IA : ajoute ANTHROPIC_API_KEY dans server/.env puis redémarre le serveur.",
      },
    });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (payload) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const stream = streamMathisReply(req.chat);

  // Si le client ferme la connexion (bouton "Arrêter"), on coupe la génération.
  let clientGone = false;
  res.on('close', () => {
    if (!res.writableFinished) {
      clientGone = true;
      stream.abort();
    }
  });

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ type: 'delta', text: event.delta.text });
      }
    }

    const finalMessage = await stream.finalMessage();

    if (finalMessage.stop_reason === 'refusal') {
      send({
        type: 'error',
        code: 'refusal',
        message: "Mathis AI ne peut pas répondre à cette demande. Essaie de la reformuler autrement.",
      });
    } else {
      send({
        type: 'done',
        stopReason: finalMessage.stop_reason,
        model: finalMessage.model,
      });
    }
  } catch (error) {
    if (clientGone || error instanceof Anthropic.APIUserAbortError) return;
    const mapped = mapAnthropicError(error);
    console.error(`[chat] ${mapped.code}:`, error?.message ?? error);
    send({ type: 'error', code: mapped.code, message: mapped.message });
  } finally {
    if (!res.writableEnded) res.end();
  }
});

export default router;

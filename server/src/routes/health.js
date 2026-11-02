import { Router } from 'express';
import { config } from '../config.js';
import { checkAiAvailability } from '../services/aiService.js';

const router = Router();

/**
 * GET /api/health
 * Indique si le serveur tourne et si l'IA est joignable.
 * Ne renvoie jamais la clé API.
 */
router.get('/health', async (_req, res) => {
  const ai = await checkAiAvailability();
  res.json({
    server: 'ok',
    ai,
    model: config.model,
    effort: config.effort,
  });
});

export default router;

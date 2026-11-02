import express from 'express';
import cors from 'cors';
import { config, isApiKeyConfigured } from './config.js';
import chatRouter from './routes/chat.js';
import healthRouter from './routes/health.js';

const app = express();

app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', config.trustProxy);
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', healthRouter);
app.use('/api', chatRouter);

// Route inconnue
app.use('/api', (_req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Route API introuvable.' } });
});

// Gestion centralisée des erreurs (JSON mal formé, etc.)
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'invalid_json', message: 'JSON invalide.' } });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'too_large', message: 'Requête trop volumineuse.' } });
  }
  console.error('[server]', err);
  res.status(500).json({ error: { code: 'internal_error', message: 'Erreur interne du serveur.' } });
});

app.listen(config.port, () => {
  console.log(`\n  🚀 MATHIS AI — backend prêt sur http://localhost:${config.port}`);
  console.log(`     Modèle : ${config.model} (effort : ${config.effort})`);
  if (!isApiKeyConfigured()) {
    console.warn('  ⚠️  ANTHROPIC_API_KEY manquante : copie server/.env.example en server/.env et ajoute ta clé.\n');
  }
});

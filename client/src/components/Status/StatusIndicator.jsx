import './StatusIndicator.css';

const LABELS = {
  checking: 'Vérification…',
  online: 'En ligne',
  offline: 'IA indisponible',
  not_configured: 'Clé API manquante',
  server_down: 'Serveur hors ligne',
};

/** Pastille indiquant si Mathis AI est joignable. Cliquer relance la vérification. */
export default function StatusIndicator({ health, onRefresh, compact = false }) {
  const label = LABELS[health.status] ?? 'Inconnu';
  return (
    <button
      type="button"
      className={`status status--${health.status} ${compact ? 'status--compact' : ''}`}
      onClick={onRefresh}
      title={`${health.message || label} — cliquer pour revérifier`}
      aria-label={`État de l'IA : ${label}. ${health.message ?? ''} Cliquer pour revérifier.`}
    >
      <span className="status__dot" aria-hidden="true" />
      <span className="status__label">{label}</span>
    </button>
  );
}

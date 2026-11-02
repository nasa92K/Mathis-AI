import { useState } from 'react';
import { ArrowLeft, Cpu, Database, Keyboard, MessageCircle, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog.jsx';
import StatusIndicator from '../Status/StatusIndicator.jsx';
import './SettingsPage.css';

const RESPONSE_STYLES = [
  { value: 'concise', label: 'Concis', description: 'Réponses courtes, droit au but.' },
  { value: 'balanced', label: 'Équilibré', description: "S'adapte à chaque question." },
  { value: 'detailed', label: 'Détaillé', description: 'Explications approfondies et exemples.' },
];

function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className="setting-row">
      <div className="setting-row__text">
        <label htmlFor={id} className="setting-row__label">
          {label}
        </label>
        <p className="setting-row__description">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section__title">
        <Icon size={17} aria-hidden="true" />
        {title}
      </h2>
      <div className="settings-section__card">{children}</div>
    </section>
  );
}

export default function SettingsPage({
  settings,
  onUpdateSetting,
  onResetSettings,
  health,
  onRefreshHealth,
  conversationCount,
  onClearHistory,
  onBack,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="settings">
      <div className="settings__inner">
        <header className="settings__header">
          <button type="button" className="icon-btn" onClick={onBack} aria-label="Retour à la discussion">
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="settings__title">Paramètres</h1>
            <p className="settings__subtitle">Personnalise ton expérience avec Mathis AI.</p>
          </div>
        </header>

        <Section icon={MessageCircle} title="Réponses de Mathis">
          <fieldset className="style-picker">
            <legend className="setting-row__label">Longueur des réponses</legend>
            <div className="style-picker__options">
              {RESPONSE_STYLES.map((style) => (
                <label
                  key={style.value}
                  className={`style-option ${settings.responseStyle === style.value ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="responseStyle"
                    value={style.value}
                    checked={settings.responseStyle === style.value}
                    onChange={() => onUpdateSetting('responseStyle', style.value)}
                  />
                  <span className="style-option__label">{style.label}</span>
                  <span className="style-option__description">{style.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section icon={Sparkles} title="Interface">
          <Toggle
            id="toggle-smooth"
            checked={settings.smoothTyping}
            onChange={(value) => onUpdateSetting('smoothTyping', value)}
            label="Apparition progressive des réponses"
            description="Le texte s'affiche de façon fluide pendant que Mathis écrit."
          />
          <Toggle
            id="toggle-enter"
            checked={settings.enterToSend}
            onChange={(value) => onUpdateSetting('enterToSend', value)}
            label="Envoyer avec Entrée"
            description="Désactivé : Entrée crée une nouvelle ligne et Ctrl+Entrée envoie."
          />
        </Section>

        <Section icon={Cpu} title="Connexion à l'IA">
          <div className="setting-row">
            <div className="setting-row__text">
              <span className="setting-row__label">État du service</span>
              <p className="setting-row__description">{health.message || 'Vérification en cours…'}</p>
            </div>
            <StatusIndicator health={health} onRefresh={onRefreshHealth} />
          </div>
          {health.model && (
            <div className="setting-row">
              <div className="setting-row__text">
                <span className="setting-row__label">Modèle utilisé</span>
                <p className="setting-row__description">
                  Défini côté serveur dans <code>server/.env</code>
                  {health.effort ? ` · effort : ${health.effort}` : ''}
                </p>
              </div>
              <code className="settings__model">{health.model}</code>
            </div>
          )}
        </Section>

        <Section icon={Database} title="Données">
          <div className="setting-row">
            <div className="setting-row__text">
              <span className="setting-row__label">Historique des conversations</span>
              <p className="setting-row__description">
                {conversationCount} conversation{conversationCount > 1 ? 's' : ''} enregistrée
                {conversationCount > 1 ? 's' : ''} uniquement dans ce navigateur.
              </p>
            </div>
            <button
              type="button"
              className="settings__btn settings__btn--danger"
              disabled={conversationCount === 0}
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 size={15} /> Tout supprimer
            </button>
          </div>
          <div className="setting-row">
            <div className="setting-row__text">
              <span className="setting-row__label">Préférences</span>
              <p className="setting-row__description">Remet tous les réglages par défaut.</p>
            </div>
            <button type="button" className="settings__btn" onClick={onResetSettings}>
              <RotateCcw size={15} /> Réinitialiser
            </button>
          </div>
        </Section>

        <Section icon={Keyboard} title="Raccourcis clavier">
          <ul className="shortcuts">
            <li>
              <span>Envoyer le message</span>
              <span>{settings.enterToSend ? <kbd>Entrée</kbd> : <><kbd>Ctrl</kbd> + <kbd>Entrée</kbd></>}</span>
            </li>
            <li>
              <span>Nouvelle ligne</span>
              <span>{settings.enterToSend ? <><kbd>Maj</kbd> + <kbd>Entrée</kbd></> : <kbd>Entrée</kbd>}</span>
            </li>
            <li>
              <span>Arrêter la génération</span>
              <kbd>Échap</kbd>
            </li>
            <li>
              <span>Nouvelle conversation</span>
              <span>
                <kbd>Ctrl</kbd> + <kbd>Maj</kbd> + <kbd>O</kbd>
              </span>
            </li>
            <li>
              <span>Écrire un message</span>
              <kbd>/</kbd>
            </li>
          </ul>
        </Section>

        <p className="settings__about">
          <strong>MATHIS AI</strong> · Built different. Powered by AI.
          <br />
          Mathis AI est un personnage d'assistant virtuel propulsé par un modèle de langage. Ses réponses peuvent
          contenir des erreurs.
        </p>
      </div>

      <ConfirmDialog
        open={confirmClear}
        danger
        title="Supprimer tout l'historique ?"
        description="Toutes tes conversations seront définitivement effacées de ce navigateur. Cette action est irréversible."
        confirmLabel="Tout supprimer"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          onClearHistory();
          setConfirmClear(false);
        }}
      />
    </div>
  );
}

import { memo, useState } from 'react';
import { AlertCircle, Check, Copy, RefreshCw, RotateCcw, Square } from 'lucide-react';
import MathisAvatar from '../Brand/MathisAvatar.jsx';
import MarkdownContent from './MarkdownContent.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import { useSmoothText } from '../../hooks/useSmoothText.js';
import { copyToClipboard } from '../../utils/helpers.js';

function CopyButton({ text, label = 'Copier la réponse' }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="msg-action"
      aria-label={copied ? 'Copié' : label}
      title={copied ? 'Copié !' : label}
      onClick={async () => {
        if (await copyToClipboard(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );
}

function UserMessage({ message }) {
  return (
    <article className="message message--user" aria-label="Ton message">
      <div className="message__user-wrap">
        <div className="message__bubble">{message.content}</div>
        <div className="message__actions message__actions--user">
          <CopyButton text={message.content} label="Copier le message" />
        </div>
      </div>
    </article>
  );
}

function AssistantMessage({ message, isLast, canRegenerate, onRegenerate, smoothTyping }) {
  const streaming = message.status === 'streaming';
  const shownText = useSmoothText(message.content, streaming, smoothTyping);
  const stillTyping = streaming || shownText.length < message.content.length;

  return (
    <article className="message message--assistant" aria-label="Réponse de Mathis AI" aria-busy={streaming}>
      <MathisAvatar size={38} thinking={streaming && !message.content} />
      <div className="message__body">
        <div className="message__name">
          <span className="slashes">//</span>Mathis AI
        </div>

        {streaming && !shownText ? (
          <TypingIndicator />
        ) : (
          shownText && (
            <div className={stillTyping ? 'is-typing' : undefined}>
              <MarkdownContent content={shownText} />
            </div>
          )
        )}

        {message.status === 'stopped' && (
          <p className="message__note">
            <Square size={12} aria-hidden="true" /> Génération arrêtée
          </p>
        )}

        {message.status === 'error' && (
          <div className="error-card" role="alert">
            <AlertCircle size={18} className="error-card__icon" aria-hidden="true" />
            <div className="error-card__body">
              <p className="error-card__title">Mathis AI n'a pas pu répondre</p>
              <p className="error-card__message">{message.error?.message ?? 'Une erreur inconnue est survenue.'}</p>
              {isLast && canRegenerate && (
                <button type="button" className="pill pill--sm error-card__retry" onClick={onRegenerate}>
                  <RotateCcw size={14} /> Réessayer
                </button>
              )}
            </div>
          </div>
        )}

        {!streaming && message.status !== 'error' && message.content && (
          <div className="message__actions">
            <CopyButton text={message.content} />
            {isLast && canRegenerate && (
              <button
                type="button"
                className="msg-action"
                onClick={onRegenerate}
                aria-label="Régénérer la réponse"
                title="Régénérer la réponse"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function MessageBubble(props) {
  return props.message.role === 'user' ? <UserMessage {...props} /> : <AssistantMessage {...props} />;
}

export default memo(MessageBubble);

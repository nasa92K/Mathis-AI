import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import './Composer.css';

const MAX_CHARS = 12000;

/** Zone de saisie : Entrée pour envoyer, Maj+Entrée pour aller à la ligne. */
const Composer = forwardRef(function Composer({ onSend, onStop, isGenerating, enterToSend, disabled }, ref) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));

  // Hauteur automatique
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !isGenerating && !disabled;

  const submit = () => {
    if (!canSend) return;
    if (onSend(value)) setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    const wantsSend = enterToSend ? !event.shiftKey : event.ctrlKey || event.metaKey;
    if (wantsSend) {
      event.preventDefault();
      submit();
    }
  };

  const remaining = MAX_CHARS - value.length;

  return (
    <div className="composer">
      <form
        className="composer__box"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label htmlFor="composer-input" className="sr-only">
          Écris ton message à Mathis AI
        </label>
        <textarea
          id="composer-input"
          ref={textareaRef}
          className="composer__input"
          rows={1}
          value={value}
          maxLength={MAX_CHARS}
          placeholder="Écris ton message à Mathis AI…"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby="composer-hint"
          autoFocus
        />

        {isGenerating ? (
          <button
            type="button"
            className="composer__btn composer__btn--stop"
            onClick={onStop}
            aria-label="Arrêter la génération (Échap)"
            title="Arrêter la génération (Échap)"
          >
            <Square size={15} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            className="composer__btn"
            disabled={!canSend}
            aria-label="Envoyer le message"
            title="Envoyer"
          >
            <ArrowUp size={19} strokeWidth={2.5} />
          </button>
        )}
      </form>

      <p id="composer-hint" className="composer__hint">
        {remaining < 1000 ? (
          <span className={remaining < 200 ? 'is-warning' : ''}>{remaining} caractères restants · </span>
        ) : null}
        {enterToSend ? (
          <>
            <kbd>Entrée</kbd> pour envoyer · <kbd>Maj</kbd>+<kbd>Entrée</kbd> pour un retour à la ligne
          </>
        ) : (
          <>
            <kbd>Ctrl</kbd>+<kbd>Entrée</kbd> pour envoyer
          </>
        )}
        <span className="composer__disclaimer"> · Mathis AI peut se tromper, vérifie les infos importantes.</span>
      </p>
    </div>
  );
});

export default Composer;

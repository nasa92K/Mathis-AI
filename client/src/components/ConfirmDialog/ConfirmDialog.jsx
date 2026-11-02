import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

/** Fenêtre de confirmation accessible (Échap pour annuler, focus géré). */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    cancelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCancelRef.current();
      }
      if (event.key === 'Tab') {
        // Piège de focus simple entre les boutons du dialogue
        const focusables = dialogRef.current?.querySelectorAll('button');
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={onCancel}>
      <div
        ref={dialogRef}
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`dialog__icon ${danger ? 'is-danger' : ''}`}>
          <AlertTriangle size={20} />
        </div>
        <h2 id="dialog-title" className="dialog__title">
          {title}
        </h2>
        <p id="dialog-description" className="dialog__description">
          {description}
        </p>
        <div className="dialog__actions">
          <button ref={cancelRef} type="button" className="dialog__btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`dialog__btn dialog__btn--primary ${danger ? 'is-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

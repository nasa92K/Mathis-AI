import { useEffect, useRef, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog.jsx';
import { formatRelativeDate } from '../../utils/helpers.js';
import './Sidebar.css';

function ConversationItem({ conversation, index, active, generating, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    if (draft.trim()) onRename(conversation.id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="conv-item is-editing">
        <form
          className="conv-item__edit"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <input
            ref={inputRef}
            className="conv-item__input"
            value={draft}
            maxLength={80}
            aria-label="Nouveau titre de la conversation"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                setEditing(false);
              }
            }}
          />
          <button type="submit" className="icon-btn icon-btn--sm" aria-label="Enregistrer le titre">
            <Check size={15} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            aria-label="Annuler le renommage"
            onClick={() => setEditing(false)}
          >
            <X size={15} />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className={`conv-item ${active ? 'is-active' : ''}`}>
      <button
        type="button"
        className="conv-item__main"
        onClick={() => onSelect(conversation.id)}
        aria-current={active ? 'true' : undefined}
        title={conversation.title}
      >
        <span className="conv-item__num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="conv-item__text">
          <span className="conv-item__title">{conversation.title}</span>
          <span className="conv-item__date">
            {generating ? (
              <span className="conv-item__live">● Mathis écrit…</span>
            ) : (
              formatRelativeDate(conversation.updatedAt)
            )}
          </span>
        </span>
      </button>
      <div className="conv-item__actions">
        <button
          type="button"
          className="icon-btn icon-btn--sm"
          aria-label={`Renommer « ${conversation.title} »`}
          onClick={() => {
            setDraft(conversation.title);
            setEditing(true);
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--sm icon-btn--danger"
          aria-label={`Supprimer « ${conversation.title} »`}
          onClick={() => onDelete(conversation)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}

/** Historique des conversations (colonne à gauche du chat, tiroir sur mobile). */
export default function Sidebar({
  open,
  conversations,
  activeId,
  generatingId,
  onNewConversation,
  onSelect,
  onRename,
  onDelete,
  onClose,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Historique des conversations">
        <div className="sidebar__header">
          <p className="eyebrow">
            <span className="slashes">//</span>Historique
          </p>
          <button type="button" className="icon-btn sidebar__close" aria-label="Fermer l'historique" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <button type="button" className="pill sidebar__new" onClick={onNewConversation}>
          <Plus size={17} />
          Nouvelle conversation
        </button>

        <nav className="sidebar__history" aria-label="Conversations enregistrées">
          {conversations.length === 0 ? (
            <p className="sidebar__empty">Aucune conversation pour l'instant. Le moteur est chaud, lance-toi.</p>
          ) : (
            <ul className="sidebar__list">
              {conversations.map((conversation, index) => (
                <ConversationItem
                  key={conversation.id}
                  index={index}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  generating={conversation.id === generatingId}
                  onSelect={onSelect}
                  onRename={onRename}
                  onDelete={setPendingDelete}
                />
              ))}
            </ul>
          )}
        </nav>

        <p className="sidebar__footnote">Sauvegardé uniquement dans ce navigateur.</p>
      </aside>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        danger
        title="Supprimer cette conversation ?"
        description={`« ${pendingDelete?.title ?? ''} » sera définitivement supprimée de cet appareil.`}
        confirmLabel="Supprimer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
}

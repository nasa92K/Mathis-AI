import { useEffect, useRef, useState } from 'react';
import { Check, MessageSquare, Pencil, Plus, Settings, Trash2, X } from 'lucide-react';
import Logo from '../Brand/Logo.jsx';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog.jsx';
import { formatRelativeDate } from '../../utils/helpers.js';
import './Sidebar.css';

function ConversationItem({ conversation, active, generating, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEditing = () => {
    setDraft(conversation.title);
    setEditing(true);
  };

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
              if (event.key === 'Escape') setEditing(false);
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
        aria-current={active ? 'page' : undefined}
        title={conversation.title}
      >
        <MessageSquare size={15} className="conv-item__icon" aria-hidden="true" />
        <span className="conv-item__text">
          <span className="conv-item__title">{conversation.title}</span>
          <span className="conv-item__date">
            {generating ? 'Mathis écrit…' : formatRelativeDate(conversation.updatedAt)}
          </span>
        </span>
      </button>
      <div className="conv-item__actions">
        <button
          type="button"
          className="icon-btn icon-btn--sm"
          aria-label={`Renommer « ${conversation.title} »`}
          onClick={startEditing}
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

export default function Sidebar({
  open,
  conversations,
  activeId,
  generatingId,
  view,
  onNewConversation,
  onSelect,
  onRename,
  onDelete,
  onOpenSettings,
  onClose,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Barre latérale">
        <div className="sidebar__header">
          <Logo />
          <button type="button" className="icon-btn sidebar__close" aria-label="Fermer le menu" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <button type="button" className="sidebar__new" onClick={onNewConversation}>
          <Plus size={18} />
          Nouvelle conversation
        </button>

        <nav className="sidebar__history" aria-label="Historique des conversations">
          <p className="sidebar__label">Historique</p>
          {conversations.length === 0 ? (
            <p className="sidebar__empty">Aucune conversation pour l'instant. Lance-toi 👋</p>
          ) : (
            <ul className="sidebar__list">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  active={view === 'chat' && conversation.id === activeId}
                  generating={conversation.id === generatingId}
                  onSelect={onSelect}
                  onRename={onRename}
                  onDelete={setPendingDelete}
                />
              ))}
            </ul>
          )}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className={`sidebar__settings ${view === 'settings' ? 'is-active' : ''}`}
            onClick={onOpenSettings}
            aria-current={view === 'settings' ? 'page' : undefined}
          >
            <Settings size={17} />
            Paramètres
          </button>
          <p className="sidebar__slogan">Built different. Powered by AI.</p>
        </div>
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

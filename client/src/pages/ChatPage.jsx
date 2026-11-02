import { useState } from 'react';
import { AlertTriangle, History, SquarePen } from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar.jsx';
import WelcomeScreen from '../components/Welcome/WelcomeScreen.jsx';
import MessageList from '../components/Chat/MessageList.jsx';
import Composer from '../components/Composer/Composer.jsx';
import '../components/Chat/Chat.css';
import './ChatPage.css';

const UNAVAILABLE_STATUSES = new Set(['not_configured', 'server_down', 'offline']);

/** Page du chatbot : historique à gauche, discussion à droite. */
export default function ChatPage({ store, chat, settings, health, composerRef, onNewConversation }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { activeConversation } = store;
  const hasMessages = Boolean(activeConversation?.messages.length);

  const startNew = () => {
    setHistoryOpen(false);
    onNewConversation();
  };

  const handleDelete = (id) => {
    if (chat.generatingId === id) chat.stop();
    store.deleteConversation(id);
  };

  return (
    <div className="chat-page">
      <Sidebar
        open={historyOpen}
        conversations={store.conversations}
        activeId={store.activeId}
        generatingId={chat.generatingId}
        onNewConversation={startNew}
        onSelect={(id) => {
          store.setActiveId(id);
          setHistoryOpen(false);
          requestAnimationFrame(() => composerRef.current?.focus());
        }}
        onRename={store.renameConversation}
        onDelete={handleDelete}
        onClose={() => setHistoryOpen(false)}
      />

      <section className="chat-main" aria-label="Discussion avec Mathis AI">
        <div className="chat-toolbar">
          <button
            type="button"
            className="icon-btn chat-toolbar__history"
            onClick={() => setHistoryOpen(true)}
            aria-label="Afficher l'historique"
            aria-expanded={historyOpen}
          >
            <History size={19} />
          </button>
          <h2 className="chat-toolbar__title" title={hasMessages ? activeConversation.title : undefined}>
            <span className="slashes">//</span>
            {hasMessages ? activeConversation.title : 'Nouvelle conversation'}
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={startNew}
            aria-label="Nouvelle conversation"
            title="Nouvelle conversation (Ctrl+Maj+O)"
          >
            <SquarePen size={18} />
          </button>
        </div>

        {hasMessages ? (
          <MessageList
            conversation={activeConversation}
            isGenerating={chat.isGenerating}
            onRegenerate={chat.regenerate}
            smoothTyping={settings.smoothTyping}
          />
        ) : (
          <div className="chat-main__welcome">
            <WelcomeScreen onSuggestion={(text) => chat.sendMessage(text)} disabled={chat.isGenerating} />
          </div>
        )}

        {UNAVAILABLE_STATUSES.has(health.status) && (
          <div className="service-banner" role="status">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>{health.message}</span>
          </div>
        )}

        <Composer
          ref={composerRef}
          onSend={(text) => chat.sendMessage(text)}
          onStop={chat.stop}
          isGenerating={chat.isGenerating}
          enterToSend={settings.enterToSend}
        />
      </section>
    </div>
  );
}

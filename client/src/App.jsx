import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Menu, SquarePen } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import WelcomeScreen from './components/Welcome/WelcomeScreen.jsx';
import MessageList from './components/Chat/MessageList.jsx';
import Composer from './components/Composer/Composer.jsx';
import SettingsPage from './components/Settings/SettingsPage.jsx';
import StatusIndicator from './components/Status/StatusIndicator.jsx';
import { useConversations } from './hooks/useConversations.js';
import { useSettings } from './hooks/useSettings.js';
import { useHealth } from './hooks/useHealth.js';
import { useChat } from './hooks/useChat.js';
import './App.css';

const UNAVAILABLE_STATUSES = new Set(['not_configured', 'server_down', 'offline']);

export default function App() {
  const store = useConversations();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { health, refreshHealth } = useHealth();
  const chat = useChat({ store, settings });

  const [view, setView] = useState('chat'); // 'chat' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const composerRef = useRef(null);

  const { activeConversation } = store;
  const hasMessages = Boolean(activeConversation?.messages.length);

  const focusComposer = () => requestAnimationFrame(() => composerRef.current?.focus());

  const handleNewConversation = useCallback(() => {
    store.setActiveId(null); // la conversation est créée au premier message
    setView('chat');
    setSidebarOpen(false);
    focusComposer();
  }, [store]);

  const handleSelect = (id) => {
    store.setActiveId(id);
    setView('chat');
    setSidebarOpen(false);
    focusComposer();
  };

  const handleDelete = (id) => {
    if (chat.generatingId === id) chat.stop();
    store.deleteConversation(id);
  };

  const handleClearHistory = () => {
    chat.stop();
    store.clearAllConversations();
  };

  // Raccourcis clavier globaux
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && chat.isGenerating) {
        event.preventDefault();
        chat.stop();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        handleNewConversation();
        return;
      }
      const target = event.target;
      const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (event.key === '/' && !typing && view === 'chat') {
        event.preventDefault();
        composerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chat, handleNewConversation, view]);

  // Titre de l'onglet
  useEffect(() => {
    const title = view === 'settings' ? 'Paramètres' : hasMessages ? activeConversation.title : null;
    document.title = title ? `${title} · MATHIS AI` : 'MATHIS AI';
  }, [view, activeConversation?.title, hasMessages]);

  const headerTitle =
    view === 'settings' ? 'Paramètres' : hasMessages ? activeConversation.title : 'Nouvelle conversation';

  return (
    <div className="app">
      <Sidebar
        open={sidebarOpen}
        conversations={store.conversations}
        activeId={store.activeId}
        generatingId={chat.generatingId}
        view={view}
        onNewConversation={handleNewConversation}
        onSelect={handleSelect}
        onRename={store.renameConversation}
        onDelete={handleDelete}
        onOpenSettings={() => {
          setView('settings');
          setSidebarOpen(false);
        }}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn topbar__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
          <h2 className="topbar__title" title={headerTitle}>
            {headerTitle}
          </h2>
          <div className="topbar__actions">
            <StatusIndicator health={health} onRefresh={refreshHealth} compact />
            <button
              type="button"
              className="icon-btn topbar__new"
              onClick={handleNewConversation}
              aria-label="Nouvelle conversation"
              title="Nouvelle conversation"
            >
              <SquarePen size={18} />
            </button>
          </div>
        </header>

        {view === 'settings' ? (
          <SettingsPage
            settings={settings}
            onUpdateSetting={updateSetting}
            onResetSettings={resetSettings}
            health={health}
            onRefreshHealth={refreshHealth}
            conversationCount={store.conversations.length}
            onClearHistory={handleClearHistory}
            onBack={() => {
              setView('chat');
              focusComposer();
            }}
          />
        ) : (
          <>
            {hasMessages ? (
              <MessageList
                conversation={activeConversation}
                isGenerating={chat.isGenerating}
                onRegenerate={chat.regenerate}
                smoothTyping={settings.smoothTyping}
              />
            ) : (
              <div className="main__welcome">
                <WelcomeScreen onSuggestion={chat.sendMessage} disabled={chat.isGenerating} />
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
              onSend={chat.sendMessage}
              onStop={chat.stop}
              isGenerating={chat.isGenerating}
              enterToSend={settings.enterToSend}
            />
          </>
        )}
      </main>
    </div>
  );
}

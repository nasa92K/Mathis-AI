import { useCallback, useEffect, useRef } from 'react';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import GaragePage from './pages/GaragePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import SettingsPage from './components/Settings/SettingsPage.jsx';
import { useConversations } from './hooks/useConversations.js';
import { useSettings } from './hooks/useSettings.js';
import { useHealth } from './hooks/useHealth.js';
import { useChat } from './hooks/useChat.js';
import { useHashRoute } from './hooks/useHashRoute.js';
import './App.css';

const PAGE_TITLES = {
  accueil: null,
  garage: 'Le Garage',
  chat: 'Chat',
  'a-propos': 'À propos',
  parametres: 'Paramètres',
};

export default function App() {
  const [route, navigate] = useHashRoute();
  const store = useConversations();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { health, refreshHealth } = useHealth();
  const chat = useChat({ store, settings });
  const composerRef = useRef(null);
  const mainRef = useRef(null);

  const focusComposer = () => requestAnimationFrame(() => composerRef.current?.focus());

  const startNewConversation = useCallback(() => {
    store.setActiveId(null); // la conversation est créée au premier message
    navigate('chat');
    focusComposer();
  }, [store, navigate]);

  /** Suggestion cliquée depuis l'accueil ou le garage : nouvelle conversation dans le chat. */
  const askFromPage = useCallback(
    (prompt) => {
      if (chat.sendMessage(prompt, { newConversation: true })) navigate('chat');
    },
    [chat, navigate],
  );

  // Raccourcis clavier globaux
  const { isGenerating, stop } = chat;
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && isGenerating) {
        event.preventDefault();
        stop();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        startNewConversation();
        return;
      }
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (event.key === '/' && !typing && route === 'chat') {
        event.preventDefault();
        composerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGenerating, stop, startNewConversation, route]);

  // Titre de l'onglet + focus sur le contenu à chaque changement de page (lecteurs d'écran)
  const conversationTitle = store.activeConversation?.messages.length ? store.activeConversation.title : null;
  useEffect(() => {
    const title = route === 'chat' ? conversationTitle ?? 'Chat' : PAGE_TITLES[route];
    document.title = title ? `${title} · MATHIS AI` : 'MATHIS AI — Built different. Powered by AI.';
  }, [route, conversationTitle]);

  useEffect(() => {
    if (route === 'chat') focusComposer();
    else mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  let page;
  switch (route) {
    case 'garage':
      page = <GaragePage onAsk={askFromPage} isGenerating={chat.isGenerating} />;
      break;
    case 'chat':
      page = (
        <ChatPage
          store={store}
          chat={chat}
          settings={settings}
          health={health}
          composerRef={composerRef}
          onNewConversation={startNewConversation}
        />
      );
      break;
    case 'a-propos':
      page = <AboutPage health={health} />;
      break;
    case 'parametres':
      page = (
        <SettingsPage
          settings={settings}
          onUpdateSetting={updateSetting}
          onResetSettings={resetSettings}
          health={health}
          onRefreshHealth={refreshHealth}
          conversationCount={store.conversations.length}
          onClearHistory={() => {
            chat.stop();
            store.clearAllConversations();
          }}
          onBack={() => navigate('chat')}
        />
      );
      break;
    default:
      page = <HomePage onAsk={askFromPage} isGenerating={chat.isGenerating} />;
  }

  const isChat = route === 'chat';

  return (
    <div className={`site ${isChat ? 'site--chat' : ''}`}>
      <a href="#contenu" className="skip-link" onClick={(event) => {
        event.preventDefault();
        mainRef.current?.focus();
      }}>
        Aller au contenu
      </a>
      <Navbar route={route} health={health} onRefreshHealth={refreshHealth} />
      <main id="contenu" ref={mainRef} tabIndex={-1} className="site__main">
        {page}
      </main>
      {!isChat && <Footer />}
    </div>
  );
}

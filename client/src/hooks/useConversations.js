import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STORAGE_KEYS, loadJSON, removeKey, saveJSON } from '../utils/storage.js';
import { createId } from '../utils/helpers.js';

/**
 * Format d'une conversation :
 * { id, title, createdAt, updatedAt, messages: Message[] }
 *
 * Format d'un message :
 * { id, role: 'user'|'assistant', content, createdAt,
 *   status: 'done'|'streaming'|'stopped'|'error', error?: { code, message } }
 */

function loadConversations() {
  const stored = loadJSON(STORAGE_KEYS.conversations, []);
  if (!Array.isArray(stored)) return [];

  // Une génération coupée par un rafraîchissement de page ne doit pas rester "en cours".
  return stored.map((conversation) => ({
    ...conversation,
    messages: (conversation.messages ?? []).map((message) =>
      message.status === 'streaming'
        ? message.content
          ? { ...message, status: 'stopped' }
          : {
              ...message,
              status: 'error',
              error: { code: 'interrupted', message: 'La génération a été interrompue (page rechargée).' },
            }
        : message,
    ),
  }));
}

export function useConversations() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => loadJSON(STORAGE_KEYS.activeId, null));

  // Sauvegarde différée (évite d'écrire à chaque morceau de texte reçu)
  const latest = useRef(conversations);
  latest.current = conversations;

  useEffect(() => {
    const timer = setTimeout(() => saveJSON(STORAGE_KEYS.conversations, conversations), 400);
    return () => clearTimeout(timer);
  }, [conversations]);

  useEffect(() => {
    const flush = () => saveJSON(STORAGE_KEYS.conversations, latest.current);
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.activeId, activeId);
  }, [activeId]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  const createConversation = useCallback(() => {
    const now = Date.now();
    const conversation = {
      id: createId(),
      title: 'Nouvelle conversation',
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation.id);
    return conversation;
  }, []);

  const updateConversation = useCallback((id, updater) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  const patchMessage = useCallback((conversationId, messageId, updater) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? updater(m) : m)) }
          : c,
      ),
    );
  }, []);

  const renameConversation = useCallback((id, title) => {
    const clean = title.trim().slice(0, 80);
    if (!clean) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: clean } : c)));
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    removeKey(STORAGE_KEYS.conversations);
  }, []);

  return {
    conversations: sortedConversations,
    activeConversation,
    activeId,
    setActiveId,
    createConversation,
    updateConversation,
    patchMessage,
    renameConversation,
    deleteConversation,
    clearAllConversations,
  };
}

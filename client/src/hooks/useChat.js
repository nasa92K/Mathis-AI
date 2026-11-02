import { useCallback, useRef, useState } from 'react';
import { streamChat } from '../api/chatApi.js';
import { createId, makeTitle, toApiHistory } from '../utils/helpers.js';

function newMessage(role, content, status = 'done') {
  return { id: createId(), role, content, status, createdAt: Date.now() };
}

/**
 * Gère l'envoi des messages, le streaming, l'arrêt et la régénération.
 */
export function useChat({ store, settings }) {
  const { activeConversation, createConversation, updateConversation, patchMessage } = store;

  // id de la conversation en cours de génération (null si aucune)
  const [generatingId, setGeneratingId] = useState(null);
  const controllerRef = useRef(null);

  /** Lance une génération pour `assistantId` à partir de l'historique `baseMessages`. */
  const generate = useCallback(
    async (conversationId, baseMessages, assistantId) => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setGeneratingId(conversationId);

      // Les morceaux reçus sont regroupés puis appliqués ~25 fois par seconde.
      let pending = '';
      let flushTimer = null;
      const flush = () => {
        flushTimer = null;
        if (!pending) return;
        const chunk = pending;
        pending = '';
        // Le texte arrive : la recherche web est terminée.
        patchMessage(conversationId, assistantId, (m) => ({ ...m, content: m.content + chunk, searching: null }));
      };

      // Recherche web : requête en cours, sources consultées, recherche indisponible.
      const onMeta = (event) => {
        patchMessage(conversationId, assistantId, (m) => {
          if (event.type === 'status') return { ...m, searching: { query: event.query ?? null } };
          if (event.type === 'sources') {
            const known = new Set((m.sources ?? []).map((s) => s.url));
            const fresh = event.sources.filter((s) => !known.has(s.url));
            return { ...m, sources: [...(m.sources ?? []), ...fresh] };
          }
          if (event.type === 'search_unavailable') return { ...m, searchUnavailable: true };
          return m;
        });
      };

      try {
        await streamChat({
          messages: toApiHistory(baseMessages),
          responseStyle: settings.responseStyle,
          signal: controller.signal,
          onDelta: (text) => {
            pending += text;
            if (!flushTimer) flushTimer = setTimeout(flush, 40);
          },
          onMeta,
        });
        clearTimeout(flushTimer);
        flush();
        patchMessage(conversationId, assistantId, (m) => ({ ...m, status: 'done', searching: null }));
      } catch (error) {
        clearTimeout(flushTimer);
        flush();
        if (error.name === 'AbortError') {
          patchMessage(conversationId, assistantId, (m) => ({ ...m, status: 'stopped', searching: null }));
        } else {
          patchMessage(conversationId, assistantId, (m) => ({
            ...m,
            status: 'error',
            searching: null,
            error: { code: error.code ?? 'unknown_error', message: error.message },
          }));
        }
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
        setGeneratingId(null);
        updateConversation(conversationId, (c) => ({ ...c, updatedAt: Date.now() }));
      }
    },
    [patchMessage, updateConversation, settings.responseStyle],
  );

  /**
   * Envoie un message. Avec { newConversation: true }, démarre une nouvelle
   * conversation (utilisé par les suggestions de l'accueil et du garage).
   */
  const sendMessage = useCallback(
    (text, { newConversation = false } = {}) => {
      const content = text.trim();
      if (!content || generatingId) return false;

      const conversation =
        newConversation || !activeConversation ? createConversation() : activeConversation;
      const userMessage = newMessage('user', content);
      const assistantMessage = newMessage('assistant', '', 'streaming');
      const isFirst = conversation.messages.length === 0;

      updateConversation(conversation.id, (c) => ({
        ...c,
        title: isFirst ? makeTitle(content) : c.title,
        updatedAt: Date.now(),
        messages: [...c.messages, userMessage, assistantMessage],
      }));

      generate(conversation.id, [...conversation.messages, userMessage], assistantMessage.id);
      return true;
    },
    [activeConversation, createConversation, updateConversation, generate, generatingId],
  );

  /** Remplace la dernière réponse de Mathis par une nouvelle génération. */
  const regenerate = useCallback(() => {
    if (!activeConversation || generatingId) return;
    const messages = activeConversation.messages;
    const lastIndex = messages.length - 1;
    if (lastIndex < 0 || messages[lastIndex].role !== 'assistant') return;

    const base = messages.slice(0, lastIndex);
    if (!base.some((m) => m.role === 'user')) return;

    const assistantMessage = newMessage('assistant', '', 'streaming');
    updateConversation(activeConversation.id, (c) => ({
      ...c,
      messages: [...base, assistantMessage],
    }));
    generate(activeConversation.id, base, assistantMessage.id);
  }, [activeConversation, generatingId, updateConversation, generate]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return {
    sendMessage,
    regenerate,
    stop,
    isGenerating: generatingId !== null,
    generatingId,
  };
}

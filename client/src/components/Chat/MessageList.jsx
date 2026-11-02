import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import './Chat.css';

const NEAR_BOTTOM_PX = 120;

export default function MessageList({ conversation, isGenerating, onRegenerate, smoothTyping }) {
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const messages = conversation.messages;

  const scrollToBottom = (behavior = 'smooth') => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  // Nouvelle conversation affichée : on se place directement en bas.
  useLayoutEffect(() => {
    stickToBottom.current = true;
    scrollToBottom('auto');
  }, [conversation.id]);

  // Défilement automatique tant que l'utilisateur n'est pas remonté dans l'historique.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) el.scrollTop = el.scrollHeight;
    });
    const inner = el.firstElementChild;
    if (inner) observer.observe(inner);
    return () => observer.disconnect();
  }, [conversation.id]);

  // Envoyer un message ramène toujours en bas.
  const lastUserId = [...messages].reverse().find((m) => m.role === 'user')?.id;
  useEffect(() => {
    stickToBottom.current = true;
    scrollToBottom();
  }, [lastUserId]);

  const handleScroll = () => {
    const el = scrollRef.current;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < NEAR_BOTTOM_PX;
    setShowJump(distance > NEAR_BOTTOM_PX * 2);
  };

  const lastIndex = messages.length - 1;

  return (
    <div className="message-list-wrap">
      <div className="message-list" ref={scrollRef} onScroll={handleScroll}>
        <div className="message-list__inner" role="log" aria-label="Messages de la conversation">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === lastIndex}
              canRegenerate={!isGenerating}
              onRegenerate={onRegenerate}
              smoothTyping={smoothTyping}
            />
          ))}
        </div>
      </div>

      {showJump && (
        <button
          type="button"
          className="jump-bottom"
          onClick={() => {
            stickToBottom.current = true;
            scrollToBottom();
          }}
          aria-label="Aller au dernier message"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}

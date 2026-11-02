import { useEffect, useRef, useState } from 'react';

/**
 * Effet d'apparition progressive : révèle le texte reçu en streaming
 * de façon fluide, en rattrapant plus vite quand le retard augmente.
 */
export function useSmoothText(text, isStreaming, enabled) {
  const animate = enabled && isStreaming;
  const [count, setCount] = useState(() => (animate ? 0 : text.length));
  const countRef = useRef(count);

  useEffect(() => {
    if (!enabled) {
      countRef.current = text.length;
      setCount(text.length);
      return undefined;
    }
    if (countRef.current >= text.length) return undefined;

    let frame;
    const tick = () => {
      const remaining = text.length - countRef.current;
      if (remaining <= 0) return;
      // Pendant le streaming on lisse ; à la fin on termine rapidement.
      const step = Math.max(1, Math.ceil(remaining / (isStreaming ? 14 : 4)));
      countRef.current = Math.min(text.length, countRef.current + step);
      setCount(countRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, isStreaming, enabled]);

  return text.slice(0, Math.min(count, text.length));
}

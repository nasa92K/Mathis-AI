const LIGHTS = 8;

/** « Mathis AI réfléchit… » façon voyants de passage de rapport (shift lights). */
export default function TypingIndicator() {
  return (
    <div className="typing" role="status" aria-live="polite">
      <span className="shift-lights" aria-hidden="true">
        {Array.from({ length: LIGHTS }, (_, index) => (
          <span key={index} style={{ '--i': index }} className={index >= LIGHTS - 2 ? 'is-red' : ''} />
        ))}
      </span>
      <span className="typing__label">Mathis fait monter les tours…</span>
    </div>
  );
}

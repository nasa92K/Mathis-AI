/** Animation « Mathis AI réfléchit… ». */
export default function TypingIndicator() {
  return (
    <div className="typing" role="status" aria-live="polite">
      <span className="typing__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="typing__label">Mathis AI réfléchit…</span>
    </div>
  );
}

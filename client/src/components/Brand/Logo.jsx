import './Brand.css';

/** Logo texte « MATHIS // AI », italique façon logo de course. */
export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo--${size}`}>
      <span className="logo__name">MATHIS</span>
      <span className="logo__slash" aria-hidden="true">
        //
      </span>
      <span className="logo__ai">AI</span>
    </span>
  );
}

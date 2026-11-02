import MathisAvatar from './MathisAvatar.jsx';
import './Brand.css';

/** Logo compact (barre latérale) ou grand logo animé (page d'accueil). */
export default function Logo({ variant = 'compact' }) {
  if (variant === 'hero') {
    return (
      <div className="logo-hero">
        <div className="logo-hero__emblem" aria-hidden="true">
          <span className="logo-hero__ring" />
          <span className="logo-hero__ring logo-hero__ring--2" />
          <MathisAvatar size={72} />
        </div>
        <h1 className="logo-hero__title">
          MATHIS <span className="gradient-text logo-hero__ai">AI</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="logo-compact">
      <MathisAvatar size={32} />
      <span className="logo-compact__text">
        MATHIS <span className="gradient-text">AI</span>
      </span>
    </div>
  );
}

import Logo from '../Brand/Logo.jsx';
import MathisAvatar from '../Brand/MathisAvatar.jsx';
import './WelcomeScreen.css';

const SUGGESTIONS = [
  { emoji: '🚗', label: 'Parle-moi de la BMW M5 CS.', hint: 'Supercar' },
  { emoji: '🔧', label: 'Comment fonctionne un moteur V8 ?', hint: 'Mécanique' },
  { emoji: '✈️', label: "Parlons d'Ace Combat 8.", hint: 'Aviation' },
  { emoji: '💬', label: 'Surprends-moi avec un sujet.', hint: 'Au hasard' },
];

export default function WelcomeScreen({ onSuggestion, disabled }) {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome__hero">
        <Logo variant="hero" />
        <p id="welcome-title" className="welcome__subtitle">
          Ton assistant IA, passionné de moteurs, d'aviation et de tout ce qui est incroyable.
        </p>
      </div>

      <div className="welcome__greeting">
        <MathisAvatar size={34} />
        <p className="welcome__bubble">
          Yo, moi c'est Mathis AI 👋. Btw, tu veux parler de voitures, d'Ace Combat ou simplement me poser une
          question ? Je suis là.
        </p>
      </div>

      <ul className="welcome__suggestions" aria-label="Suggestions de conversation">
        {SUGGESTIONS.map((suggestion, index) => (
          <li key={suggestion.label} style={{ animationDelay: `${120 + index * 70}ms` }}>
            <button
              type="button"
              className="suggestion"
              disabled={disabled}
              onClick={() => onSuggestion(suggestion.label)}
            >
              <span className="suggestion__emoji" aria-hidden="true">
                {suggestion.emoji}
              </span>
              <span className="suggestion__body">
                <span className="suggestion__hint">{suggestion.hint}</span>
                <span className="suggestion__label">{suggestion.label}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

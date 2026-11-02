import MathisAvatar from '../Brand/MathisAvatar.jsx';
import './WelcomeScreen.css';

const SUGGESTIONS = [
  { emoji: '🚗', label: 'Parle-moi de la BMW M5 CS.', hint: 'Supercar' },
  { emoji: '🔧', label: 'Comment fonctionne un moteur V8 ?', hint: 'Mécanique' },
  { emoji: '✈️', label: "Parlons d'Ace Combat 8.", hint: 'Aviation' },
  { emoji: '💬', label: 'Surprends-moi avec un sujet.', hint: 'Au hasard' },
];

/** Écran affiché dans le chat quand la conversation est vide. */
export default function WelcomeScreen({ onSuggestion, disabled }) {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome__head">
        <MathisAvatar size={88} />
        <p className="eyebrow">
          <span className="slashes">//</span>Moteur chaud, prêt à partir
        </p>
        <h1 id="welcome-title" className="welcome__title">
          On parle de quoi&nbsp;?
        </h1>
      </div>

      <p className="welcome__bubble">
        Yo, moi c'est Mathis AI 👋. Btw, tu veux parler de voitures, d'Ace Combat ou simplement me poser une question ?
        Je suis là.
      </p>

      <ul className="welcome__suggestions" aria-label="Suggestions de conversation">
        {SUGGESTIONS.map((suggestion, index) => (
          <li key={suggestion.label} style={{ animationDelay: `${150 + index * 70}ms` }}>
            <button
              type="button"
              className="suggestion"
              disabled={disabled}
              onClick={() => onSuggestion(suggestion.label)}
            >
              <span className="suggestion__hint">
                <span aria-hidden="true">{suggestion.emoji}</span> {suggestion.hint}
              </span>
              <span className="suggestion__label">{suggestion.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

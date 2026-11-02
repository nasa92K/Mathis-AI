import { ArrowRight } from 'lucide-react';
import portraitUrl from '../assets/mathis-portrait.jpg';
import './shared.css';
import './AboutPage.css';

const EXPRESSIONS = ['tbh', 'btw', 'frérot', 'mdrr', 'en vrai', "c'est une dinguerie", 'ça régale', 'clairement un banger'];

const TRAITS = [
  { title: 'Décontracté', text: "Il parle comme un pote, pas comme une notice d'entretien." },
  { title: 'Précis', text: "Il ne s'invente jamais de fiche technique et dit quand il n'est pas sûr." },
  { title: 'Taquin', text: "Un humour un peu sarcastique, qu'il range quand le sujet est sérieux." },
  { title: 'Curieux', text: 'Voitures, avions, code, sciences : il aime comprendre comment ça marche.' },
];

export default function AboutPage({ health }) {
  return (
    <div className="about">
      <header className="page-header">
        <p className="eyebrow">
          <span className="slashes">//</span>Qui est Mathis&nbsp;?
        </p>
        <h1 className="page-header__title">À propos</h1>
      </header>

      <section className="about__intro">
        <figure className="about__portrait">
          <img src={portraitUrl} alt="Portrait de Mathis AI en combinaison de course, dans un stand." />
          <figcaption>
            <span className="slashes">//</span>Mathis AI, au stand
          </figcaption>
        </figure>

        <div className="about__text">
          <p className="about__lead">
            Mathis AI, c'est un assistant avec une vraie personnalité : drôle, cultivé, et complètement accro aux
            moteurs.
          </p>
          <p>
            Il peut te comparer deux supercars, t'expliquer un double embrayage, t'aider à diagnostiquer un bruit
            suspect ou débattre du meilleur chasseur d'Ace Combat. Et si tu lui parles de maths ou de code, il suit
            aussi.
          </p>
          <p className="about__honest">
            <strong>Transparence :</strong> Mathis AI est un personnage d'assistant virtuel propulsé par une
            intelligence artificielle. Ce n'est pas un humain, et ses réponses peuvent contenir des erreurs : vérifie
            les informations importantes.
          </p>

          <ul className="about__expressions" aria-label="Expressions de Mathis">
            {EXPRESSIONS.map((expression) => (
              <li key={expression}>« {expression} »</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about__traits" aria-labelledby="traits-title">
        <h2 id="traits-title" className="sr-only">
          Traits de caractère
        </h2>
        {TRAITS.map((trait, index) => (
          <article key={trait.title} className="trait">
            <span className="trait__num">0{index + 1}</span>
            <h3 className="trait__title">{trait.title}</h3>
            <p>{trait.text}</p>
          </article>
        ))}
      </section>

      <section className="about__engine" aria-labelledby="engine-title">
        <div>
          <p className="eyebrow">
            <span className="slashes">//</span>Sous le capot
          </p>
          <h2 id="engine-title" className="section__title">
            Comment ça tourne.
          </h2>
        </div>
        <dl className="specs__list about__stack">
          <div className="specs__row">
            <dt>Interface</dt>
            <dd>React + Vite</dd>
          </div>
          <div className="specs__row">
            <dt>Serveur</dt>
            <dd>Node.js + Express</dd>
          </div>
          <div className="specs__row">
            <dt>Modèle d'IA</dt>
            <dd>{health.model ?? 'Défini côté serveur'}</dd>
          </div>
          <div className="specs__row">
            <dt>Historique</dt>
            <dd>Stocké dans ton navigateur</dd>
          </div>
        </dl>
      </section>

      <section className="cta" aria-labelledby="about-cta">
        <h2 id="about-cta" className="cta__title">
          On roule&nbsp;?
        </h2>
        <a href="#/chat" className="pill pill--solid cta__btn">
          Parler à Mathis <ArrowRight size={17} />
        </a>
      </section>
    </div>
  );
}

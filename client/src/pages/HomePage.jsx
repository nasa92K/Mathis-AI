import { ArrowDown, ArrowRight } from 'lucide-react';
import portraitUrl from '../assets/mathis-portrait.jpg';
import RevCounter from '../components/Decor/RevCounter.jsx';
import './shared.css';
import './HomePage.css';

const MARQUEE = [
  'S58 biturbo',
  'V8 AMG 4.0',
  '2JZ-GTE',
  'RB26DETT',
  'V10 Huracán',
  'Flat-6 GT3 RS',
  'V12 Revuelto',
  'VR38DETT',
  'F-22 Raptor',
  'Rafale',
  'Ace Combat 8',
];

const SPECS = [
  { label: 'Moteur', value: 'IA générative' },
  { label: 'Transmission', value: 'Réponses en temps réel' },
  { label: 'Couple', value: 'Humour sarcastique, max' },
  { label: 'Spécialités', value: 'Auto · Méca · Aviation' },
  { label: 'Carrosserie', value: 'React + Vite' },
  { label: 'Contrôle technique', value: 'Infos vérifiées sur le web' },
  { label: 'Consommation', value: '0 L / 100 km' },
];

const PROMPTS = [
  { tag: 'Supercar', text: 'Parle-moi de la BMW M5 CS.' },
  { tag: 'Mécanique', text: 'Comment fonctionne un moteur V8 ?' },
  { tag: 'Aviation', text: "Parlons d'Ace Combat 8." },
  { tag: 'Au hasard', text: 'Surprends-moi avec un sujet.' },
];

export default function HomePage({ onAsk, isGenerating }) {
  return (
    <div className="home">
      {/* ─── Hero ─── */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__media" aria-hidden="true">
          <img src={portraitUrl} alt="" className="hero__photo" />
        </div>

        <div className="hero__content">
          <h1 id="hero-title" className="hero__title">
            Là où les moteurs rugissent au rythme de l'IA
          </h1>

          <div className="hero__side">
            <p className="hero__tagline">
              <span className="slashes">//</span>
              <span>Discute avec Mathis AI, ton copilote passionné de supercars, de mécanique et d'aviation.</span>
            </p>
            <div className="hero__actions">
              <a href="#/chat" className="pill pill--solid">
                Démarrer le moteur <ArrowRight size={17} />
              </a>
              <a href="#/garage" className="pill">
                Visiter le garage
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="hero__scroll"
          onClick={() => document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ArrowDown size={16} /> Défiler
        </button>
      </section>

      {/* ─── Bandeau défilant ─── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...MARQUEE, ...MARQUEE].map((item, index) => (
            <span key={index} className="marquee__item">
              {item}
              <span className="marquee__sep">//</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Concept ─── */}
      <section id="concept" className="section concept" aria-labelledby="concept-title">
        <p className="eyebrow">
          <span className="slashes">01</span>Le concept
        </p>
        <h2 id="concept-title" className="concept__statement">
          Pas un assistant froid. Un pote qui connaît le S58 par cœur, t'explique un turbo en deux phrases et parle
          d'Ace Combat jusqu'à trois heures du mat'.
        </h2>
      </section>

      {/* ─── Fiche technique ─── */}
      <section className="section specs" aria-labelledby="specs-title">
        <div className="specs__gauge">
          <RevCounter />
        </div>
        <div className="specs__body">
          <p className="eyebrow">
            <span className="slashes">02</span>Fiche technique
          </p>
          <h2 id="specs-title" className="section__title">
            Mathis AI, version route.
          </h2>
          <dl className="specs__list">
            {SPECS.map((spec) => (
              <div key={spec.label} className="specs__row">
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── Suggestions ─── */}
      <section className="section prompts" aria-labelledby="prompts-title">
        <p className="eyebrow">
          <span className="slashes">03</span>Lance un sujet
        </p>
        <h2 id="prompts-title" className="section__title">
          Un clic, et c'est parti.
        </h2>
        <ul className="prompts__grid">
          {PROMPTS.map((prompt, index) => (
            <li key={prompt.text}>
              <button
                type="button"
                className="prompt-card"
                disabled={isGenerating}
                onClick={() => onAsk(prompt.text)}
              >
                <span className="prompt-card__top">
                  <span className="prompt-card__num">0{index + 1}</span>
                  <span className="prompt-card__tag">{prompt.tag}</span>
                </span>
                <span className="prompt-card__text">{prompt.text}</span>
                <span className="prompt-card__go">
                  Demander <ArrowRight size={15} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Appel à l'action ─── */}
      <section className="cta" aria-labelledby="cta-title">
        <h2 id="cta-title" className="cta__title">
          Prêt à démarrer&nbsp;?
        </h2>
        <a href="#/chat" className="pill pill--solid cta__btn">
          Ouvrir le chat <ArrowRight size={17} />
        </a>
      </section>
    </div>
  );
}

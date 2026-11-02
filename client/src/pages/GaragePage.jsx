import { ArrowRight, Wrench } from 'lucide-react';
import './shared.css';
import './GaragePage.css';

const BAYS = [
  {
    title: 'Supercars & constructeurs',
    text: 'Fiches, comparatifs, générations, versions spéciales : Mathis distingue les chiffres constructeur, les préparations et les estimations.',
    chips: ['BMW M', 'Mercedes-AMG', 'Audi RS', 'Porsche', 'Ferrari', 'Lamborghini', 'Nissan GT-R', 'Toyota Supra', 'McLaren', 'Koenigsegg'],
    prompt: 'Compare-moi la Ferrari 296 GTB et la Porsche 911 Turbo S.',
  },
  {
    title: 'Mécanique & préparation',
    text: "Du cycle à quatre temps à la reprog' d'un calculateur, expliqué simplement, puis en détail si tu veux creuser.",
    chips: ['Atmo / turbo / compresseur', 'V6 · V8 · V10 · V12', 'Boîtes DCT', 'Différentiel', 'ECU', 'Freins', 'Aéro', 'Tuning'],
    prompt: 'Explique-moi la différence entre un turbo et un compresseur.',
  },
  {
    title: 'Aviation & Ace Combat',
    text: "Chasseurs, réacteurs, aérodynamique, et toute la saga Ace Combat. Pour Ace Combat 8, il sépare l'officiel des rumeurs.",
    chips: ['F-22 Raptor', 'F-35', 'Rafale', 'Su-57', 'Typhoon', 'Réacteurs', 'Ace Combat'],
    prompt: "C'est quoi ton avion préféré dans Ace Combat, et pourquoi ?",
  },
  {
    title: 'Tout le reste',
    text: "Code, maths, sciences, culture G, jeux vidéo ou conseils pratiques : il ne ramène pas tout aux voitures (enfin, presque).",
    chips: ['Programmation', 'Maths & sciences', 'Culture G', 'Jeux vidéo', 'Conseils'],
    prompt: 'Aide-moi à comprendre les promesses en JavaScript.',
  },
];

export default function GaragePage({ onAsk, isGenerating }) {
  return (
    <div className="garage">
      <header className="page-header">
        <p className="eyebrow">
          <span className="slashes">//</span>Expertise
        </p>
        <h1 className="page-header__title">Le Garage</h1>
        <p className="page-header__lead">
          Quatre baies, une seule passion : comprendre comment les choses fonctionnent. Choisis un sujet, Mathis
          s'occupe du reste.
        </p>
      </header>

      <ol className="bays">
        {BAYS.map((bay, index) => (
          <li key={bay.title} className="bay" style={{ animationDelay: `${index * 80}ms` }}>
            <span className="bay__num" aria-hidden="true">
              0{index + 1}
            </span>
            <div className="bay__body">
              <h2 className="bay__title">{bay.title}</h2>
              <p className="bay__text">{bay.text}</p>
              <ul className="bay__chips" aria-label={`Sujets : ${bay.title}`}>
                {bay.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="pill bay__ask"
              disabled={isGenerating}
              onClick={() => onAsk(bay.prompt)}
              title={bay.prompt}
            >
              Demander à Mathis <ArrowRight size={16} />
            </button>
          </li>
        ))}
      </ol>

      <section className="diagnostic" aria-labelledby="diag-title">
        <Wrench size={28} className="diagnostic__icon" aria-hidden="true" />
        <div className="diagnostic__body">
          <h2 id="diag-title" className="diagnostic__title">
            Diagnostic express
          </h2>
          <p>
            Un bruit bizarre, un voyant allumé, une perte de puissance ? Décris les symptômes : Mathis pose les bonnes
            questions et te dit quand il faut filer chez un pro.
          </p>
        </div>
        <button
          type="button"
          className="pill pill--solid"
          disabled={isGenerating}
          onClick={() => onAsk("J'ai un voyant moteur orange allumé sur le tableau de bord, qu'est-ce que ça peut être ?")}
        >
          Lancer un diagnostic <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

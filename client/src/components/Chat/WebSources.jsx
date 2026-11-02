import { ArrowUpRight, Globe, Search } from 'lucide-react';

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** « Mathis vérifie ses sources… » pendant la recherche web. */
export function SearchIndicator({ query }) {
  return (
    <div className="search-indicator" role="status" aria-live="polite">
      <Search size={15} className="search-indicator__icon" aria-hidden="true" />
      <span className="search-indicator__label">Mathis vérifie ses sources</span>
      {query && <span className="search-indicator__query">« {query} »</span>}
    </div>
  );
}

/** Liste des pages réellement consultées (fournies par la recherche, jamais écrites par le modèle). */
export function SourceList({ sources }) {
  return (
    <section className="sources" aria-label="Sources consultées">
      <p className="sources__title">
        <Globe size={14} aria-hidden="true" />
        <span className="slashes">//</span>Sources consultées
      </p>
      <ol className="sources__list">
        {sources.map((source, index) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link" title={source.url}>
              <span className="source-link__num">{String(index + 1).padStart(2, '0')}</span>
              <span className="source-link__text">
                <span className="source-link__title">{source.title}</span>
                <span className="source-link__domain">{domainOf(source.url)}</span>
              </span>
              <ArrowUpRight size={15} className="source-link__arrow" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Texte copié dans le presse-papiers : la réponse suivie de ses sources. */
export function withSourcesText(content, sources) {
  if (!sources?.length) return content;
  const list = sources.map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join('\n');
  return `${content}\n\nSources :\n${list}`;
}

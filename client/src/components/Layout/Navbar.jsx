import { useEffect, useState } from 'react';
import { Menu, Settings, X } from 'lucide-react';
import Logo from '../Brand/Logo.jsx';
import StatusIndicator from '../Status/StatusIndicator.jsx';
import './Layout.css';

export const NAV_LINKS = [
  { route: 'accueil', label: 'Accueil' },
  { route: 'garage', label: 'Le Garage' },
  { route: 'chat', label: 'Chat' },
  { route: 'a-propos', label: 'À propos' },
];

export default function Navbar({ route, health, onRefreshHealth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Ferme le menu mobile quand on change de page ou qu'on appuie sur Échap
  useEffect(() => setMenuOpen(false), [route]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="navbar">
      <a href="#/accueil" className="navbar__brand" aria-label="Mathis AI, accueil">
        <Logo />
      </a>

      <nav className={`navbar__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigation principale">
        <ul className="navbar__links">
          {NAV_LINKS.map((link, index) => (
            <li key={link.route} style={{ '--i': index }}>
              <a
                href={`#/${link.route}`}
                className={`pill navbar__link ${route === link.route ? 'is-active' : ''}`}
                aria-current={route === link.route ? 'page' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar__tools">
        <StatusIndicator health={health} onRefresh={onRefreshHealth} compact />
        <a
          href="#/parametres"
          className={`icon-btn navbar__settings ${route === 'parametres' ? 'is-active' : ''}`}
          aria-label="Paramètres"
          title="Paramètres"
          aria-current={route === 'parametres' ? 'page' : undefined}
        >
          <Settings size={19} />
        </a>
        <button
          type="button"
          className="icon-btn navbar__burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

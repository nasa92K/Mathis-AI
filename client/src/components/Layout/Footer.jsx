import Logo from '../Brand/Logo.jsx';
import { NAV_LINKS } from './Navbar.jsx';
import './Layout.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Logo size="sm" />
          <p className="footer__slogan">
            <span className="slashes">//</span>Built different. Powered by AI.
          </p>
        </div>
        <nav aria-label="Liens du pied de page">
          <ul className="footer__links">
            {NAV_LINKS.map((link) => (
              <li key={link.route}>
                <a href={`#/${link.route}`}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href="#/parametres">Paramètres</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="footer__legal">
        Mathis AI est un assistant virtuel propulsé par une IA. Ses réponses peuvent contenir des erreurs.
      </p>
    </footer>
  );
}

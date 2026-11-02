import { useCallback, useEffect, useState } from 'react';

/**
 * Routage minimal basé sur le hash (#/garage, #/chat…).
 * Pas besoin de configuration serveur : fonctionne en local, sur Render et sur HubSpot.
 */
export const ROUTES = ['accueil', 'garage', 'chat', 'a-propos', 'parametres'];

function readRoute() {
  const slug = window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0];
  return ROUTES.includes(slug) ? slug : 'accueil';
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next) => {
    if (`#/${next}` === window.location.hash) return;
    window.location.hash = `/${next}`;
  }, []);

  return [route, navigate];
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Le thème global doit être chargé AVANT les composants pour que leurs styles le complètent.
import './styles/global.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

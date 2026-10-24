import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Styles first: the theme store reads CSS tokens as soon as it loads
import './styles/index.css';
import App from './App';

// We restore scroll ourselves after the preloader; the browser's restore fights the pins.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

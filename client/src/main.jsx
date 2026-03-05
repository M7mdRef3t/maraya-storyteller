import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './App.css';
import App from './App.jsx';
import DesignSystemPreview from './components/DesignSystemPreview.jsx';
import { startWebVitals } from './utils/webVitals.js';

const searchParams = new URLSearchParams(window.location.search);
const isDesignSystemPreview = searchParams.get('design-system') === '1';
const isStagingRuntime =
  window.location.hostname.includes('staging')
  || searchParams.get('staging') === '1';

if (isStagingRuntime) {
  startWebVitals();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDesignSystemPreview ? <DesignSystemPreview /> : <App />}
  </StrictMode>,
);

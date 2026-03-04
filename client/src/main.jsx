import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './App.css';
import App from './App.jsx';
import DesignSystemPreview from './components/DesignSystemPreview.jsx';

const searchParams = new URLSearchParams(window.location.search);
const isDesignSystemPreview = searchParams.get('design-system') === '1';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDesignSystemPreview ? <DesignSystemPreview /> : <App />}
  </StrictMode>,
);

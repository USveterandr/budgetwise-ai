import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { LanguageProvider } from './context/LanguageContext'; // Import LanguageProvider
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

// Immediate rendering for debugging
root.render(
  <React.StrictMode>
    <LanguageProvider> {/* Wrap App with LanguageProvider */}
      <BrowserRouter> {/* Wrap App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>
);

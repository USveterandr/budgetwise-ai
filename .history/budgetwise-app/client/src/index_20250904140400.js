import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { LanguageProvider } from './context/LanguageContext'; // Import LanguageProvider
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

// Immediate rendering for debugging
root.render(
  <React.StrictMode>
    <LanguageProvider> {/* Wrap App with LanguageProvider */}
      <AuthProvider> {/* Wrap App with AuthProvider */}
        <BrowserRouter> {/* Wrap App with BrowserRouter */}
          <App />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);

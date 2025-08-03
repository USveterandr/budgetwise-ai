import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { LanguageProvider } from './context/LanguageContext'; // Import LanguageProvider
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

// Defer rendering to potentially avoid conflicts with browser extensions
setTimeout(() => {
  root.render(
    <React.StrictMode>
      <LanguageProvider> {/* Wrap App with LanguageProvider */}
        <BrowserRouter> {/* Wrap App with BrowserRouter */}
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </React.StrictMode>
  );
}, 0); // A timeout of 0ms pushes it to the end of the current execution queue

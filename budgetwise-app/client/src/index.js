import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './components/providers/SessionProvider';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <SessionProvider>
          <TransactionProvider>
            <BudgetProvider>
              <CurrencyProvider>
                <SubscriptionProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </SubscriptionProvider>
              </CurrencyProvider>
            </BudgetProvider>
          </TransactionProvider>
        </SessionProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);

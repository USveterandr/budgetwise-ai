import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default language

  useEffect(() => {
    // On initial load, try to get language from localStorage
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Fallback to browser's language if available
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es', 'fr', 'de'].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('appLanguage', newLanguage); // Save to localStorage
    // In a real app, you might also trigger an API call or update a global state
    // that components use to fetch/display translated content.
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

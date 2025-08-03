import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext'; // We will create/update this context
import './LanguageSwitcher.css'; // Import the CSS file

const LanguageSwitcher = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // For now, we'll just reload the page to see the effect.
    // In a real app, you'd use a translation library and update text on the fly.
    // Or, you could navigate to a specific language route if you structure it that way.
    // For simplicity, let's assume we want to go to a page like /en, /es, etc.
    // This part needs to be aligned with how you structure your language URLs.
    // For now, we'll just reload to demonstrate state change.
    window.location.reload(); 
  };

  // Placeholder for actual translations
  const translations = {
    en: { name: 'English' },
    es: { name: 'Español' },
    fr: { name: 'Français' },
    de: { name: 'Deutsch' },
  };

  return (
    <div className="language-switcher">
      {Object.keys(translations).map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`lang-btn ${language === lang ? 'active' : ''}`}
          aria-label={`Switch to ${translations[lang].name}`}
        >
          {translations[lang].name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

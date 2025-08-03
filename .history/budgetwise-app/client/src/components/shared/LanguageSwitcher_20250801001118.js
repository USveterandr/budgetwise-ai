import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext'; // We will create/update this context
import './LanguageSwitcher.css'; // Import the CSS file

const LanguageSwitcher = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Navigate to the specific language page
    navigate(`/${newLanguage}`);
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

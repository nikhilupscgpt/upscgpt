"use client";

import React, { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

const translations = { en, hi, mr };

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  // Always start with 'en' to match SSR — avoids hydration mismatch
  const [lang, setLang] = useState('en');

  React.useEffect(() => {
    // After mount, read the saved language from localStorage
    const savedLang = window.localStorage.getItem('language');
    const resolvedLang = savedLang && translations[savedLang] ? savedLang : 'en';
    if (resolvedLang !== 'en') {
      setLang(resolvedLang);
    }
    document.cookie = `language=${resolvedLang}; path=/; max-age=31536000`;
  }, []);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem("language", newLang);
      document.cookie = `language=${newLang}; path=/; max-age=31536000`;
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (let k of keys) {
      if (value[k] === undefined) {
        return key; // Fallback to key if translation missing
      }
      value = value[k];
    }

    if (typeof value === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }

    return value;
  };

  return (
    <TranslationContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}

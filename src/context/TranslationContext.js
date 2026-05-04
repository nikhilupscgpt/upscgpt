"use client";

import React, { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

const translations = { en, hi, mr };

const TranslationContext = createContext();

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLang = window.localStorage.getItem("language");
  return savedLang && translations[savedLang] ? savedLang : "en";
}

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem("language", newLang);
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

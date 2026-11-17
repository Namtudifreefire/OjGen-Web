import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import vi from './translations/vi.json';
import en from './translations/en.json';

export type Language = 'vi' | 'en';

interface Translations {
  [key: string]: string | Translations;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tRich: (key: string, params?: Record<string, string | number>) => ReactNode;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translationsByLanguage = { vi, en } as unknown as Record<Language, Translations>;

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: Translations | string = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key] as Translations;
    } else {
      return path; // Return key as fallback
    }
  }

  return typeof current === 'string' ? current : path;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() ?? match;
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      let saved: string | null = null;
      try { saved = localStorage.getItem('ojgen-language') ?? localStorage.getItem('ojgen_lang'); } catch { /* Storage is optional. */ }
      if (saved === 'vi' || saved === 'en') return saved;
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('vi')) return 'vi';
    }
    return 'vi';
  });

  const setLanguage = (lang: Language) => {
    try { localStorage.setItem('ojgen-language', lang); } catch { /* Storage is optional. */ }
    document.documentElement.lang = lang;
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const template = getNestedValue(translationsByLanguage[language], key);
    return interpolate(template, params);
  };

  const tRich = (key: string, params?: Record<string, string | number>): ReactNode => {
    // For now, same as t but can be extended for rich text
    return t(key, params);
  };

  // Initialize document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    tRich
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, tRich, language, setLanguage } = useI18n();
  return { t, tRich, language, setLanguage };
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Translations } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  translateProblemTitle: (problemId: string, fallbackTitle?: string) => string;
  translateProblemCategory: (category: string) => string;
  translateParamLabel: (paramKey: string, fallbackLabel?: string) => string;
  translateTopicCategory: (cat: string) => string;
  translateTopicName: (name: string) => string;
  translateOptionLabel: (label: string) => string;
  strings: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ojgen_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'vi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const strings = translations[lang] || translations.vi;

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let cur: unknown = strings;
    for (const k of keys) {
      if (cur && typeof cur === 'object' && k in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[k];
      } else {
        // fallback to vietnamese if missing in current lang
        let fb: unknown = translations.vi;
        for (const fk of keys) {
          if (fb && typeof fb === 'object' && fk in (fb as Record<string, unknown>)) {
            fb = (fb as Record<string, unknown>)[fk];
          } else {
            fb = undefined;
            break;
          }
        }
        cur = fb ?? path;
        break;
      }
    }

    if (typeof cur !== 'string') {
      return path;
    }

    let res = cur;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return res;
  };

  const translateProblemTitle = (problemId: string, fallbackTitle?: string): string => {
    if (lang === 'vi') {
      return fallbackTitle || translations.vi.problemTitles[problemId as keyof typeof translations.vi.problemTitles] || problemId;
    }
    return translations.en.problemTitles[problemId as keyof typeof translations.en.problemTitles] || fallbackTitle || problemId;
  };

  const translateProblemCategory = (category: string): string => {
    if (lang === 'vi') return category;
    return translations.en.categories[category as keyof typeof translations.en.categories] || category;
  };

  const translateParamLabel = (paramKey: string, fallbackLabel?: string): string => {
    if (lang === 'vi') {
      return fallbackLabel || translations.vi.paramLabels[paramKey as keyof typeof translations.vi.paramLabels] || paramKey;
    }
    return translations.en.paramLabels[paramKey as keyof typeof translations.en.paramLabels] || fallbackLabel || paramKey;
  };

  const translateTopicCategory = (cat: string): string => {
    if (lang === 'vi') return cat;
    return translations.en.topics[cat as keyof typeof translations.en.topics] || cat;
  };

  const translateTopicName = (name: string): string => {
    if (lang === 'vi') return name;
    return translations.en.topics[name as keyof typeof translations.en.topics] || name;
  };

  const optionTranslations: Record<string, string> = {
    'Giá trị trong khoảng': 'Values in Range [minVal .. maxVal]',
    'Hoán vị 1..n': 'Permutation of 1..n',
    'Ngẫu nhiên': 'Random order',
    'Không giảm (tăng dần)': 'Non-decreasing (Ascending)',
    'Không tăng (giảm dần)': 'Non-increasing (Descending)',
    'Tự do': 'Arbitrary',
    'a <= b': 'a ≤ b',
    'a < b': 'a < b',
    '1 mảng': '1 array',
    '2 mảng song song': '2 parallel arrays',
    'Ngẫu nhiên bất kỳ': 'Arbitrary random tree',
    'Cây sao (Star)': 'Star tree',
    'Cây xích (Line)': 'Line / Bamboo tree',
    'Cây nhị phân': 'Binary tree',
    'Cây sâu (Deep)': 'Deep tree',
  };

  const translateOptionLabel = (label: string): string => {
    if (lang === 'vi') return label;
    return optionTranslations[label] || label;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        translateProblemTitle,
        translateProblemCategory,
        translateParamLabel,
        translateTopicCategory,
        translateTopicName,
        translateOptionLabel,
        strings,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

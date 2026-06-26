import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import ko from '../locales/ko.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const messages = { ko, en, fr };

export type Language = keyof typeof messages;
export const LANGUAGE_STORAGE_KEY = 'language';

export const getStoredLanguage = (): Language => {
  const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return language && language in messages ? language as Language : 'ko';
};

export const storeLanguage = (language: Language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

const getNestedValue = (source: unknown, key: string): string => {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, source);

  return typeof value === 'string' ? value : key;
};

export function useI18n() {
  const language = useSelector((state: RootState) => state.ui.language) as Language;

  return {
    language,
    t: (key: string) => getNestedValue(messages[language], key),
  };
}

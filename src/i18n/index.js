import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    returnObjects: true, // Enable returning arrays and objects from translations
    
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    
    ns: ['common', 'navigation', 'dashboard', 'forms', 'errors', 'login'], // Available namespaces
    defaultNS: 'common',
    
    // Optional: Add loading and error handling
    react: {
      useSuspense: false, // Set to false to avoid suspense issues
    },
  });

export default i18n;

/**
 * Font Management Hook - React Community Standard
 * Optimized for performance with memoization
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useFont = () => {
  const { i18n } = useTranslation();
  
  // Memoize computed values to prevent unnecessary re-renders
  return useMemo(() => {
    const isArabic = i18n.language === 'ar';
    
    return {
      // Primary font for body text and most content
      fontClass: isArabic ? 'font-arabic' : 'font-english',
      
      // Display font for headings (optional differentiation)
      displayFontClass: isArabic ? 'font-arabic' : 'font-display',
      
      // Language-aware text direction
      dirClass: isArabic ? 'rtl' : 'ltr',
      
      // Current language
      language: i18n.language,
      
      // Boolean helper for cleaner conditionals
      isArabic,
      
      // Helper function for conditional font classes
      getFont: (arabicFont = 'font-arabic', englishFont = 'font-english') => {
        return isArabic ? arabicFont : englishFont;
      }
    };
  }, [i18n.language]);
};

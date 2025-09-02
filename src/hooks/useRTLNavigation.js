/**
 * RTL Navigation Hook - Handles navigation logic for RTL languages
 * 
 * In RTL languages like Arabic, the concept of "next" and "previous" is visually inverted:
 * - Left arrow should go to next item (because reading flows right-to-left)
 * - Right arrow should go to previous item
 * 
 * This hook provides RTL-aware navigation functions and button configurations.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useRTLNavigation = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return useMemo(() => {
    const createNavigation = (items, currentIndex, setCurrentIndex) => {
      const totalItems = items?.length || 0;
      
      // Base navigation functions (always work the same logically)
      const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
      };
      
      const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
      };
      
      // RTL-aware button handlers
      // In RTL: left button = next, right button = previous
      // In LTR: left button = previous, right button = next
      const handleLeftButton = isRTL ? goToNext : goToPrevious;
      const handleRightButton = isRTL ? goToPrevious : goToNext;
      
      return {
        // Logical navigation (use these for programmatic navigation)
        goToNext,
        goToPrevious,
        
        // Button handlers (use these for UI buttons)
        handleLeftButton,
        handleRightButton,
        
        // Button configurations
        leftButtonIcon: isRTL ? 'ChevronRight' : 'ChevronLeft',
        rightButtonIcon: isRTL ? 'ChevronLeft' : 'ChevronRight',
        
        // Accessibility labels
        leftButtonLabel: isRTL ? 'next' : 'previous',
        rightButtonLabel: isRTL ? 'previous' : 'next',
        
        // Current state
        currentIndex,
        totalItems,
        canGoPrevious: totalItems > 1,
        canGoNext: totalItems > 1,
        isRTL
      };
    };

    return {
      createNavigation,
      isRTL
    };
  }, [isRTL]);
};

export default useRTLNavigation;

import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import t from '../../utils/i18n';

const LanguageToggle = ({ variant = 'ghost', size = 'sm' }) => {
  // Get current language state based on document direction
  const isRTL = document?.documentElement?.dir === 'rtl';
  
  const handleToggle = () => {
    // Toggle language by changing document direction and language
    const newDir = isRTL ? 'ltr' : 'rtl';
    const newLang = isRTL ? 'en' : 'ar';
    
    document.documentElement.dir = newDir;
    document.documentElement.lang = newLang;
    
    try {
      localStorage.setItem('lang', newLang);
    } catch (e) {
      // ignore localStorage errors
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
      title={t('header.toggle_language')}
      aria-label={t('header.toggle_language')}
    >
      <div className="flex items-center justify-center w-5 h-5">
        <Icon name="Globe" size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      {/* Language indicator */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
        <span className="text-[10px] font-semibold text-primary-foreground">
          {isRTL ? 'ع' : 'EN'}
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;

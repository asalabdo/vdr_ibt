import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';
import Button from './Button';

const LanguageToggle = ({ variant = 'ghost', size = 'sm' }) => {
  const { i18n, t } = useTranslation();
  
  const handleToggle = () => {
    const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage); // This handles localStorage automatically
    
    // Update document direction for RTL support
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
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
          {i18n.language === 'ar' ? 'ع' : 'EN'}
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;

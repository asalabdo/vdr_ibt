import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/Button';

const DarkModeToggle = ({ variant = 'ghost', size = 'sm' }) => {
  const { t } = useTranslation();
  
  // Theme state management (same logic as Header.jsx)
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return document?.documentElement?.classList?.contains('dark');
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  const handleToggle = () => {
    setIsDark((current) => !current);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group"
      title={t('header.toggle_theme')}
      aria-label={t('header.toggle_theme')}
    >
      <div className="flex items-center justify-center w-5 h-5">
        <div className="transform transition-all duration-300 group-hover:scale-110">
          <Icon 
            name={isDark ? 'Sun' : 'Moon'} 
            size={16} 
            className="text-muted-foreground group-hover:text-foreground transition-colors" 
          />
        </div>
      </div>
    </button>
  );
};

export default DarkModeToggle;

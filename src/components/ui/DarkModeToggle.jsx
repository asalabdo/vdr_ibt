import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/button';

const DarkModeToggle = ({ variant = 'ghost', size = 'sm' }) => {
  const { t } = useTranslation();
  
  // Auto-detect system theme or use stored preference
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      
      // Auto-detect system preference
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
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
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  const handleToggle = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Store user preference
    try {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
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

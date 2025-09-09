import React, { useEffect } from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Routes from "./Routes";
import { useFont } from "./hooks/useFont";
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { i18n } = useTranslation();
  const { fontClass, dirClass } = useFont();

  useEffect(() => {
    // Community Standard: Minimal DOM manipulation for semantic HTML only
    const documentElement = document.documentElement;
    
    // Set semantic HTML attributes (SEO & accessibility)
    documentElement.lang = i18n.language;
    documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // React Community Standard: Apply font via className wrapper
  return (
    <QueryClientProvider client={queryClient}>
      <div className={`${fontClass} ${dirClass}`}>
        <Routes />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;

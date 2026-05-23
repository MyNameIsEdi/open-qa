import { useState, useEffect } from 'react';
import i18n from '../i18n';

export function useRtl() {
  const [isRtl, setIsRtl] = useState(() => {
    const lang = localStorage.getItem('lang') ?? i18n.language;
    const rtl = lang === 'he';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    return rtl;
  });

  useEffect(() => {
    const handler = (lng: string) => {
      const rtl = lng === 'he';
      setIsRtl(rtl);
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  return isRtl;
}

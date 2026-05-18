import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import he from './locales/he.json'

const savedLang = typeof localStorage !== 'undefined' ? (localStorage.getItem('lang') ?? 'en') : 'en'

document.documentElement.dir = savedLang === 'he' ? 'rtl' : 'ltr'
document.documentElement.lang = savedLang

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

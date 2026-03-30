import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@locales/en/common.json';
import enCatalog from '@locales/en/catalog.json';
import enCheckout from '@locales/en/checkout.json';
import enProfile from '@locales/en/profile.json';

import ruCommon from '@locales/ru/common.json';
import ruCatalog from '@locales/ru/catalog.json';
import ruCheckout from '@locales/ru/checkout.json';
import ruProfile from '@locales/ru/profile.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, catalog: enCatalog, checkout: enCheckout, profile: enProfile },
    ru: { common: ruCommon, catalog: ruCatalog, checkout: ruCheckout, profile: ruProfile },
  },
  lng: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;

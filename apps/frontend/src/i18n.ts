import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@locales/en/common.json';
import enCatalog from '@locales/en/catalog.json';
import enCheckout from '@locales/en/checkout.json';
import enProfile from '@locales/en/profile.json';
import enAdmin from '@locales/en/admin.json';
import enAbout from '@locales/en/about.json';
import enPages from '@locales/en/pages.json';

import ruCommon from '@locales/ru/common.json';
import ruCatalog from '@locales/ru/catalog.json';
import ruCheckout from '@locales/ru/checkout.json';
import ruProfile from '@locales/ru/profile.json';
import ruAdmin from '@locales/ru/admin.json';
import ruAbout from '@locales/ru/about.json';
import ruPages from '@locales/ru/pages.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      catalog: enCatalog,
      checkout: enCheckout,
      profile: enProfile,
      admin: enAdmin,
      about: enAbout,
      pages: enPages,
    },
    ru: {
      common: ruCommon,
      catalog: ruCatalog,
      checkout: ruCheckout,
      profile: ruProfile,
      admin: ruAdmin,
      about: ruAbout,
      pages: ruPages,
    },
  },
  lng: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;

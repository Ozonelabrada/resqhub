/**
 * i18n Configuration
 * Setup for internationalization using i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'common.home': 'Home',
      'common.communities': 'Communities',
      'common.marketplace': 'Marketplace',
      'common.profile': 'Profile',
      'home.reportLostItem': 'Report Lost Item',
      'home.reportFoundItem': 'Report Found Item',
    },
  },
  tl: {
    translation: {
      'common.home': 'Tahanan',
      'common.communities': 'Komunidad',
      'common.marketplace': 'Merkado',
      'common.profile': 'Propil',
      'home.reportLostItem': 'Ulatin ang Nawawalang Item',
      'home.reportFoundItem': 'Ulatin ang Nahanap na Item',
    },
  },
  ceb: {
    translation: {
      'common.home': 'Balay',
      'common.communities': 'Komunidad',
      'common.marketplace': 'Merkado',
      'common.profile': 'Propil',
      'home.reportLostItem': 'Ulatan ang Nawawalang Item',
      'home.reportFoundItem': 'Ulatan ang Nahanap na Item',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

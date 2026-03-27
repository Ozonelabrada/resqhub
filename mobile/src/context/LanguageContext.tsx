/**
 * 🌍 Language Context
 * Manages multi-language support (EN, TL, CEB)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export type Language = 'en' | 'tl' | 'ceb';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Common
    'common.home': 'Home',
    'common.communities': 'Communities',
    'common.marketplace': 'Marketplace',
    'common.profile': 'Profile',
    'common.more': 'More',
    'common.search': 'Search',
    'common.report': 'Report',
    'common.info': 'Information',

    // Home
    'home.reportLostItem': 'Report Lost Item',
    'home.reportFoundItem': 'Report Found Item',
    'home.browseItems': 'Browse Items',
    'home.filterByType': 'Filter by Type',
    'home.allItems': 'All Items',
    'home.lostItems': 'Lost Items',
    'home.foundItems': 'Found Items',
    'home.noItems': 'No items found',
    'home.noItemsYet': 'No items yet',
    'home.checkLater': 'Check back later',
    'home.myReports': 'My Reports',

    // Shared
    'shared.community': 'Community',
    'shared.close': 'Close',
    'shared.cancel': 'Cancel',
    'shared.submit': 'Submit',
    'shared.loading': 'Loading...',
    'shared.error': 'Error',
    'shared.success': 'Success',
  },
  tl: {
    // Common
    'common.home': 'Tahanan',
    'common.communities': 'Komunidad',
    'common.marketplace': 'Merkado',
    'common.profile': 'Propil',
    'common.more': 'Marami pa',
    'common.search': 'Maghanap',
    'common.report': 'Ulat',
    'common.info': 'Impormasyon',

    // Home
    'home.reportLostItem': 'Ulatin ang Nawawalang Item',
    'home.reportFoundItem': 'Ulatin ang Nahanap na Item',
    'home.browseItems': 'Tuklasin ang mga Item',
    'home.filterByType': 'Saliin ayon sa Uri',
    'home.allItems': 'Lahat ng Item',
    'home.lostItems': 'Nawawalang Item',
    'home.foundItems': 'Nahanap na Item',
    'home.noItems': 'Walang item na natagpo',
    'home.noItemsYet': 'Walang item pa',
    'home.checkLater': 'Bumalik mamaya',
    'home.myReports': 'Ang Aking mga Ulat',

    // Shared
    'shared.community': 'Komunidad',
    'shared.close': 'Isara',
    'shared.cancel': 'Kanselahin',
    'shared.submit': 'Ipadala',
    'shared.loading': 'Nag-load...',
    'shared.error': 'Kakaibang Problema',
    'shared.success': 'Matagumpay',
  },
  ceb: {
    // Common
    'common.home': 'Balay',
    'common.communities': 'Komunidad',
    'common.marketplace': 'Merkado',
    'common.profile': 'Propil',
    'common.more': 'Daghang pa',
    'common.search': 'Paghanap',
    'common.report': 'Insidente',
    'common.info': 'Impormasyon',

    // Home
    'home.reportLostItem': 'Ulatan ang Nawawalang Item',
    'home.reportFoundItem': 'Ulatan ang Nahanap na Item',
    'home.browseItems': 'Tuklasin ang mga Item',
    'home.filterByType': 'Saliin sa Uri',
    'home.allItems': 'Lahat ng Item',
    'home.lostItems': 'Nawawalang Item',
    'home.foundItems': 'Nahanap na Item',
    'home.noItems': 'Walang item nahanap',
    'home.noItemsYet': 'Walang item pa',
    'home.checkLater': 'Balik sayon',
    'home.myReports': 'Ang Akong mga Ulat',

    // Shared
    'shared.community': 'Komunidad',
    'shared.close': 'Isara',
    'shared.cancel': 'Kanselahin',
    'shared.submit': 'I-send',
    'shared.loading': 'Nag-load...',
    'shared.error': 'Sayop',
    'shared.success': 'Matagumpay',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('en');

  // Initialize language on app startup
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem('language');
        const lang = (saved as Language) || 'en';
        setCurrentLanguageState(lang);
        i18n.changeLanguage(lang);
      } catch (error) {
        console.error('Language init error:', error);
      }
    };

    initLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setCurrentLanguageState(lang);
      i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    const dict = translations[currentLanguage];
    const value = dict[key as keyof typeof dict];
    return value || defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

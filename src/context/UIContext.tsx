import React, { createContext, useContext, useEffect, useState } from 'react';

type FontSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

interface UIContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => 
    (localStorage.getItem('resqhub-font-size') as FontSize) || 'medium'
  );

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('resqhub-font-size', size);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('font-size-xs', 'font-size-small', 'font-size-medium', 'font-size-large', 'font-size-xl');
    root.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  return (
    <UIContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

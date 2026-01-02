import { useState, useEffect } from 'react';

export const useScreenSize = () => {
  const [isBelowDesktop, setIsBelowDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsBelowDesktop(window.innerWidth < 1024); // 1024px is the desktop breakpoint
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return { isBelowDesktop };
};
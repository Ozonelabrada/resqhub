import { useState, useEffect } from 'react';
import { UI_CONSTANTS } from '../constants';

export const useScreenSize = () => {
  const [isBelowDesktop, setIsBelowDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsBelowDesktop(window.innerWidth < UI_CONSTANTS.DESKTOP_BREAKPOINT);
      setIsMobile(window.innerWidth < UI_CONSTANTS.MOBILE_BREAKPOINT);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return { isBelowDesktop, isMobile };
};

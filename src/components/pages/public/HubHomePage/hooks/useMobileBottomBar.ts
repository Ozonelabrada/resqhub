import { useState, useEffect } from 'react';

export const useMobileBottomBar = (isBelowDesktop: boolean) => {
  const [showBottomBar, setShowBottomBar] = useState(false);

  useEffect(() => {
    if (!isBelowDesktop) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Show when user is within 80px of the bottom
      setShowBottomBar(scrollY + windowHeight >= docHeight - 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBelowDesktop]);

  return { showBottomBar };
};
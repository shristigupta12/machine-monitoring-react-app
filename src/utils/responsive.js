import { useState, useEffect } from 'react';

// Hook to detect screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Utility function to get responsive class names
export const getResponsiveClasses = (mobile, tablet, desktop) => {
  return `${mobile} sm:${tablet} lg:${desktop}`;
};

// Utility function to get responsive spacing
export const getResponsiveSpacing = (mobile, tablet, desktop) => {
  return `p-${mobile} sm:p-${tablet} lg:p-${desktop}`;
};

// Utility function to get responsive text sizes
export const getResponsiveText = (mobile, tablet, desktop) => {
  return `text-${mobile} sm:text-${tablet} lg:text-${desktop}`;
};

// Utility function to check if device is touch
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Utility function to get optimal chart dimensions
export const getChartDimensions = (containerWidth, aspectRatio = 0.5) => {
  const maxWidth = 800;
  const minWidth = 300;
  const width = Math.max(minWidth, Math.min(containerWidth - 32, maxWidth));
  const height = Math.max(200, width * aspectRatio);
  return { width, height };
}; 
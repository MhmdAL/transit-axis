import { useState, useEffect } from 'react';

export const useCssLoaded = () => {
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    const checkCssLoaded = () => {
      // Check if fonts are loaded
      if (document.fonts) {
        document.fonts.ready.then(() => {
          // Additional check for styled-components
          const testElement = document.createElement('div');
          testElement.style.fontFamily = 'Inter, sans-serif';
          document.body.appendChild(testElement);
          
          const computedStyle = window.getComputedStyle(testElement);
          const fontFamily = computedStyle.fontFamily;
          
          document.body.removeChild(testElement);
          
          // Check if the font is actually loaded
          if (fontFamily.includes('Inter')) {
            setCssLoaded(true);
          } else {
            // Fallback timeout
            setTimeout(() => setCssLoaded(true), 500);
          }
        });
      } else {
        // Fallback for browsers that don't support document.fonts
        setTimeout(() => setCssLoaded(true), 300);
      }
    };

    checkCssLoaded();
  }, []);

  return cssLoaded;
};

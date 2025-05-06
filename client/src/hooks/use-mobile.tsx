import { useState, useEffect } from 'react';

// Custom hook to detect if the device is mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if the device is mobile (screen width less than 768px or touch is available)
    const checkMobile = () => {
      const hasTouchSupport = 'ontouchstart' in window || 
                              (window.navigator as any).maxTouchPoints > 0 ||
                              (window.navigator as any).msMaxTouchPoints > 0;
      const isMobileViewport = window.innerWidth < 768;
      setIsMobile(hasTouchSupport || isMobileViewport);
    };
    
    // Initial check
    checkMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return isMobile;
}
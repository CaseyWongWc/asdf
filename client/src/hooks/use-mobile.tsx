import { useState, useEffect, createContext, useContext } from 'react';

// Create context for managing display mode
interface MobileContextType {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
  toggleMode: () => void;
  isAutoDetect: boolean;
  setAutoDetect: (value: boolean) => void;
}

const MobileContext = createContext<MobileContextType>({
  isMobile: false,
  setIsMobile: () => {},
  toggleMode: () => {},
  isAutoDetect: true,
  setAutoDetect: () => {}
});

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoDetect, setAutoDetect] = useState(true);

  useEffect(() => {
    // Only run auto-detection if auto-detect is enabled
    if (!isAutoDetect) return;

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
  }, [isAutoDetect]);

  const toggleMode = () => {
    setIsMobile(!isMobile);
    // When manually toggled, disable auto-detection
    setAutoDetect(false);
  };

  return (
    <MobileContext.Provider value={{ isMobile, setIsMobile, toggleMode, isAutoDetect, setAutoDetect }}>
      {children}
    </MobileContext.Provider>
  );
}

// Legacy hook for backward compatibility
export function useIsMobile() {
  const context = useContext(MobileContext);
  return context.isMobile;
}

// New hook that provides access to the entire context
export function useMobileContext() {
  return useContext(MobileContext);
}
import { useEffect, useState } from "react";

export const useDevToolsOpen = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let detector: typeof import("devtools-detector") | null = null;
    
    const initDetector = async () => {
      try {
        detector = await import("devtools-detector");
        detector.addListener((isOpen) => {
          if (isOpen) {
            setIsDevToolsOpen(true);
            detector?.stop();
          }
        });
        detector.launch();
      } catch (error) {
        console.warn("DevTools detector failed to initialize:", error);
      }
    };
    
    initDetector();
    
    return () => {
      try {
        detector?.stop();
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);
  return { isDevToolsOpen };
};

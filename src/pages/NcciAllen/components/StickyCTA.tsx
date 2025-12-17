import { Button } from "./ui/button";
import { useEffect, useState } from "react";

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero section (approximately 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop: Top-right sticky pill */}
      <div className="hidden md:block fixed top-20 right-6 z-40 animate-fade-in">
        <Button 
          size="lg" 
          className="rounded-full shadow-lg"
          asChild
        >
          <a href="https://app.naviksha.co.in/auth" target="_blank" rel="noopener noreferrer">
            Start Now • Get Report
          </a>
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Clarity • Confidence • Direction
        </p>
      </div>

      {/* Mobile: Bottom sticky full-width bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-4 animate-fade-in">
        <Button 
          size="lg" 
          className="w-full"
          asChild
        >
          <a href="https://app.naviksha.co.in/auth" target="_blank" rel="noopener noreferrer">
            Start Now • Get Report
          </a>
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Clarity • Confidence • Direction
        </p>
      </div>
    </>
  );
};

export default StickyCTA;

import allenLogo from "../assets/allen-online-logo.png";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        <img src={allenLogo} alt="ALLEN Online" className="h-7 md:h-10" />
        
        <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-purple-500/10 to-primary/10 border-2 border-purple-500/30 rounded-full">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-600 to-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs md:text-sm">AI</span>
          </div>
          <div className="text-xs md:text-sm whitespace-nowrap">
            <span className="text-muted-foreground hidden sm:inline">Powered by </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-primary font-bold">
              Naviksha AI
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

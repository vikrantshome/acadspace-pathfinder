import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6" style={{ background: 'var(--hero-gradient)' }}>
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Career Compass
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Discover the career path that fits your unique strengths.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>15 minutes</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Top 3 career matches</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Instant report</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Trusted by 20L+ students</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center mb-4">
          <Button 
            size="lg" 
            className="text-lg px-8 w-full sm:w-auto"
            asChild
          >
            <a href="https://www.naviksha.co.in/auth" target="_blank" rel="noopener noreferrer">
              Start Now • Get Report
            </a>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">No payment required. Works on any device.</p>
      </div>
    </section>
  );
};

export default Hero;

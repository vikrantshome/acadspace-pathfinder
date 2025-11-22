import { Button } from "./ui/button";

const CTASection = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
          Your future deserves better clarity.
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Get your personalised career matches and roadmap today.
        </p>
        <Button size="lg" className="text-lg px-12 mb-2" asChild>
          <a href="https://www.naviksha.co.in/auth" target="_blank" rel="noopener noreferrer">
            Start Now • Get Report
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">Clarity • Confidence • Direction</p>
      </div>
    </section>
  );
};

export default CTASection;

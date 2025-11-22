import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const ProcessSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
          Discover what you're made for.
        </h2>
        <p className="text-lg text-center text-muted-foreground mb-16 max-w-4xl mx-auto">
          The Career Compass Test helps you explore your interests, strengths, and learning preferences through a professionally curated, AI-enabled assessment. Get instant insights into careers aligned with your natural strengths.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💪</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Know your strengths</h3>
                <p className="text-muted-foreground">Understand your natural abilities and preferences</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Explore careers that fit you</h3>
                <p className="text-muted-foreground">Discover paths aligned with your profile</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">See your learning roadmap</h3>
                <p className="text-muted-foreground">Get a personalized path to success</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" className="text-lg px-8 mb-2" asChild>
            <a href="https://www.naviksha.co.in/auth" target="_blank" rel="noopener noreferrer">
              Start Now • Get Report
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">Clarity • Confidence • Direction</p>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const HowItWorksSection = () => {
  return (
    <section className="py-20 px-6 bg-section-bg">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
          Your journey to career clarity, simplified.
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 mt-16">
          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <p className="text-muted-foreground">
                  Take the test at your school or online (15 mins).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <p className="text-muted-foreground">
                  Our curated AI analyses your responses instantly.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <p className="text-muted-foreground">
                  Get your personalised report with strengths & fit scores.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <p className="text-muted-foreground">
                  Explore Allen Online Courses for your Chosen Path
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" className="text-lg px-8 mb-2" asChild>
            <a href="https://app.naviksha.co.in/auth" target="_blank" rel="noopener noreferrer">
              Start Now • Get Report
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">Clarity • Confidence • Direction</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

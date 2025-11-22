import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { GraduationCap, FlaskConical, Stethoscope } from "lucide-react";

const CoursesSection = () => {
  return (
    <section className="py-20 px-6 bg-section-bg">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
          Turn your career clarity into academic success.
        </h2>
        <p className="text-lg text-center text-muted-foreground mb-16 max-w-4xl mx-auto">
          Whatever your goal—science, medicine, or technology—ALLEN Online offers structured learning paths to support your chosen direction.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:border-primary transition-colors">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Classes 6–10</h3>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://allen.in/classes-6-10" target="_blank" rel="noopener noreferrer">
                    Explore Foundation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">JEE</h3>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://allen.in/jee" target="_blank" rel="noopener noreferrer">
                    Explore JEE
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">NEET</h3>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://allen.in/neet" target="_blank" rel="noopener noreferrer">
                    Explore NEET
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

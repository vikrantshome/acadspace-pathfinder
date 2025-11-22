import { Card, CardContent } from "./ui/card";

const LegacySection = () => {
  return (
    <section className="py-20 px-6 bg-section-bg">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
          37 years of student-first excellence, now powered by digital intelligence.
        </h2>
        <p className="text-lg text-center text-muted-foreground mb-16 max-w-4xl mx-auto">
          ALLEN has shaped millions of success stories. Now, with ALLEN Online, that legacy meets technology—combining expert mentorship, smart insights, and personalised learning to help every student find their path.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="text-4xl font-bold text-primary mb-2">20L+</div>
              <p className="text-muted-foreground">Trusted by students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="text-4xl font-bold text-primary mb-2">4,000+</div>
              <p className="text-muted-foreground">Selections in IIT-JEE & NEET-UG</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,000+</div>
              <p className="text-muted-foreground">Olympiad qualifications</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale">
          <div className="text-2xl font-bold text-foreground">ALLEN</div>
          <div className="text-2xl font-bold text-foreground">ALLEN Online</div>
          <div className="text-2xl font-bold text-foreground">Naviksha</div>
        </div>
      </div>
    </section>
  );
};

export default LegacySection;

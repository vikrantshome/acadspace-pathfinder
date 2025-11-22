import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

const CareerFitSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
          Your career clarity in one view.
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Donut Chart Visual */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  strokeDasharray="196"
                  strokeDashoffset="49"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">78%</div>
                  <div className="text-sm text-muted-foreground">fit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Career Match Cards */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">Data Science</h3>
                  <span className="text-sm text-muted-foreground">78–85%</span>
                </div>
                <Progress value={81} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">Computer Engineering</h3>
                  <span className="text-sm text-muted-foreground">70–76%</span>
                </div>
                <Progress value={73} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">Biomedical</h3>
                  <span className="text-sm text-muted-foreground">60–66%</span>
                </div>
                <Progress value={63} className="h-2" />
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center pt-4">
              Your top 3 matched careers with fit scores
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerFitSection;

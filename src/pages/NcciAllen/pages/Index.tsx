import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import StickyCTA from "../components/StickyCTA";
import LegacySection from "../components/LegacySection";
import ProcessSection from "../components/ProcessSection";
import HowItWorksSection from "../components/HowItWorksSection";
import CareerFitSection from "../components/CareerFitSection";
import CoursesSection from "../components/CoursesSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <StickyCTA />
      <LegacySection />
      <ProcessSection />
      <HowItWorksSection />
      <CareerFitSection />
      <CoursesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;

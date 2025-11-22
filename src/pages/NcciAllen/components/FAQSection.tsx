import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQSection = () => {
  return (
    <section className="py-20 px-6 bg-section-bg">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-center text-muted-foreground mb-12">
          Everything you need to know about the Career Compass Test
        </p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              What is the Career Compass Test?
            </AccordionTrigger>
            <AccordionContent>
              The Career Compass Test is a comprehensive, AI-enabled career assessment designed to help students discover career paths that align with their unique strengths, interests, and learning preferences. It takes just 15 minutes to complete and provides instant, personalized results with your top 3 career matches.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              How can I take the Career Compass Test?
            </AccordionTrigger>
            <AccordionContent>
              You can take the Career Compass Test at your school under teacher guidance, and online through this ALLEN Online portal{" "}
              <a 
                href="https://www.naviksha.co.in/auth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                here
              </a>
              . The test is accessible on any device and requires no payment.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              How do I access my Career Compass Test report?
            </AccordionTrigger>
            <AccordionContent>
              Once you complete the Career Compass Test, you'll receive your personalized report instantly. The report includes your top 3 career matches with fit scores, detailed strengths analysis, and a customized learning roadmap. If you have already taken the test, you can access the report{" "}
              <a 
                href="https://www.naviksha.co.in/auth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                here
              </a>
              .
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">
              How accurate is the Career Compass Test?
            </AccordionTrigger>
            <AccordionContent>
              ALLEN Online has partnered with Naviksha AI, an advanced artificial intelligence engine trained on thousands of career profiles and student data to bring you a carefully curated report. Sophisticated algorithms are used to match your responses with suitable career paths. The testing framework, questions, and career mapping have been developed and validated by ALLEN Online's team of expert psychologists and educators with 37+ years of experience. You get the best of both worlds: cutting-edge AI technology combined with human expertise.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">
              What will I learn from my Career Compass Test results?
            </AccordionTrigger>
            <AccordionContent>
              Your Career Compass Test results provide a comprehensive view of your career potential, including: your work personality and natural strengths, top 3 career matches with fit percentages (e.g., 78-85%), detailed analysis of why each career suits you, recommended subjects and skills to develop, and a personalized learning roadmap with ALLEN Online courses aligned to your goals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left">
              Is the Career Compass Test free?
            </AccordionTrigger>
            <AccordionContent>
              Yes! The Career Compass Test is completely free to take. There are no hidden costs or payment requirements. Simply start the test and receive your personalized career report instantly at no charge.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;

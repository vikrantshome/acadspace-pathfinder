const Footer = () => {
  return (
    <footer className="bg-section-bg py-12 px-6 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="https://allen.in/about-us" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About ALLEN</a>
              <a href="https://allen.in/ultimate-program-live-courses" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Allen Online Courses</a>
              <a href="https://allen.in/news" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">News</a>
              <a href="https://allen.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:ainaviksha@gmail.com" className="hover:text-primary transition-colors">Email: ainaviksha@gmail.com</a>
              <a href="tel:9674255951" className="hover:text-primary transition-colors">Phone: 9674255951</a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mb-6 opacity-40 grayscale">
          <div className="text-xl font-bold text-foreground">ALLEN</div>
          <div className="text-xl font-bold text-foreground">ALLEN Online</div>
          <div className="text-xl font-bold text-foreground">Naviksha</div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          © 2024 ALLEN Digital. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

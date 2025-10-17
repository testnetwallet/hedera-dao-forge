import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      
      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 HederaDAO. Built for decentralized governance.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center space-y-8 shadow-card">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Build Your <span className="gradient-text">DAO</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the future of decentralized governance. Create your organization, empower your community, and make decisions together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button variant="hero" size="xl" className="group">
                Get Started Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="xl" className="group">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </div>

            {/* Stats Footer */}
            <div className="pt-8 border-t border-border/30">
              <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <div>
                  <span className="text-2xl font-bold text-foreground gradient-text">~$0.0001</span>
                  <span className="block mt-1">per transaction</span>
                </div>
                <div className="w-px bg-border"></div>
                <div>
                  <span className="text-2xl font-bold text-foreground gradient-text">10,000+</span>
                  <span className="block mt-1">TPS capacity</span>
                </div>
                <div className="w-px bg-border"></div>
                <div>
                  <span className="text-2xl font-bold text-foreground gradient-text">Carbon Negative</span>
                  <span className="block mt-1">network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

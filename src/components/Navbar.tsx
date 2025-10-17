import { Button } from "@/components/ui/button";
import { Hexagon, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(217,91%,60%)] flex items-center justify-center shadow-lg shadow-primary/20">
              <Hexagon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">HederaDAO</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#docs" className="text-sm font-medium hover:text-primary transition-colors">
              Documentation
            </a>
            <Button variant="ghost" size="sm">
              Connect Wallet
            </Button>
            <Button variant="hero" size="sm">
              Launch App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#docs" className="text-sm font-medium hover:text-primary transition-colors">
                Documentation
              </a>
              <Button variant="ghost" size="sm" className="w-full">
                Connect Wallet
              </Button>
              <Button variant="hero" size="sm" className="w-full">
                Launch App
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

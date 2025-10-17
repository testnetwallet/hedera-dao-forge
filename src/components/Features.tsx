import { Coins, FileText, Zap, Lock, Users, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "Token-Weighted Voting",
    description: "Governance tokens give members voting power proportional to their stake, ensuring fair representation.",
  },
  {
    icon: FileText,
    title: "Transparent Proposals",
    description: "All proposals are recorded on Hedera Consensus Service, providing immutable and ordered records.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "Smart contracts automatically execute approved proposals with sub-second finality.",
  },
  {
    icon: Lock,
    title: "Secure & Auditable",
    description: "Enterprise-grade security with full transparency and verifiable on-chain records.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Empower your community to make decisions collectively and shape the future together.",
  },
  {
    icon: TrendingUp,
    title: "Low Cost Operations",
    description: "Hedera's efficiency means transactions cost fractions of a cent, not dollars.",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Choose Our <span className="gradient-text">DAO Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on Hedera's cutting-edge technology for unparalleled speed, security, and sustainability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-8 hover:shadow-card transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { Wallet, Vote, CheckCircle2, Rocket } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your Hedera wallet and receive governance tokens to participate in the DAO.",
    number: "01",
  },
  {
    icon: Vote,
    title: "Submit Proposal",
    description: "Create proposals for funding, changes, or initiatives. All members can contribute ideas.",
    number: "02",
  },
  {
    icon: CheckCircle2,
    title: "Vote & Decide",
    description: "Cast your vote with your tokens. Transparent tallying ensures fairness and accuracy.",
    number: "03",
  },
  {
    icon: Rocket,
    title: "Auto-Execute",
    description: "Approved proposals are automatically executed via smart contracts. No manual intervention.",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to decentralized decision-making
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Connector Line (hidden on last item and mobile) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              )}

              <div className="glass-card rounded-2xl p-8 hover:shadow-card transition-all duration-300 relative z-10">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold shadow-lg shadow-primary/30">
                  {step.number}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(217,91%,60%)] flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

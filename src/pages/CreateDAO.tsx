import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Coins, FileText, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CreateDAO = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a DAO",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    initialSupply: "",
    quorumPercentage: "51",
    votingPeriod: "7",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a DAO",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const response = await supabase.functions.invoke('create-dao', {
        body: formData,
      });

      if (response.error) throw response.error;

      toast({
        title: "DAO Created Successfully!",
        description: `${formData.name} is now live on Hedera`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error creating DAO:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create DAO",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Create Your <span className="gradient-text">DAO</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Launch your decentralized organization in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Coins, title: "Governance Token", desc: "Issue voting tokens" },
              { icon: FileText, title: "Proposal System", desc: "Track decisions" },
              { icon: Shield, title: "Smart Treasury", desc: "Automated execution" },
            ].map((feature, idx) => (
              <Card key={idx} className="glass-card border-border/30">
                <CardContent className="pt-6 text-center">
                  <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle>DAO Configuration</CardTitle>
              <CardDescription>
                Set up your governance parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">DAO Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Hedera Community DAO"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input
                      id="symbol"
                      name="symbol"
                      placeholder="HCDAO"
                      value={formData.symbol}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your DAO's mission and goals..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="initialSupply">Initial Supply</Label>
                    <Input
                      id="initialSupply"
                      name="initialSupply"
                      type="number"
                      placeholder="1000000"
                      value={formData.initialSupply}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quorumPercentage">Quorum (%)</Label>
                    <Input
                      id="quorumPercentage"
                      name="quorumPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.quorumPercentage}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="votingPeriod">Voting Period (days)</Label>
                    <Input
                      id="votingPeriod"
                      name="votingPeriod"
                      type="number"
                      min="1"
                      value={formData.votingPeriod}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating DAO..." : "Create DAO"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateDAO;
